<template>
  <main class="min-h-screen bg-background pb-mobile-bottom-nav">
    <header class="mobile-page-header mobile-page-header--hide-in-social sticky top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mobile-page-header__bar relative mx-auto flex h-14 w-full max-w-md items-center justify-center px-4">
        <button
          class="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="mobile-page-header__title text-lg font-semibold text-primary">车辆估价评估</h1>
        <RouterLink
          to="/customer/records"
          class="absolute right-4 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1 rounded-full border border-surface-variant bg-surface-container-low px-3 text-label-md font-semibold text-primary transition-colors active:bg-surface-container"
        >
          <span class="material-symbols-outlined text-[16px]">history</span>
          预约记录
        </RouterLink>
      </div>
    </header>

    <section class="mx-auto max-w-md px-margin-page py-stack-lg">
      <div class="relative mb-8 px-2">
        <div class="absolute inset-x-2 top-4 h-[2px] rounded-full bg-surface-variant" />
        <div class="relative flex items-start justify-between gap-2">
          <div
            v-for="(item, index) in steps"
            :key="item.label"
            class="flex min-w-0 flex-1 flex-col items-center gap-2 bg-background text-center"
          >
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-sm font-semibold shadow-sm"
              :class="index === 0 ? 'bg-primary text-white' : 'bg-surface-container-highest text-outline'"
            >
              {{ index + 1 }}
            </div>
            <span
              class="text-label-sm leading-tight"
              :class="index === 0 ? 'font-semibold text-primary' : 'text-outline'"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>

      <form
        class="rounded-2xl border border-surface-variant bg-white p-inset-card shadow-subtle"
        @submit.prevent="handleSubmit"
      >
        <div class="mb-stack-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">directions_car</span>
          <h2 class="text-headline-sm text-on-surface">请填写预约信息</h2>
        </div>

        <div class="space-y-stack-lg">
          <section class="space-y-stack-md">
            <div class="flex items-center justify-between">
              <h3 class="text-body-lg font-semibold text-on-surface">车辆信息</h3>
              <span class="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                1/4
              </span>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                车辆类型
                <span class="text-error">*</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="item in vehicleTypes"
                  :key="item.value"
                  type="button"
                  class="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border text-label-md font-medium transition-colors"
                  :class="
                    form.vehicleType === item.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-variant text-on-surface-variant'
                  "
                  @click="form.vehicleType = item.value"
                >
                  <span class="material-symbols-outlined">{{ item.icon }}</span>
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                品牌型号
                <span class="text-error">*</span>
              </label>
              <button
                type="button"
                class="flex min-h-14 w-full items-center gap-3 rounded-xl border border-surface-variant px-4 py-3 text-left transition-colors active:bg-surface-container"
                @click="openBrandModelPopup"
              >
                <span class="material-symbols-outlined text-primary">directions_car</span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate text-body-md"
                    :class="form.brandModel ? 'text-on-surface' : 'text-outline'"
                  >
                    {{ form.brandModel || "请选择品牌和型号" }}
                  </span>
                  <span class="mt-1 block truncate text-label-md text-on-surface-variant">
                    可继续补充年款、排量或配置
                  </span>
                </span>
                <span class="material-symbols-outlined text-outline">expand_more</span>
              </button>
              <div class="mt-3 flex h-12 items-center rounded-xl border border-surface-variant px-4">
                <input
                  v-model="form.brandModel"
                  type="text"
                  placeholder="例如：丰田 凯美瑞 2.0G"
                  class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                />
                <span class="material-symbols-outlined text-outline">search</span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">车牌号</label>
              <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
                <input
                  v-model="form.plateNumber"
                  type="text"
                  placeholder="例如：粤A12345"
                  class="w-full border-none bg-transparent p-0 text-body-md uppercase text-on-surface outline-none placeholder:text-outline"
                />
                <span class="material-symbols-outlined text-outline">badge</span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">轮毂材质</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="item in wheelMaterials"
                  :key="item.value"
                  type="button"
                  class="flex h-12 items-center justify-center rounded-xl border text-label-md font-medium transition-colors"
                  :class="
                    form.wheelMaterial === item.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-variant text-on-surface-variant'
                  "
                  @click="form.wheelMaterial = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">整备质量（吨）</label>
              <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
                <input
                  :value="form.weightTons ?? ''"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="例如：1.56"
                  class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                  @input="handleWeightInput"
                />
                <span class="text-label-md text-outline">t</span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                是否保留原车牌
                <span class="text-error">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex h-14 items-center justify-center gap-2 rounded-xl border text-body-md font-medium transition-colors"
                  :class="
                    form.plateRetention
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-variant text-on-surface-variant'
                  "
                  @click="form.plateRetention = true"
                >
                  <span class="material-symbols-outlined">radio_button_checked</span>
                  保留
                </button>
                <button
                  type="button"
                  class="flex h-14 items-center justify-center gap-2 rounded-xl border text-body-md font-medium transition-colors"
                  :class="
                    !form.plateRetention
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-variant text-on-surface-variant'
                  "
                  @click="form.plateRetention = false"
                >
                  <span class="material-symbols-outlined">radio_button_unchecked</span>
                  不保留
                </button>
              </div>
              <p class="mt-3 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface-variant">
                保留车牌需原车主名下使用满 1 年，并在报废注销后 2 年内向车管所申请。
              </p>
            </div>
          </section>

          <section class="space-y-stack-md border-t border-surface-variant pt-stack-md">
            <div class="flex items-center justify-between">
              <h3 class="text-body-lg font-semibold text-on-surface">联系人信息</h3>
              <span class="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                2/4
              </span>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                联系姓名
                <span class="text-error">*</span>
              </label>
              <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
                <input
                  v-model="form.contactName"
                  type="text"
                  placeholder="请输入联系人姓名"
                  class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                />
                <span class="material-symbols-outlined text-outline">person</span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                联系电话
                <span class="text-error">*</span>
              </label>
              <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
                <input
                  v-model="form.contactPhone"
                  type="tel"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="请输入 11 位手机号"
                  class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                />
                <span class="material-symbols-outlined text-outline">call</span>
              </div>
            </div>
          </section>

          <section class="space-y-stack-md border-t border-surface-variant pt-stack-md">
            <div class="flex items-center justify-between">
              <h3 class="text-body-lg font-semibold text-on-surface">上门地址</h3>
              <span class="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                3/4
              </span>
            </div>

            <div>
              <label class="mb-2 block text-body-md font-medium text-on-surface">
                取车地址
                <span class="text-error">*</span>
              </label>
              <div class="rounded-xl border border-surface-variant px-4 py-3">
                <textarea
                  v-model="form.pickupAddress"
                  rows="3"
                  placeholder="请输入详细地址，方便拖车联系与上门"
                  class="w-full resize-none border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                  @input="handlePickupAddressInput"
                />
              </div>
            </div>

            <div class="rounded-xl border border-surface-variant bg-surface-container-low px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-body-md font-semibold text-on-surface">搜索地址建议</p>
                  <p class="mt-1 text-label-md text-on-surface-variant">命中后自动回填位置</p>
                </div>
                <button
                  type="button"
                  class="flex h-10 items-center justify-center rounded-xl border border-primary px-4 text-label-md font-semibold text-primary disabled:opacity-50"
                  :disabled="addressSuggestionLoading || !form.pickupAddress.trim()"
                  @click="handlePickupAddressSearch"
                >
                  {{ addressSuggestionLoading ? "搜索中..." : "搜索地址建议" }}
                </button>
              </div>
            </div>

            <div
              v-if="addressSuggestions.length"
              class="rounded-2xl border border-surface-variant bg-white p-3 shadow-subtle"
            >
              <div class="mb-3 flex items-center justify-between">
                <p class="text-body-md font-semibold text-on-surface">推荐地址</p>
                <span class="text-label-md text-on-surface-variant">{{ addressSuggestions.length }} 条</span>
              </div>
              <div class="space-y-2">
                <button
                  v-for="item in addressSuggestions"
                  :key="item.id"
                  type="button"
                  class="flex w-full flex-col items-start rounded-xl border border-surface-variant px-4 py-3 text-left transition-colors active:bg-surface-container"
                  @click="applyAddressSuggestion(item)"
                >
                  <span class="text-body-md font-medium text-on-surface">{{ item.name }}</span>
                  <span class="mt-1 text-label-md text-on-surface-variant">{{ item.formattedAddress }}</span>
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-primary text-label-md font-semibold text-primary"
                :disabled="locationLoading"
                @click="fillCurrentLocation"
              >
                <span class="material-symbols-outlined text-[18px]">my_location</span>
                {{ locationLoading ? "定位中..." : "读取当前位置" }}
              </button>
              <button
                type="button"
                class="flex h-12 items-center justify-center rounded-xl border border-surface-variant px-4 text-label-md text-on-surface-variant"
                @click="clearLocation"
              >
                清空位置
              </button>
            </div>

            <div
              class="rounded-xl border border-dashed border-surface-variant bg-surface-container-low px-4 py-3 text-label-md text-on-surface-variant"
            >
              <p class="font-medium text-on-surface">地图方案先走轻量闭环</p>
              <p class="mt-1">
                当前版本优先走高德地址搜索与位置回填，后续再根据效果补完整地图选点。
              </p>
              <p v-if="form.pickupLatitude && form.pickupLongitude" class="mt-3">
                已记录当前位置，系统会据此安排上门服务。
              </p>
            </div>

            <p
              v-if="addressMessage"
              class="rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface-variant"
            >
              {{ addressMessage }}
            </p>
          </section>

          <section class="space-y-stack-md border-t border-surface-variant pt-stack-md">
            <div class="flex items-center justify-between">
              <h3 class="text-body-lg font-semibold text-on-surface">车辆照片</h3>
              <span class="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                4/4
              </span>
            </div>

            <label
              class="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-6 text-center transition-colors"
            >
              <span class="material-symbols-outlined text-[28px] text-primary">add_photo_alternate</span>
              <span class="mt-3 text-body-md font-medium text-on-surface">
                {{ uploading ? "上传中..." : "上传车辆照片" }}
              </span>
              <span class="mt-2 text-label-md text-on-surface-variant">
                至少 1 张，建议上传前后左右与车况细节
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                :disabled="uploading"
                @change="handlePhotoChange"
              />
            </label>

            <div
              v-if="photoPreviews.length"
              class="grid grid-cols-2 gap-3 rounded-2xl border border-surface-variant bg-surface-container-low p-3"
            >
              <article
                v-for="item in photoPreviews"
                :key="item.id"
                class="flex h-full flex-col overflow-hidden rounded-xl border border-surface-variant bg-white"
              >
                <img :src="item.previewUrl" :alt="item.name" class="h-28 w-full flex-none object-cover" />
                <div class="flex min-w-0 items-center gap-3 p-3">
                  <span class="min-w-0 flex-1 truncate text-label-md text-on-surface">{{ item.name }}</span>
                  <button
                    type="button"
                    class="min-w-[3.5rem] shrink-0 rounded-lg border border-surface-variant bg-surface-container px-2 py-2 text-label-sm font-medium text-on-surface-variant transition-colors active:bg-surface-variant"
                    @click="removePhoto(item.id)"
                  >
                    删除
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>
      </form>

      <p
        v-if="message"
        class="mt-4 rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface-variant"
      >
        {{ message }}
      </p>

      <div class="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex h-14 items-center justify-center rounded-xl border border-surface-variant bg-white text-headline-sm text-on-surface"
          :disabled="submitting || uploading"
          @click="resetForm"
        >
          重置表单
        </button>
        <button
          type="button"
          class="flex h-14 items-center justify-center rounded-xl bg-primary text-headline-sm text-on-primary shadow-sm disabled:opacity-60"
          :disabled="submitting || uploading || locationLoading"
          @click="handleSubmit"
        >
          {{ submitting ? "提交中..." : "提交预约" }}
        </button>
      </div>

      <div class="mt-6 flex items-center justify-center gap-2 text-label-md text-primary">
        <span class="material-symbols-outlined text-sm">lock</span>
        信息已实施端到端加密传输，保障您的隐私安全
      </div>
    </section>

    <Teleport to="body">
      <Transition name="brand-model-popup">
        <div
          v-if="brandModelPopupOpen"
          class="fixed inset-0 z-50 flex items-end justify-center bg-scrim/45 px-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brand-model-popup-title"
          @click.self="closeBrandModelPopup"
        >
          <section
            class="max-h-[88vh] w-full max-w-md overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
          >
            <header class="border-b border-surface-variant px-margin-page pb-3 pt-4">
              <div class="mx-auto mb-3 h-1 w-12 rounded-full bg-surface-variant" />
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 id="brand-model-popup-title" class="text-headline-sm text-on-surface">
                    选择品牌型号
                  </h2>
                  <p class="mt-1 text-label-md text-on-surface-variant">
                    已收录 {{ vehicleCatalogStats.brandCount }} 个品牌、{{ vehicleCatalogStats.modelCount }} 个车系，含常见老旧车型
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
                  @click="closeBrandModelPopup"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="mt-4 flex h-12 items-center rounded-xl border border-surface-variant bg-surface-container-low px-4">
                <span class="material-symbols-outlined mr-2 text-[20px] text-outline">search</span>
                <input
                  v-model="brandModelSearchKeyword"
                  type="search"
                  placeholder="搜索品牌或车型，如：桑塔纳、夏利、五菱宏光"
                  class="w-full border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-outline"
                />
              </div>
            </header>

            <div class="grid h-[56vh] min-h-[420px] grid-cols-[6.75rem_1fr] overflow-hidden">
              <aside class="overflow-y-auto border-r border-surface-variant bg-surface-container-low">
                <button
                  v-for="brand in activeVehicleCatalog"
                  :key="brand.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-label-md transition-colors"
                  :class="
                    !brandModelSearchKeyword.trim() && selectedBrandId === brand.id
                      ? 'bg-white font-semibold text-primary'
                      : 'text-on-surface-variant active:bg-surface-container'
                  "
                  @click="selectedBrandId = brand.id"
                >
                  <span class="truncate">{{ brand.name }}</span>
                </button>
              </aside>

              <section class="flex min-w-0 flex-col overflow-hidden">
                <div class="border-b border-surface-variant px-4 py-3">
                  <p class="truncate text-body-md font-semibold text-on-surface">
                    {{ vehicleModelPanelMeta.title }}
                  </p>
                  <p class="mt-1 text-label-md text-on-surface-variant">
                    {{ vehicleModelPanelMeta.count }} 个可选项
                  </p>
                </div>

                <div class="flex-1 overflow-y-auto p-3">
                  <div v-if="brandModelSearchKeyword.trim()" class="space-y-2">
                    <button
                      v-for="item in visibleModelSuggestions"
                      :key="`${item.brandId}-${item.modelName}`"
                      type="button"
                      class="flex w-full items-center justify-between gap-3 rounded-xl border border-surface-variant px-4 py-3 text-left transition-colors active:bg-surface-container"
                      @click="selectBrandModel(item.brandName, item.modelName)"
                    >
                      <span class="min-w-0">
                        <span class="block truncate text-body-md font-medium text-on-surface">{{ item.modelName }}</span>
                        <span class="mt-1 block text-label-md text-on-surface-variant">{{ item.brandName }}</span>
                      </span>
                      <span class="material-symbols-outlined shrink-0 text-outline">chevron_right</span>
                    </button>
                  </div>

                  <div v-else class="grid grid-cols-2 gap-2">
                    <button
                      v-for="modelName in selectedBrandModels"
                      :key="modelName"
                      type="button"
                      class="min-h-12 rounded-xl border border-surface-variant px-3 py-2 text-left text-label-md font-medium text-on-surface transition-colors active:bg-surface-container"
                      :class="
                        form.brandModel === buildBrandModelValue(selectedBrand?.name ?? '', modelName)
                          ? 'border-primary bg-primary/5 text-primary'
                          : ''
                      "
                      @click="selectBrandModel(selectedBrand?.name ?? '', modelName)"
                    >
                      {{ modelName }}
                    </button>
                  </div>

                  <div
                    v-if="brandModelSearchKeyword.trim() && !visibleModelSuggestions.length"
                    class="flex h-full min-h-52 flex-col items-center justify-center px-6 text-center"
                  >
                    <span class="material-symbols-outlined text-[36px] text-outline">manage_search</span>
                    <p class="mt-3 text-body-md font-semibold text-on-surface">未找到完全匹配的车系</p>
                    <p class="mt-2 text-label-md text-on-surface-variant">
                      报废车可能存在停产或地方俗称，可使用当前输入并在提交前补充排量配置。
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <footer class="border-t border-surface-variant px-margin-page pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              <div class="mb-3 rounded-xl bg-surface-container-low px-4 py-3 text-label-md text-on-surface-variant">
                数据参考汽车之家公开车型大全，并补充微面、轻卡、摩托车等报废高频老款；目录未覆盖时仍可手填。
              </div>
              <button
                type="button"
                class="flex h-12 w-full items-center justify-center rounded-xl border border-primary text-label-md font-semibold text-primary disabled:border-surface-variant disabled:text-outline"
                :disabled="!brandModelSearchKeyword.trim()"
                @click="useCustomBrandModel"
              >
                使用当前输入
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>

    <MobileBottomNav />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import type { MapAddressSuggestion, ValuationOrderPayload } from "@car/shared-types";
