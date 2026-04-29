import { AppOrderService } from './order';

function createRepository(seed: any[] = []) {
  const rows = seed.map(item => ({ ...item }));
  let nextId = rows.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

  return {
    rows,
    create(payload: any) {
      return {
        id: payload.id ?? nextId++,
        ...payload,
      };
    },
    async save(entity: any) {
      const index = rows.findIndex(item => item.id === entity.id);
      if (index >= 0) {
        rows[index] = { ...rows[index], ...entity };
      } else {
        rows.push({ ...entity });
      }
      return entity;
    },
    async find(options?: any) {
      const visitorKey = options?.where?.visitorKey;
      const filtered = visitorKey
        ? rows.filter(item => item.visitorKey === visitorKey)
        : [...rows];

      return filtered.sort((left, right) =>
        String(right.createTime ?? '').localeCompare(String(left.createTime ?? ''))
      );
    },
    async findOne(options: any) {
      const where = options?.where ?? {};
      return (
        rows.find(item =>
          Object.entries(where).every(([key, value]) => item[key] === value)
        ) ?? null
      );
    },
    async findOneBy(where: any) {
      return (
        rows.find(item =>
          Object.entries(where).every(([key, value]) => item[key] === value)
        ) ?? null
      );
    },
  };
}

function createService(visitorKey = 'visitor-a', seed: any[] = []) {
  const service = new AppOrderService() as any;
  const repository = createRepository(seed);

  service.appValuationOrderEntity = repository;
  service.appCosStorageService = {
    resolveDisplayUrl(value: string) {
      return value.startsWith('cos://')
        ? `https://preview.example.com/${value.slice('cos://'.length)}`
        : value;
    },
  };
  service.ctx = {
    get(headerName: string) {
      return headerName.toLowerCase() === 'x-visitor-key' ? visitorKey : '';
    },
  };

  return {
    service: service as AppOrderService,
    repository,
  };
}

