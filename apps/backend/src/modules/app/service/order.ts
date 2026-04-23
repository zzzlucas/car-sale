import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import { Repository } from 'typeorm';
import { v1 as uuid } from 'uuid';

import type {
  ScrapOrderDetail,
  ScrapOrderSummary,
  ScrapOrderStatus,
  ScrapOrderTimelineItem,
  ValuationOrderPayload,
  ValuationPhotoUploadTicketPayload,
  ValuationPhotoUploadTicketResult,
  ValuationOrderSubmitResult,
} from '@car/shared-types';
import { pUploadPath } from '../../../comm/path';
import { AppValuationOrderEntity } from '../entity/valuationOrder';
import { AppCosStorageService } from './cosStorage';

const STATUS_LABELS: Record<ScrapOrderStatus, string> = {
  submitted: '已提交',
  contacted: '联系中',
  quoted: '估价完成',
  scheduled_pickup: '已安排上门 / 拖车',
  picked_up: '已拖车进场',
  dismantling: '拆解处理中',
  deregistration_processing: '注销办理中',
  completed: '已完成',
  cancelled: '已取消',
};

@Provide()
export class AppOrderService extends BaseService {
  @InjectEntityModel(AppValuationOrderEntity)
  appValuationOrderEntity: Repository<AppValuationOrderEntity>;

  @Inject()
  ctx;

  @Inject()
  appCosStorageService: AppCosStorageService;

  async submit(payload: ValuationOrderPayload): Promise<ValuationOrderSubmitResult> {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const order = this.appValuationOrderEntity.create({
      ...payload,
      currentStatus: 'submitted',
      orderNo: this.buildOrderNo(),
      visitorKey: this.getVisitorKey(),
      weightTons: this.toNullableNumber(payload.weightTons),
      pickupLatitude: this.toNullableNumber(payload.pickupLatitude),
      pickupLongitude: this.toNullableNumber(payload.pickupLongitude),
      vehiclePhotos: [...(payload.vehiclePhotos ?? [])],
      timeline: this.createSubmittedTimeline(now),
    });
    const saved = await this.appValuationOrderEntity.save(order);

    return {
      id: String(saved.id),
      orderNo: saved.orderNo,
      currentStatus: saved.currentStatus,
    };
  }

  async detail(id: string): Promise<ScrapOrderDetail> {
    return this.toDetail(await this.findOwnedOrder(id));
  }

  async progress(id: string): Promise<ScrapOrderDetail> {
    return this.detail(id);
  }

  async myOrders(): Promise<ScrapOrderSummary[]> {
    const orders = await this.appValuationOrderEntity.find({
      where: {
        visitorKey: this.getVisitorKey(),
      },
      order: {
        createTime: 'DESC',
      } as any,
    });

    return orders.map(order => this.toSummary(order));
  }

  createPhotoUploadTicket(
    payload: ValuationPhotoUploadTicketPayload
  ): ValuationPhotoUploadTicketResult {
    return this.appCosStorageService.createValuationPhotoUploadTicket({
      ...payload,
      visitorKey: this.getVisitorKey(),
    });
  }

  async uploadPhoto(file: any, origin: string) {
    if (!file) {
      throw new CoolCommException('上传文件为空');
    }

    const uploadRoot = pUploadPath();
    const dateDir = moment().format('YYYYMMDD');
    const extension = path.extname(path.basename(file.filename || ''));
    const finalName = `${uuid()}${extension || '.jpg'}`;
    const relativePath = path.join(dateDir, finalName);
    const targetPath = path.join(uploadRoot, relativePath);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(file.data, targetPath);

    const normalizedPath = relativePath.split(path.sep).join('/');
    return `${origin}/upload/${normalizedPath}`;
  }

  private async findOwnedOrder(id: string): Promise<AppValuationOrderEntity> {
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new CoolCommException('订单不存在或无权限查看');
    }

    const order = await this.appValuationOrderEntity.findOne({
      where: {
        id: orderId,
        visitorKey: this.getVisitorKey(),
      },
    });

    if (!order) {
      throw new CoolCommException('订单不存在或无权限查看');
    }

    return order;
  }

  private getVisitorKey() {
    const visitorKey = String(this.ctx?.get?.('x-visitor-key') ?? '').trim();
    if (!visitorKey) {
      throw new CoolCommException('访客标识缺失，请刷新页面后重试');
    }
    return visitorKey.slice(0, 64);
  }

  private buildOrderNo() {
    const datePart = moment().format('YYYYMMDD');
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VR-${datePart}-${randomPart}`;
  }

  private createSubmittedTimeline(time: string): ScrapOrderTimelineItem[] {
    return [
      {
        status: 'submitted',
        label: STATUS_LABELS.submitted,
        time,
        note: '客服会尽快与您联系确认车辆与取车信息，请保持电话畅通。',
      },
    ];
  }

  private toSummary(order: AppValuationOrderEntity): ScrapOrderSummary {
    return {
      id: String(order.id),
      orderNo: order.orderNo,
      currentStatus: order.currentStatus,
      currentStatusLabel: STATUS_LABELS[order.currentStatus] ?? order.currentStatus,
      brandModel: order.brandModel,
      plateNumber: order.plateNumber || '待确认',
      contactName: order.contactName,
      contactPhone: order.contactPhone,
      pickupAddress: order.pickupAddress,
      updatedAt: this.toTimestampString(order.updateTime || order.createTime),
    };
  }

  private toDetail(order: AppValuationOrderEntity): ScrapOrderDetail {
    return {
      ...this.toSummary(order),
      ownerName: order.contactName,
      vin: '待线下核验',
      vehicleType: order.vehicleType,
      plateRetention: Boolean(order.plateRetention),
      wheelMaterial: order.wheelMaterial,
      weightTons: this.toNullableNumber(order.weightTons),
      pickupLatitude: this.toNullableNumber(order.pickupLatitude),
      pickupLongitude: this.toNullableNumber(order.pickupLongitude),
      vehiclePhotos: (order.vehiclePhotos ?? []).map(photo =>
        this.appCosStorageService.resolveDisplayUrl(photo)
      ),
      timeline: [
        ...(order.timeline ?? this.createSubmittedTimeline(this.toTimestampString(order.createTime))),
      ],
    };
  }

  private toNullableNumber(value: unknown) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
  }

  private toTimestampString(value: string | Date | undefined) {
    if (!value) {
      return '';
    }
    return typeof value === 'string' ? value : moment(value).format('YYYY-MM-DD HH:mm:ss');
  }
}
