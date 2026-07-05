<script setup>
import { ref } from "vue";
import Octicon from "./Octicon.vue";

const isOpen = ref(false);
const input = ref("");
const quickPrompts = [
  "解释我的匹配分",
  "我下一步该学什么",
  "为什么缺 Airflow",
  "生成 6 周学习计划"
];
const messages = ref([
  {
    role: "agent",
    text: "我是能力图谱 Agent。可以帮你解释匹配结果、拆解技能差距，并把下一步行动变成学习路线。"
  },
  {
    role: "user",
    text: "我的目标岗位是数据分析工程师。"
  },
  {
    role: "agent",
    text: "当前匹配度 78%。优势是 Python、SQL 和数据清洗；主要缺口是 Airflow、A/B 测试和指标体系设计。建议先补齐指标体系，再做一个调度 Demo。"
  }
]);

function openAgent() {
  isOpen.value = true;
}

function closeAgent() {
  isOpen.value = false;
}

function askAgent(text) {
  const content = text || input.value.trim();

  if (!content) {
    return;
  }

  messages.value.push({ role: "user", text: content });
  messages.value.push({
    role: "agent",
    text: "这是原型 mock 回复：我会结合你的简历画像、目标岗位和图谱关系，给出可解释建议。真实版本可接入 Matching API、Graph API 和大模型服务。"
  });
  input.value = "";
}
</script>

<template>
  <button class="agent-fab" type="button" aria-label="打开 AI Agent" @click="openAgent">
    <Octicon name="sparkleFillIcon" :size="20" />
    <span>AI</span>
  </button>

  <button
    v-if="isOpen"
    class="agent-backdrop"
    type="button"
    aria-label="关闭 AI Agent"
    @click="closeAgent"
  ></button>

  <aside class="agent-drawer" :class="{ 'is-open': isOpen }" aria-label="AI Agent 对话">
    <header class="agent-head">
      <div>
        <p>Global Agent</p>
        <h2>岗位能力 AI 助手</h2>
      </div>
      <button class="btn btn-sm" type="button" @click="closeAgent">
        <Octicon name="xIcon" />
        关闭
      </button>
    </header>

    <div class="agent-context">
      <span>已接入：简历画像</span>
      <span>目标岗位</span>
      <span>能力图谱</span>
    </div>

    <section class="agent-messages">
      <article
        v-for="(message, index) in messages"
        :key="`${message.role}-${index}`"
        class="agent-message"
        :class="`agent-message--${message.role}`"
      >
        <strong>{{ message.role === "agent" ? "AI Agent" : "你" }}</strong>
        <p>{{ message.text }}</p>
      </article>
    </section>

    <div class="agent-quick">
      <button
        v-for="prompt in quickPrompts"
        :key="prompt"
        class="btn btn-sm"
        type="button"
        @click="askAgent(prompt)"
      >
        {{ prompt }}
      </button>
    </div>

    <form class="agent-compose" @submit.prevent="askAgent()">
      <input v-model="input" type="text" placeholder="问问匹配分、技能差距或学习路径..." />
      <button class="btn btn-primary" type="submit">
        <Octicon name="paperAirplaneIcon" />
        发送
      </button>
    </form>
  </aside>
</template>
