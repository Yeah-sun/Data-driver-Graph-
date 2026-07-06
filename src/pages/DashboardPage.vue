<script setup>
import { useRouter } from "vue-router";
import { dashboard } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
import ProgressLine from "../components/ProgressLine.vue";

const router = useRouter();

const statIcons = {
  success: "targetIcon",
  accent: "telescopeIcon",
  warning: "alertIcon",
  neutral: "databaseIcon"
};
</script>

<template>
  <div class="page-grid dashboard-page">
    <section class="command-strip">
      <div>
        <strong>下一步建议</strong>
        <span>先确认简历画像，再进入目标岗位匹配。</span>
      </div>
      <button class="btn btn-primary" @click="router.push('/resume')">
        <Octicon name="arrowRightIcon" />
        继续主流程
      </button>
    </section>

    <section class="stats-grid">
      <article v-for="stat in dashboard.stats" :key="stat.label" class="stat-tile" :class="`stat-tile--${stat.tone}`">
        <div class="stat-tile__head">
          <span>{{ stat.label }}</span>
          <i>
            <Octicon :name="statIcons[stat.tone] || 'graphIcon'" />
          </i>
        </div>
        <strong>{{ stat.value }}</strong>
        <small>{{ stat.detail }}</small>
      </article>
    </section>

    <section class="dashboard-layout">
      <UiCard title="流程轨迹" desc="用任务轨迹替代欢迎页，直接展示系统闭环。" tag="Live">
        <div class="track-panel">
          <div class="track-node is-done">简历</div>
          <div class="track-link"></div>
          <div class="track-node is-active">岗位</div>
          <div class="track-link"></div>
          <div class="track-node">匹配</div>
          <div class="track-link"></div>
          <div class="track-node">路径</div>
        </div>
        <div class="progress-stack">
          <ProgressLine v-for="item in dashboard.stage" :key="item.label" :label="item.label" :value="item.value" :state="item.state" />
        </div>
      </UiCard>

      <UiCard title="快速动作" desc="每个动作都能落到一个真实页面。" tag="ActionList">
        <div class="action-list">
          <button v-for="item in dashboard.nextActions" :key="item.title" class="action-row" @click="router.push(item.to)">
            <Octicon :name="item.icon" />
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.detail }}</small>
            </span>
            <Octicon name="chevronRightIcon" />
          </button>
        </div>
      </UiCard>

      <UiCard title="后台任务" desc="异步处理状态要像 CI 任务一样清晰。" tag="Queue">
        <div class="progress-stack">
          <ProgressLine v-for="task in dashboard.tasks" :key="task.title" :label="task.title" :value="task.progress" :state="task.meta" />
        </div>
      </UiCard>
    </section>
  </div>
</template>
