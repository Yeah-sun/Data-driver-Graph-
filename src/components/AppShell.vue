<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { navItems, workspace } from "../data/mock";
import { clearSession, getSession } from "../utils/session";
import AiAgentDrawer from "./AiAgentDrawer.vue";
import Octicon from "./Octicon.vue";

const route = useRoute();
const router = useRouter();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const isSettingsOpen = ref(false);
const agentEndpoint = ref("https://api.example.com/v1/agent/chat");
const agentApiKey = ref("");
const session = computed(() => getSession() || {});
const pageTitle = computed(() => route.meta.title || "工作台");
const pageKicker = computed(() => route.meta.kicker || "产品原型");
const displayName = computed(() => session.value.name || workspace.user);
const isAdmin = computed(() => session.value.role === "admin");
const visibleNavItems = computed(() =>
  navItems.filter((item) => (isAdmin.value ? item.admin : !item.admin))
);
const searchHint = computed(() =>
  isAdmin.value ? "搜索用户、导入任务、岗位版本或测试报告" : workspace.query
);
const notices = computed(() =>
  isAdmin.value ? ["待审核账号 2 个", "JD 导入任务运行中", "评测报告已更新"] : workspace.notices
);
const displayRole = computed(() => {
  const roleMap = {
    student: "学生",
    teacher: "教师",
    admin: "管理员",
    demo: "游客演示"
  };
  return roleMap[session.value.role] || workspace.role;
});

function logout() {
  clearSession();
  router.push("/login");
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

function isDrawerMode() {
  return window.matchMedia("(max-width: 1320px), (orientation: landscape) and (max-height: 820px)").matches;
}

function toggleSidebar() {
  if (isDrawerMode()) {
    isSidebarOpen.value = true;
    return;
  }

  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  isSidebarOpen.value = false;
}

function openSettings() {
  isSettingsOpen.value = true;
}

function closeSettings() {
  isSettingsOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar();
  }
);
</script>

<template>
  <div class="app-shell" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <button
      v-if="isSidebarOpen"
      class="side-backdrop"
      type="button"
      aria-label="关闭菜单"
      @click="closeSidebar"
    ></button>

    <aside id="app-sidebar" class="side-panel" :class="{ 'is-open': isSidebarOpen }">
      <div class="brand-row">
        <div class="brand-mark">DG</div>
        <div>
          <strong>岗位能力图谱</strong>
          <span>Graph Workbench</span>
        </div>
      </div>

      <nav class="nav-stack">
        <RouterLink
          v-for="item in visibleNavItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="is-active"
          @click="closeSidebar"
        >
          <Octicon :name="item.icon" :size="18" />
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.detail }}</small>
          </span>
        </RouterLink>
      </nav>

      <a class="repo-card" href="https://github.com/Yeah-sun/Data-driver-Graph-" target="_blank" rel="noreferrer">
        <div class="repo-card__head">
          <Octicon name="githubIcon" />
          <strong>Yeah-sun/Data-driver-Graph-</strong>
        </div>
        <p>GitHub 项目源码地址，前端原型、接口文档和图谱交互统一版本管理。</p>
        <div class="repo-card__meta">
          <span>
            <Octicon name="gitBranchIcon" />
            版本控制
          </span>
          <span>
            <Octicon name="repoIcon" />
            源码仓库
          </span>
        </div>
      </a>
    </aside>

    <main class="main-panel">
      <header class="top-bar">
        <button
          class="btn btn-sm menu-toggle"
          type="button"
          :aria-expanded="isSidebarOpen || !isSidebarCollapsed"
          aria-controls="app-sidebar"
          @click="toggleSidebar"
        >
          <Octicon name="threeBarsIcon" />
          {{ isSidebarCollapsed ? "显示菜单" : "菜单" }}
        </button>
        <div class="search-box">
          <Octicon name="searchIcon" />
          <span>{{ searchHint }}</span>
        </div>
        <div class="notice-strip">
          <span v-for="notice in notices" :key="notice">{{ notice }}</span>
        </div>
        <button class="user-chip user-chip--button" type="button" aria-label="打开用户配置" @click="openSettings">
          <span class="avatar">{{ displayName.slice(0, 1) }}</span>
          <div>
            <strong>{{ displayName }}</strong>
            <small>{{ displayRole }}</small>
          </div>
        </button>
        <button class="btn btn-sm" @click="logout">
          <Octicon name="signOutIcon" />
          退出
        </button>
      </header>

      <section class="page-head">
        <div>
          <p>{{ pageKicker }}</p>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="page-head__actions">
          <button class="btn btn-sm">
            <Octicon name="syncIcon" />
            刷新状态
          </button>
          <button class="btn btn-sm btn-primary">
            <Octicon name="playIcon" />
            演示流程
          </button>
        </div>
      </section>

      <RouterView />
    </main>

    <Teleport to="body">
      <div v-if="isSettingsOpen" class="settings-modal-layer">
        <button class="settings-modal-backdrop" type="button" aria-label="关闭用户配置" @click="closeSettings"></button>
        <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <header class="settings-modal__head">
            <div>
              <p>Account settings</p>
              <h2 id="settings-title">用户配置</h2>
            </div>
            <button class="btn btn-sm" type="button" @click="closeSettings">
              <Octicon name="xIcon" />
              关闭
            </button>
          </header>

          <div class="settings-profile">
            <span class="avatar">{{ displayName.slice(0, 1) }}</span>
            <div>
              <strong>{{ displayName }}</strong>
              <small>{{ displayRole }} · {{ session.school || "示例大学" }}</small>
            </div>
          </div>

          <div class="settings-grid">
            <label>
              <span>账号角色</span>
              <input :value="displayRole" readonly />
            </label>
            <label>
              <span>所属单位</span>
              <input :value="session.school || '示例大学'" readonly />
            </label>
            <label class="settings-grid__wide">
              <span>AI Agent 配置地址</span>
              <input v-model="agentEndpoint" placeholder="https://api.example.com/v1/agent/chat" />
            </label>
            <label class="settings-grid__wide">
              <span>API Key</span>
              <input v-model="agentApiKey" type="password" placeholder="sk-..." autocomplete="off" />
            </label>
          </div>

          <footer class="settings-modal__foot">
            <span>当前为前端 mock 配置，不会提交到服务器。</span>
            <button class="btn btn-primary" type="button" @click="closeSettings">
              <Octicon name="checkIcon" />
              保存配置
            </button>
          </footer>
        </section>
      </div>
    </Teleport>

    <AiAgentDrawer v-if="!isAdmin" />
  </div>
</template>