import MobileBottomNav from "@/modules/common/components/MobileBottomNav.vue";
import { reverseGeocodeLocation, searchAddressSuggestions } from "@/services/map";
import { submitValuationOrder } from "@/services/orders";
import { uploadVehiclePhoto } from "@/services/upload";
import {
  clearPickupLocation,
  createInitialValuationForm,
  getCurrentLocationRejectionMessage,
  validateValuationForm,
} from "./customerValuationForm";
import {
  buildBrandModelValue,
  findInitialVehicleBrandId,
  getVehicleModelPanelMeta,
  getVehicleBrandCatalog,
  getVehicleCatalogStats,
  searchVehicleModels,
} from "./vehicleBrandCatalog";

type PhotoPreview = {
  id: string;
  name: string;
  previewUrl: string;
};

const router = useRouter();
const submitting = ref(false);
const uploading = ref(false);
const locationLoading = ref(false);
const addressSuggestionLoading = ref(false);
const message = ref("");
const addressMessage = ref("");
const photoPreviews = ref<PhotoPreview[]>([]);
const addressSuggestions = ref<MapAddressSuggestion[]>([]);
const brandModelPopupOpen = ref(false);
const brandModelSearchKeyword = ref("");
const selectedBrandId = ref("");

const steps = [
  { label: "车辆信息" },
  { label: "上门地址" },
  { label: "提交预约" },
];

