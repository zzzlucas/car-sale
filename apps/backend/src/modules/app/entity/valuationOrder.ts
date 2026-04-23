import { Column, Entity, Index } from 'typeorm';

import type { ScrapOrderStatus, ScrapOrderTimelineItem, VehicleType } from '@car/shared-types';

import { BaseEntity, transformerJson } from '../../base/entity/base';

@Entity('app_valuation_order')
export class AppValuationOrderEntity extends BaseEntity {
  @Index()
  @Column({ comment: '访客标识', length: 64 })
  visitorKey: string;

  @Index()
  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ comment: '当前状态', length: 32 })
  currentStatus: ScrapOrderStatus;

  @Column({ comment: '车辆类型', length: 20 })
  vehicleType: VehicleType;

  @Column({ comment: '品牌型号', length: 100 })
  brandModel: string;

  @Column({ comment: '车牌号', length: 20, default: '' })
  plateNumber: string;

  @Column({ comment: '是否保留原车牌', default: false })
  plateRetention: boolean;

  @Column({ comment: '轮毂材质', length: 32, default: '' })
  wheelMaterial: string;

  @Column({
    comment: '整备质量(吨)',
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  weightTons: number | null;

  @Column({ comment: '联系姓名', length: 50 })
  contactName: string;

  @Column({ comment: '联系电话', length: 20 })
  contactPhone: string;

  @Column({ comment: '取车地址', length: 255 })
  pickupAddress: string;

  @Column({
    comment: '取车纬度',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  pickupLatitude: number | null;

  @Column({
    comment: '取车经度',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  pickupLongitude: number | null;

  @Column({
    comment: '车辆照片',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  vehiclePhotos: string[];

  @Column({
    comment: '进度时间线',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  timeline: ScrapOrderTimelineItem[];
}
