<script setup lang="ts">
import BarChart from "./components/BarChart.vue";
import data from "./data.json";
</script>

<template>
  <BarChart
    class="w-full"
    :data="
      data
        .map(({ letter, frequency }) => ({ x: frequency * 100, y: letter }))
        .sort((a, b) => b.x - a.x)
    "
  />
</template>
