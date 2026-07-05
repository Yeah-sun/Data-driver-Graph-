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

      <div class="repo-card">
        <div class="repo-card__head">
          <Octicon name="repoIcon" />
          <strong>UI branch</strong>
        </div>
        <p>Primer 风格基础，图谱产品语言增强。</p>
        <div class="mini-row">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
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
        <div class="user-chip">
          <span class="avatar">{{ displayName.slice(0, 1) }}</span>
          <div>
            <strong>{{ displayName }}</strong>
            <small>{{ displayRole }} · {{ session.school || "示例大学" }}</small>
          </div>
        </div>
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

    <AiAgentDrawer v-if="!isAdmin" />
  </div>
</template>