describe('AppOrderService', () => {
  it('stores submitted valuation orders with visitor ownership and full snapshot', async () => {
    const { service, repository } = createService();

    const result = await service.submit({
      vehicleType: 'car',
      brandModel: '丰田 凯美瑞 2018',
      plateNumber: '粤A12345',
      plateRetention: true,
      wheelMaterial: 'aluminum',
      weightTons: 1.56,
      contactName: '张三',
      contactPhone: '13800138000',
      pickupAddress: '深圳市南山区科技园 1 号',
      pickupLatitude: 22.5405,
      pickupLongitude: 113.9345,
      vehiclePhotos: ['cos://car-platform-dev/visitors/visitor-a/valuation-orders/2026/04/car-1.jpg'],
    } as any);

    expect(result.currentStatus).toBe('submitted');
    expect(result.orderNo).toMatch(/^VR-/);
    expect(repository.rows).toHaveLength(1);
    expect(repository.rows[0]).toMatchObject({
      brandModel: '丰田 凯美瑞 2018',
      plateNumber: '粤A12345',
      wheelMaterial: 'aluminum',
      contactPhone: '13800138000',
      pickupAddress: '深圳市南山区科技园 1 号',
      vehiclePhotos: ['cos://car-platform-dev/visitors/visitor-a/valuation-orders/2026/04/car-1.jpg'],
      visitorKey: 'visitor-a',
    });
  });

  it('returns only the current visitor orders from myOrders', async () => {
    const { service } = createService('visitor-b', [
      {
        id: 1,
        orderNo: 'VR-1001-H5',
        currentStatus: 'submitted',
        brandModel: '比亚迪 汉',
        plateNumber: '粤B11111',
        contactName: '李四',
        contactPhone: '13800138001',
        pickupAddress: '广州天河',
        wheelMaterial: 'steel',
        plateRetention: false,
        vehicleType: 'car',
        vehiclePhotos: ['https://example.com/a.jpg'],
        visitorKey: 'visitor-a',
        createTime: '2026-04-22 09:30:00',
        timeline: [{ status: 'submitted', label: '已提交', time: '2026-04-22 09:30:00' }],
      },
      {
        id: 2,
        orderNo: 'VR-1002-H5',
        currentStatus: 'submitted',
        brandModel: '本田 雅阁',
        plateNumber: '粤B22222',
        contactName: '王五',
        contactPhone: '13800138002',
        pickupAddress: '广州海珠',
        wheelMaterial: 'aluminum',
        plateRetention: true,
        vehicleType: 'car',
        vehiclePhotos: ['https://example.com/b.jpg'],
        visitorKey: 'visitor-b',
        createTime: '2026-04-23 10:30:00',
        timeline: [{ status: 'submitted', label: '已提交', time: '2026-04-23 10:30:00' }],
      },
    ]);

    const orders = await service.myOrders();

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: '2',
      orderNo: 'VR-1002-H5',
      brandModel: '本田 雅阁',
      contactName: '王五',
      pickupAddress: '广州海珠',
    });
  });

  it('retries myOrders once after a transient database connection reset', async () => {
    const { service, repository } = createService('visitor-b', [
      {
        id: 2,
        orderNo: 'VR-1002-H5',
        currentStatus: 'submitted',
        brandModel: '本田 雅阁',
        plateNumber: '粤B22222',
        contactName: '王五',
        contactPhone: '13800138002',
        pickupAddress: '广州海珠',
        wheelMaterial: 'aluminum',
        plateRetention: true,
        vehicleType: 'car',
        vehiclePhotos: ['https://example.com/b.jpg'],
        visitorKey: 'visitor-b',
        createTime: '2026-04-23 10:30:00',
        timeline: [{ status: 'submitted', label: '已提交', time: '2026-04-23 10:30:00' }],
      },
    ]);
    const find = repository.find.bind(repository);
    let attempts = 0;
    repository.find = async (options?: any) => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error('read ECONNRESET') as NodeJS.ErrnoException;
        error.code = 'ECONNRESET';
        throw error;
      }
      return find(options);
    };

    const orders = await service.myOrders();

    expect(attempts).toBe(2);
    expect(orders).toHaveLength(1);
    expect(orders[0].orderNo).toBe('VR-1002-H5');
  });

  it('fails myOrders quickly when the database query hangs', async () => {
    jest.useFakeTimers();
    const { service, repository } = createService('visitor-b');
    repository.find = async () => new Promise(() => undefined);

    try {
      const promise = service.myOrders();
      const assertion = expect(promise).rejects.toThrow('订单列表加载超时，请稍后重试');
      await jest.advanceTimersByTimeAsync(5000);

      await assertion;
    } finally {
      jest.useRealTimers();
    }
  });

  it('maps stored order snapshots to detail output', async () => {
    const { service } = createService('visitor-a', [
      {
        id: 3,
        orderNo: 'VR-1003-H5',
        currentStatus: 'submitted',
        brandModel: '大众 朗逸',
        plateNumber: '粤C33333',
        contactName: '赵六',
        contactPhone: '13800138003',
        pickupAddress: '珠海香洲',
        pickupLatitude: 22.271,
        pickupLongitude: 113.576,
        wheelMaterial: 'steel',
        plateRetention: true,
        vehicleType: 'car',
        weightTons: 1.32,
        vehiclePhotos: ['cos://car-platform-dev/visitors/visitor-a/valuation-orders/2026/04/c.jpg'],
        visitorKey: 'visitor-a',
        createTime: '2026-04-23 12:00:00',
        timeline: [{ status: 'submitted', label: '已提交', time: '2026-04-23 12:00:00' }],
      },
    ]);

    const detail = await service.detail('3');

    expect(detail).toMatchObject({
      id: '3',
      orderNo: 'VR-1003-H5',
      currentStatus: 'submitted',
      currentStatusLabel: '已提交',
      brandModel: '大众 朗逸',
      plateNumber: '粤C33333',
      contactName: '赵六',
      contactPhone: '13800138003',
      pickupAddress: '珠海香洲',
      wheelMaterial: 'steel',
      weightTons: 1.32,
      vehiclePhotos: ['https://preview.example.com/car-platform-dev/visitors/visitor-a/valuation-orders/2026/04/c.jpg'],
    });
    expect(detail.timeline).toHaveLength(1);
  });
});