const vehicleTypes = [
  { value: "car", label: "小型轿车", icon: "directions_car" },
  { value: "truck", label: "货车", icon: "local_shipping" },
  { value: "motorcycle", label: "摩托车", icon: "two_wheeler" },
] as const;

const wheelMaterials = [
  { value: "steel", label: "钢轮毂" },
  { value: "aluminum", label: "铝合金" },
  { value: "other", label: "其他" },
] as const;

const form = reactive<ValuationOrderPayload>(createInitialValuationForm());

const activeVehicleCatalog = computed(() => getVehicleBrandCatalog(form.vehicleType));
const vehicleCatalogStats = computed(() => getVehicleCatalogStats(form.vehicleType));
const selectedBrand = computed(
  () => activeVehicleCatalog.value.find(brand => brand.id === selectedBrandId.value) ?? activeVehicleCatalog.value[0],
);
const selectedBrandModels = computed(() => selectedBrand.value?.models ?? []);
const visibleModelSuggestions = computed(() =>
  searchVehicleModels(form.vehicleType, brandModelSearchKeyword.value),
);
const vehicleModelPanelMeta = computed(() =>
  getVehicleModelPanelMeta({
    keyword: brandModelSearchKeyword.value,
    selectedBrandName: selectedBrand.value?.name ?? "",
    searchResultCount: visibleModelSuggestions.value.length,
    selectedBrandModelCount: selectedBrandModels.value.length,
  }),
);

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/customer");
}

