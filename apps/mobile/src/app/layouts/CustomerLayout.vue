<template>
  <div class="min-h-screen bg-background text-on-surface">
    <main class="mx-auto min-h-screen w-full max-w-md pb-24 pt-safe">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
