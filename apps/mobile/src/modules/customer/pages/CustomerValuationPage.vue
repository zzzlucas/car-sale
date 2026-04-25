<template>
  <main class="min-h-screen bg-background pb-mobile-bottom-nav">
    <header class="sticky top-0 z-20 border-b border-surface-variant bg-white">
      <div class="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors active:bg-surface-container"
          @click="goBack"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-semibold text-primary">车辆估价评估</h1>
        <div class="w-10" />
      </div>
    </header>

    <section class="mx-auto max-w-md px-margin-page py-stack-lg">
      <div class="mb-8 flex items-center justify-between">
        <div v-for="(item, index) in steps" :key="item.label" class="flex flex-1 flex-col items-center">
          <div class="flex w-full items-center">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
              :class="index === 0 ? 'bg-primary text-white' : 'bg-surface-container-highest text-outline'"
            >
              {{ index + 1 }}
            </div>
            <div v-if="index < steps.length - 1" class="mx-2 h-[2px] flex-1 bg-surface-variant" />
          </div>
          <span
            class="mt-2 text-label-md"
            :class="index === 0 ? 'font-semibold text-primary' : 'text-outline'"
          >
            {{ item.label }}
          </span>
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
              <div class="flex h-14 items-center rounded-xl border border-surface-variant px-4">
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
                class="overflow-hidden rounded-xl border border-surface-variant bg-white"
              >
                <img :src="item.previewUrl" :alt="item.name" class="h-28 w-full object-cover" />
                <div class="flex items-center justify-between gap-3 p-3">
                  <span class="line-clamp-1 text-label-md text-on-surface">{{ item.name }}</span>
                  <button
                    type="button"
                    class="rounded-full bg-surface-container px-2 py-1 text-label-sm text-on-surface-variant"
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

    <MobileBottomNav />
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from "vue";
import { useRouter } from "vue-router";

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
  message.value = "表单已重置，可以重新填写。";
  addressMessage.value = "";
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