function clearPhotoPreviews() {
  for (const item of photoPreviews.value) {
    if (item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
  photoPreviews.value = [];
}

function resetForm() {
  Object.assign(form, createInitialValuationForm());
  clearPhotoPreviews();
  addressSuggestions.value = [];
  brandModelSearchKeyword.value = "";
  selectedBrandId.value = activeVehicleCatalog.value[0]?.id ?? "";
  brandModelPopupOpen.value = false;
  message.value = "表单已重置，可以重新填写。";
  addressMessage.value = "";
}

function openBrandModelPopup() {
  selectedBrandId.value = findInitialVehicleBrandId(form.brandModel, form.vehicleType);
  brandModelSearchKeyword.value = form.brandModel;
  brandModelPopupOpen.value = true;
}

function closeBrandModelPopup() {
  brandModelPopupOpen.value = false;
}

function selectBrandModel(brandName: string, modelName: string) {
  if (!brandName || !modelName) {
    return;
  }

  form.brandModel = buildBrandModelValue(brandName, modelName);
  brandModelSearchKeyword.value = form.brandModel;
  selectedBrandId.value = findInitialVehicleBrandId(form.brandModel, form.vehicleType);
  closeBrandModelPopup();
}

function useCustomBrandModel() {
  const customValue = brandModelSearchKeyword.value.trim();
  if (!customValue) {
    return;
  }

  form.brandModel = customValue;
  selectedBrandId.value = findInitialVehicleBrandId(customValue, form.vehicleType);
  closeBrandModelPopup();
}

function handleWeightInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  form.weightTons = value ? Number(value) : null;
}

function handlePickupAddressInput() {
  clearPickupLocation(form);
  if (addressSuggestions.value.length) {
    addressSuggestions.value = [];
  }
}

async function handlePickupAddressSearch() {
  const keywords = form.pickupAddress.trim();
  if (keywords.length < 2) {
    addressSuggestions.value = [];
    addressMessage.value = "请至少输入 2 个字后再搜索地址。";
    return;
  }

  addressSuggestionLoading.value = true;
  addressMessage.value = "";

  try {
    const suggestions = await searchAddressSuggestions(keywords);
    addressSuggestions.value = suggestions;

    if (!suggestions.length) {
      addressMessage.value = "暂未命中地址，建议改搜小区、写字楼或道路名称。";
    }
  } catch (error) {
    addressSuggestions.value = [];
    addressMessage.value = error instanceof Error ? `地址搜索失败：${error.message}` : "地址搜索失败，请稍后重试。";
  } finally {
    addressSuggestionLoading.value = false;
  }
}

function applyAddressSuggestion(item: MapAddressSuggestion) {
  form.pickupAddress = item.formattedAddress;
  form.pickupLatitude = item.latitude;
  form.pickupLongitude = item.longitude;
  addressSuggestions.value = [];
  addressMessage.value = "已回填地址与当前位置，可继续补充信息或直接提交。";
}

function removePhoto(photoId: string) {
  const index = photoPreviews.value.findIndex(item => item.id === photoId);
  if (index < 0) {
    return;
  }

  const [removed] = photoPreviews.value.splice(index, 1);
  if (removed.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(removed.previewUrl);
  }
  form.vehiclePhotos.splice(index, 1);
}

async function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  if (!files.length) {
    return;
  }

  uploading.value = true;
  message.value = "";

  try {
    for (const file of files) {
      const uploadedUrl = await uploadVehiclePhoto(file);
      const previewUrl =
        typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : uploadedUrl;

      form.vehiclePhotos.push(uploadedUrl);
      photoPreviews.value.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        previewUrl,
      });
    }
  } catch (error) {
    message.value =
      error instanceof Error ? `车辆照片上传失败：${error.message}` : "车辆照片上传失败，请稍后重试。";
  } finally {
    uploading.value = false;
    input.value = "";
  }
}

