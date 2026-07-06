<script setup>
import { ref } from "vue";
import { learning } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
import { getMockLearningPlanFile, requestLearningPlan } from "../services/learningApi";

const planFile = ref(null);
const isGenerating = ref(false);
const error = ref("");

async function generatePlanFile() {
  isGenerating.value = true;
  error.value = "";

  try {
    planFile.value = await requestLearningPlan({
      targetJob: "数据分析工程师",
      gaps: learning.gaps.map((item) => item.title),
      durationWeeks: 6,
      output: ["markdown", "pdf"]
    });
  } catch (requestError) {
    planFile.value = getMockLearningPlanFile();
    error.value = `${requestError.message}，当前展示本地 mock 计划文件。`;
  } finally {
    isGenerating.value = false;
  }
}

function downloadPlanFile() {
  if (!planFile.value) {
    generatePlanFile();
  }
}
</script>

<template>
  <div class="page-grid learning-layout">
    <UiCard class="learning-card learning-card--input" title="差距队列" desc="作为计划文件生成请求的输入。" tag="Input">
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

    <UiCard class="learning-card learning-card--file" title="计划文件" desc="向 Learning API 请求一份可下载方案。" tag="Generated file">
      <p v-if="error" class="graph-error">{{ error }}</p>

      <div v-if="!planFile" class="plan-request-panel">
        <Octicon name="fileIcon" :size="28" />
        <strong>尚未生成学习计划文件</strong>
        <p>系统会基于目标岗位、技能差距和学习周期生成一份 Markdown / PDF 方案。</p>
        <button class="btn btn-primary" type="button" @click="generatePlanFile">
          <Octicon name="syncIcon" />
          {{ isGenerating ? "生成中" : "请求生成计划文件" }}
        </button>
      </div>

      <template v-else>
        <div class="plan-file-card">
          <div>
            <span class="status-pill status-pill--正常">{{ planFile.state }}</span>
            <h3>{{ planFile.fileName }}</h3>
            <p>{{ planFile.summary }}</p>
            <small>{{ planFile.fileType }} · {{ planFile.generatedAt }}</small>
          </div>
          <button class="btn btn-primary" type="button" @click="downloadPlanFile">
            <Octicon name="downloadIcon" />
            下载方案
          </button>
        </div>

        <div class="plan-file-scroll">
          <div class="timeline plan-file-outline">
            <article v-for="section in planFile.sections" :key="section.period">
              <span>{{ section.period }}</span>
              <div>
                <strong>{{ section.title }}</strong>
                <p>{{ section.objective }}</p>
                <p>交付物：{{ section.deliverable }}</p>
                <p>验收：{{ section.acceptance }} · {{ section.workload }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="form-footer">
          <button class="btn" type="button" @click="generatePlanFile">
            <Octicon name="syncIcon" />
            重新请求
          </button>
          <button class="btn btn-primary" type="button" @click="downloadPlanFile">
            <Octicon name="downloadIcon" />
            导出文件
          </button>
        </div>
      </template>
    </UiCard>
  </div>
</template>
