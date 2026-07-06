<script setup>
import { useRouter } from "vue-router";
import { matching } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
import ProgressLine from "../components/ProgressLine.vue";

const router = useRouter();
</script>

<template>
  <div class="page-grid matching-grid matching-page">
    <UiCard title="综合评分" desc="给出明确结果，同时保留解释入口。" tag="Report">
      <div class="score-panel">
        <div class="score-summary">
          <div class="score-ring">
            <strong>{{ matching.score }}</strong>
            <span>部分匹配</span>
          </div>
          <div class="score-copy">
            <span class="Label Label--accent">建议进入差距修复</span>
            <strong>基础能力可覆盖目标岗位，仍需补齐工程化经验。</strong>
            <p>系统已识别核心命中项和主要缺口，可继续生成可执行学习路径。</p>
          </div>
        </div>
        <div class="score-actions">
          <span>下一步：生成 6 周差距行动计划</span>
          <button class="btn btn-primary" @click="router.push('/learning')">
            <Octicon name="arrowRightIcon" />
            查看差距路径
          </button>
        </div>
      </div>
    </UiCard>

    <UiCard title="分项解释" desc="评分拆解为可行动的信息。" tag="Explainable">
      <div class="progress-stack">
        <ProgressLine v-for="item in matching.parts" :key="item.label" :label="item.label" :value="item.value" />
      </div>
    </UiCard>

    <UiCard title="命中与缺口" desc="用两个清单建立用户信任。" tag="Skill diff">
      <div class="diff-columns">
        <div>
          <strong>命中技能</strong>
          <span v-for="item in matching.hits" :key="item" class="Label Label--success">{{ item }}</span>
        </div>
        <div>
          <strong>主要缺口</strong>
          <span v-for="item in matching.gaps" :key="item" class="Label Label--attention">{{ item }}</span>
        </div>
      </div>
    </UiCard>

    <UiCard title="系统结论" desc="短句、明确、能指导下一步。" tag="Summary">
      <div class="review-list">
        <article v-for="item in matching.notes" :key="item.title">
          <Octicon name="commentDiscussionIcon" />
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </UiCard>
  </div>
</template>
