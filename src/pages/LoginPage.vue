<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Octicon from "../components/Octicon.vue";
import { getHomePath, setSession } from "../utils/session";

const route = useRoute();
const router = useRouter();
const mode = ref("login");
const error = ref("");

const form = reactive({
  school: "示例大学",
  role: "student",
  account: "20260001",
  name: "张林",
  password: "demo123",
  confirmPassword: "demo123"
});

const isRegister = computed(() => mode.value === "register");

function switchMode(nextMode) {
  mode.value = nextMode;
  error.value = "";
}

function submit() {
  error.value = "";

  if (!form.school.trim() || !form.account.trim() || !form.password.trim()) {
    error.value = "请填写学校、账号和密码";
    return;
  }

  if (isRegister.value && form.password !== form.confirmPassword) {
    error.value = "两次输入的密码不一致";
    return;
  }

  setSession({
    school: form.school,
    role: form.role,
    account: form.account,
    name: form.name || form.account,
    loginAt: new Date().toISOString()
  });

  const target = form.role === "admin" ? "/admin" : route.query.redirect?.toString() || getHomePath(form.role);
  router.push(target);
}

function enterDemo() {
  setSession({
    school: "演示高校",
    role: "demo",
    account: "demo",
    name: "演示用户",
    loginAt: new Date().toISOString()
  });
  router.push(getHomePath("demo"));
}
</script>

<template>
  <main class="login-page">
    <section class="login-brand-panel">
      <div class="login-brand-panel__mark">DG</div>
      <p class="login-kicker">XH-202621 · 多源异构数据驱动</p>
      <h1>岗位能力图谱与动态演化分析平台</h1>
      <p class="login-copy">
        支持学生、教师和管理员进入同一套工作台。账号体系先用前端 mock 打通流程，后续可以替换为学校统一身份认证或自建用户服务。
      </p>

      <div class="login-proof-grid">
        <article>
          <strong>7</strong>
          <span>功能页面</span>
        </article>
        <article>
          <strong>3</strong>
          <span>账号角色</span>
        </article>
        <article>
          <strong>100+</strong>
          <span>JD 测试集</span>
        </article>
      </div>
    </section>

    <section class="login-card">
      <div class="login-tabs" role="tablist" aria-label="账号入口">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <div class="login-card__head">
        <h2>{{ isRegister ? "创建账户" : "登录账户" }}</h2>
        <p>{{ isRegister ? "注册后进入工作台，后续可绑定学校统一身份。" : "使用学号、工号或管理员账号进入系统。" }}</p>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label>
          <span>学校 / 单位</span>
          <input v-model="form.school" type="text" placeholder="请输入学校名称" />
        </label>

        <label>
          <span>身份</span>
          <select v-model="form.role">
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </label>

        <label v-if="isRegister">
          <span>姓名</span>
          <input v-model="form.name" type="text" placeholder="请输入姓名" />
        </label>

        <label>
          <span>账号</span>
          <input v-model="form.account" type="text" placeholder="学号 / 工号 / 管理员账号" />
        </label>

        <label>
          <span>密码</span>
          <input v-model="form.password" type="password" placeholder="请输入密码" />
        </label>

        <label v-if="isRegister">
          <span>确认密码</span>
          <input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
        </label>

        <p v-if="error" class="login-error">
          <Octicon name="alertIcon" />
          {{ error }}
        </p>

        <button class="btn btn-primary login-submit" type="submit">
          <Octicon :name="isRegister ? 'checkIcon' : 'signInIcon'" />
          {{ isRegister ? "注册并进入" : "登录" }}
        </button>
      </form>

      <div class="login-card__footer">
        <button class="btn btn-sm" @click="enterDemo">
          <Octicon name="playIcon" />
          游客演示
        </button>
        <span>当前为前端 mock 账户，不会提交到服务器。</span>
      </div>
    </section>
  </main>
</template>
