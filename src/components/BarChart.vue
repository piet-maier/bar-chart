<script setup lang="ts">
import * as d3 from "d3";
import { computed, onMounted, useTemplateRef, watchEffect } from "vue";

const prop = defineProps<{ data: { x: number; y: string }[] }>();

const data = computed(() => prop.data.map((item, rank) => ({ ...item, rank })));

const barElement = useTemplateRef("barRef");
const labelElement = useTemplateRef("labelRef");
const xAxisElement = useTemplateRef("xAxisRef");

const height = 48 * data.value.length + 22;

const xScale = d3.scaleLinear().domain([0, 1]).range([0, 922]);

const yScale = d3
  .scaleBand<number>()
  .domain(d3.range(data.value.length + 1))
  .rangeRound([16, 48 * (data.value.length + 1.1) + 16])
  .padding(0.1);

const formatNumber = d3.format(",d");

function bars() {
  let bars = d3
    .select(barElement.value)
    .selectAll<SVGRectElement, { x: number; y: string; rank: number }>("rect");

  return (transition: d3.Transition<d3.BaseType, unknown, null, undefined>) => {
    bars = bars
      .data(data.value, ({ y }) => y)
      .join(
        (bars) =>
          bars
            .append("rect")
            .attr("x", xScale(0))
            .attr("y", yScale(data.value.length)!)
            .attr("width", 0)
            .attr("height", yScale.bandwidth()),
        (bars) => bars,
        (bars) =>
          bars
            .transition(transition)
            .remove()
            .attr("y", yScale(data.value.length)!)
            .attr("width", 0)
      )
      .call((bars) =>
        bars
          .transition(transition)
          .attr("y", ({ rank }) => yScale(rank)!)
          .attr("width", ({ x }) => xScale(x) - xScale(0))
      );
  };
}

function labels() {
  let labels = d3
    .select(labelElement.value)
    .selectAll<SVGTextElement, { x: number; y: string; rank: number }>("text");

  return (transition: d3.Transition<d3.BaseType, unknown, null, undefined>) => {
    labels = labels
      .data(data.value, ({ y }) => y)
      .join(
        (labels) =>
          labels
            .append("text")
            .attr(
              "transform",
              `translate(${xScale(0)}, ${yScale(data.value.length)})`
            )
            .attr("x", -6)
            .attr("y", yScale.bandwidth() / 2)
            .attr("dy", "-0.25em")
            .text(({ y }) => y)
            .call((labels) =>
              labels
                .append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
                .attr("dy", "1.15em")
            ),
        (labels) => labels,
        (labels) =>
          labels
            .transition(transition)
            .remove()
            .attr(
              "transform",
              `translate(${xScale(0)}, ${yScale(data.value.length)})`
            )
            .call((labels) =>
              labels.select("tspan").textTween(({ x }) => {
                const interpolator = d3.interpolateRound(x, 0);

                return (number: number) => interpolator(number).toString();
              })
            )
      )
      .call((labels) =>
        labels
          .transition(transition)
          .attr(
            "transform",
            ({ x, rank }) => `translate(${xScale(x)}, ${yScale(rank)})`
          )
          .call((labels) =>
            labels.select("tspan").textTween(
              ({ x }) =>
                (time) =>
                  formatNumber(d3.interpolateNumber(0, x)(time))
            )
          )
      );
  };
}

function axis() {
  const groupElement = d3.select(xAxisElement.value!);

  const axis = d3
    .axisTop(xScale)
    .ticks(5.8)
    .tickSizeOuter(0)
    .tickSizeInner(-48 * (data.value.length + yScale.padding()));

  return (transition: d3.Transition<d3.BaseType, unknown, null, undefined>) => {
    groupElement.transition(transition).call(axis);

    groupElement.select(".tick:first-of-type text").remove();

    groupElement
      .selectAll(".tick:not(:first-of-type) line")
      .attr("stroke", "white");

    groupElement.select(".domain").remove();
  };
}

onMounted(() => {
  const updateBars = bars();
  const updateAxis = axis();
  const updateLabels = labels();

  watchEffect(() => {
    const transition = d3.transition().duration(250).ease(d3.easeLinear);

    xScale.domain([0, Math.max(...data.value.map(({ x }) => x))]);

    updateBars(transition);
    updateAxis(transition);
    updateLabels(transition);
  });
});
</script>

<template>
  <svg
    :height
    style="max-width: 100%; height: auto"
    :viewBox="'0 0 928 ' + height"
    width="928"
  >
    <g ref="barRef" fill-opacity="0.6" />
    <g ref="xAxisRef" transform="translate(0, 16)" />
    <g
      ref="labelRef"
      font-family="sans-serif"
      font-size="12px"
      font-weight="bold"
      style="font-variant-numeric: tabular-nums"
      text-anchor="end"
    />
  </svg>
</template>
