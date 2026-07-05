<script setup>
import { learning } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
</script>

<template>
  <div class="page-grid learning-layout">
    <UiCard title="差距队列" desc="把缺口整理成可执行 backlog。" tag="Backlog">
      <div class="review-list">
        <article v-for="item in learning.gaps" :key="item.title">
          <Octicon name="issueOpenedIcon" />
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </UiCard>

    <UiCard title="六周路线" desc="时间线用作真正的执行节奏。" tag="Roadmap">
      <div class="timeline">
        <article v-for="item in learning.plan" :key="item.week">
          <span>{{ item.week }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
      <div class="form-footer">
        <button class="btn">
          <Octicon name="syncIcon" />
          重新生成
        </button>
        <button class="btn btn-primary">
          <Octicon name="downloadIcon" />
          导出方案
        </button>
      </div>
    </UiCard>
  </div>
</template>
