import { createRouter, createWebHashHistory } from "vue-router";
import { getHomePath, getSession, isAuthenticated } from "../utils/session";
import LoginPage from "../pages/LoginPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import ResumePage from "../pages/ResumePage.vue";
import JobsPage from "../pages/JobsPage.vue";
import MatchingPage from "../pages/MatchingPage.vue";
import LearningPage from "../pages/LearningPage.vue";
import GraphPage from "../pages/GraphPage.vue";
import AdminPage from "../pages/AdminPage.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: LoginPage, meta: { public: true } },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: { title: "我的工作台", kicker: "个人进度与下一步动作", businessOnly: true }
  },
  {
    path: "/resume",
    name: "resume",
    component: ResumePage,
    meta: { title: "简历中心", kicker: "上传、解析、校对", businessOnly: true }
  },
  {
    path: "/jobs",
    name: "jobs",
    component: JobsPage,
    meta: { title: "岗位探索", kicker: "筛选、详情、对比", businessOnly: true }
  },
  {
    path: "/matching",
    name: "matching",
    component: MatchingPage,
    meta: { title: "匹配分析", kicker: "评分、解释、缺口", businessOnly: true }
  },
  {
    path: "/learning",
    name: "learning",
    component: LearningPage,
    meta: { title: "学习路径", kicker: "差距转行动", businessOnly: true }
  },
  {
    path: "/graph",
    name: "graph",
    component: GraphPage,
    meta: { title: "能力图谱", kicker: "岗位、技能、演化", businessOnly: true }
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPage,
    meta: { title: "管理后台", kicker: "用户、数据、岗位、评测", adminOnly: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to) => {
  const session = getSession();

  if (to.meta.public) {
    if (session?.account) {
      return getHomePath(session.role);
    }
    return true;
  }

  if (!isAuthenticated()) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.meta.adminOnly && session?.role !== "admin") {
    return getHomePath(session?.role);
  }

  if (to.meta.businessOnly && session?.role === "admin") {
    return getHomePath(session.role);
  }

  return true;
});

export default router;
