<script setup>
import { useRouter } from "vue-router";
import { resume } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";

const router = useRouter();
</script>

<template>
  <div class="page-grid resume-grid">
    <UiCard title="文件上传" desc="简历入口保持清楚、克制、可重复操作。" tag="PDF / DOCX">
      <div class="upload-zone">
        <Octicon name="uploadIcon" :size="28" />
        <strong>拖拽文件到这里</strong>
        <span>支持单文件或批量上传，解析任务会进入队列。</span>
        <button class="btn btn-primary">
          <Octicon name="fileIcon" />
          选择文件
        </button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>文件</th><th>状态</th><th>大小</th><th>时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="file in resume.files" :key="file.name">
            <td>{{ file.name }}</td>
            <td><span class="Label Label--secondary">{{ file.state }}</span></td>
            <td>{{ file.size }}</td>
            <td>{{ file.time }}</td>
          </tr>
        </tbody>
      </table>
    </UiCard>

    <UiCard title="解析步骤" desc="状态用步骤块表达，方便演示长任务。" tag="Running">
      <div class="step-strip">
        <div v-for="(step, index) in resume.steps" :key="step" class="step-cell" :class="{ 'is-active': index < 3 }">
          <span>{{ index + 1 }}</span>
          <strong>{{ step }}</strong>
        </div>
      </div>
      <div class="review-list">
        <article v-for="item in resume.reviews" :key="item.title">
          <Octicon name="alertIcon" />
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </UiCard>

    <UiCard title="技能画像" desc="先以标签和熟练度呈现，后续再接真实编辑器。" tag="Editable">
      <div class="skill-cloud">
        <span v-for="skill in resume.skills" :key="skill[0]">
          {{ skill[0] }}
          <b>{{ skill[1] }}</b>
        </span>
      </div>
      <div class="form-footer">
        <button class="btn">
          <Octicon name="pencilIcon" />
          编辑技能
        </button>
        <button class="btn btn-primary" @click="router.push('/jobs')">
          <Octicon name="checkIcon" />
          保存并选岗位
        </button>
      </div>
    </UiCard>
  </div>
</template>