async function fillCurrentLocation() {
  if (!("geolocation" in navigator)) {
    addressMessage.value = "当前浏览器不支持定位，请手动填写地址。";
    return;
  }

  locationLoading.value = true;
  addressMessage.value = "";

  await new Promise<void>(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        const rejectionMessage = getCurrentLocationRejectionMessage({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        console.info("[pickup-location] browser geolocation", {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          rejectionMessage,
        });

        if (rejectionMessage) {
          clearPickupLocation(form);
          addressMessage.value = rejectionMessage;
          locationLoading.value = false;
          resolve();
          return;
        }

        form.pickupLatitude = latitude;
        form.pickupLongitude = longitude;
        void (async () => {
          try {
            const result = await reverseGeocodeLocation(form.pickupLongitude!, form.pickupLatitude!);
            if (result?.formattedAddress) {
              form.pickupAddress = result.formattedAddress;
              addressMessage.value = "已回填当前位置的中文地址，请补充门牌号等细节。";
            } else {
              addressMessage.value = "已获取当前位置，请补充中文地址或继续搜索地址建议。";
            }
          } catch (error) {
            addressMessage.value =
              error instanceof Error
                ? `已获取当前位置，但中文地址解析失败：${error.message}`
                : "已获取当前位置，但中文地址解析失败，请手动补充地址。";
          } finally {
            locationLoading.value = false;
            resolve();
          }
        })();
      },
      () => {
        addressMessage.value = "定位失败，请手动填写地址。";
        locationLoading.value = false;
        resolve();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      },
    );
  });
}

function clearLocation() {
  form.pickupAddress = "";
  clearPickupLocation(form);
  addressSuggestions.value = [];
  addressMessage.value = "已清空取车地址与当前位置。";
}

async function handleSubmit() {
  const validationMessage = validateValuationForm(form);
  if (validationMessage) {
    message.value = validationMessage;
    return;
  }

  submitting.value = true;
  message.value = "";

  try {
    const result = await submitValuationOrder(form);
    await router.push(`/customer/progress/${result.id}`);
  } catch (error) {
    message.value = error instanceof Error ? `提交失败：${error.message}` : "提交失败，请稍后重试。";
  } finally {
    submitting.value = false;
  }
}

onBeforeUnmount(() => {
  clearPhotoPreviews();
});
</script>
