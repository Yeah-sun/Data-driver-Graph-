<script setup>
import { useRouter } from "vue-router";
import { resume } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";

const router = useRouter();

const getGraphNode = (id) => resume.graph.nodes.find((node) => node.id === id);
</script>

<template>
  <div class="page-grid resume-workspace">
    <section class="resume-primary">
      <UiCard title="技能画像与解析图谱" desc="简历上传解析后，系统返回技能标签、证据链和局部知识图谱。" tag="Parsed profile">
        <div class="resume-profile-summary">
          <div>
            <strong>{{ resume.graph.root }}</strong>
            <span>候选人能力、项目证据和待复核技能已结构化。</span>
          </div>
          <div class="resume-graph-stats">
            <span v-for="item in resume.graphStats" :key="item.label">
              <strong>{{ item.value }}</strong>
              {{ item.label }}
            </span>
          </div>
        </div>

        <div class="resume-skill-section">
          <div class="resume-section-title">
            <strong>技能节点</strong>
            <span>{{ resume.skills.length }} 项</span>
          </div>
          <div class="skill-cloud resume-skill-cloud">
            <span v-for="skill in resume.skills" :key="skill[0]">
              {{ skill[0] }}
              <b>{{ skill[1] }}</b>
            </span>
          </div>
        </div>

        <div class="resume-graph-canvas">
          <svg class="resume-graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <g v-for="rel in resume.graph.relationships" :key="`${rel.source}-${rel.target}`">
              <line
                :x1="getGraphNode(rel.source)?.x"
                :y1="getGraphNode(rel.source)?.y"
                :x2="getGraphNode(rel.target)?.x"
                :y2="getGraphNode(rel.target)?.y"
              />
              <text
                :x="((getGraphNode(rel.source)?.x || 0) + (getGraphNode(rel.target)?.x || 0)) / 2"
                :y="((getGraphNode(rel.source)?.y || 0) + (getGraphNode(rel.target)?.y || 0)) / 2"
              >
                {{ rel.label }}
              </text>
            </g>
          </svg>
          <button
            v-for="node in resume.graph.nodes"
            :key="node.id"
            class="resume-graph-node"
            :class="`resume-graph-node--${node.type}`"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            type="button"
          >
            {{ node.label }}
          </button>
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
    </section>

    <aside class="resume-side">
      <UiCard title="解析步骤" desc="长任务状态和人工复核入口。" tag="Running">
        <div class="step-strip resume-step-strip">
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

      <UiCard title="文件上传" desc="上传后发起解析任务，完成后刷新左侧画像与图谱。" tag="PDF / DOCX">
        <div class="upload-zone resume-upload-zone">
          <Octicon name="uploadIcon" :size="26" />
          <strong>拖拽文件到这里</strong>
          <span>支持单文件或批量上传，解析任务会进入队列。</span>
          <button class="btn btn-primary">
            <Octicon name="fileIcon" />
            选择文件
          </button>
        </div>
        <div class="resume-file-list">
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
        </div>
      </UiCard>
    </aside>
  </div>
</template>
