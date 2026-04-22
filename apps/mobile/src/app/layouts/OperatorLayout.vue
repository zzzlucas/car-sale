<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <main class="mx-auto min-h-screen w-full max-w-md px-margin-page pb-16 pt-safe">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
