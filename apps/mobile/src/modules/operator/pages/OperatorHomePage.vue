<template>
  <section class="flex min-h-screen flex-col justify-between py-stack-lg">
    <div class="space-y-6">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.3em] text-emerald-300/60">Operator</p>
        <h1 class="text-3xl font-semibold">移动执行端预留入口</h1>
        <p class="max-w-[24rem] text-sm leading-7 text-slate-300">
          后续这里会承接外勤、拖车、现场备注、拍照上传和快捷状态推进。当前先把路由、布局和应用边界固定下来。
        </p>
      </div>

      <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p class="text-sm text-slate-300">计划中的首批能力</p>
        <ul class="mt-4 space-y-3 text-sm text-white/85">
          <li>今日任务列表</li>
          <li>一键拨号与导航</li>
          <li>现场拍照与备注</li>
          <li>快捷推进订单状态</li>
        </ul>
      </div>
    </div>

    <RouterLink to="/customer" class="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950">
      返回客户端首页
    </RouterLink>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
