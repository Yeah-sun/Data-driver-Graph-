<script setup>
import { admin } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
</script>

<template>
  <div class="page-grid admin-grid admin-page">
    <UiCard class="admin-card" title="用户管理" desc="管理学生、教师、管理员和演示账号的角色与状态。" tag="Accounts">
      <div class="admin-card__body">
        <div class="admin-toolbar">
          <button class="btn btn-primary">
            <Octicon name="personAddIcon" />
            新建用户
          </button>
          <button class="btn">批量导入账号</button>
        </div>
        <table class="data-table user-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>角色</th>
              <th>状态</th>
              <th>最近活跃</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in admin.users" :key="user.name">
              <td>
                <strong>{{ user.name }}</strong>
                <small>{{ user.org }}</small>
              </td>
              <td>{{ user.role }}</td>
              <td>
                <span class="status-pill" :class="`status-pill--${user.state}`">{{ user.state }}</span>
              </td>
              <td>{{ user.lastActive }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="form-footer">
        <button class="btn">重置密码</button>
        <button class="btn">审核通过</button>
        <button class="btn btn-danger">禁用账号</button>
      </div>
    </UiCard>

    <UiCard class="admin-card" title="数据导入" desc="只保留比赛闭环需要的导入能力。" tag="Import">
      <div class="admin-card__body">
        <div class="upload-zone compact-upload">
          <Octicon name="databaseIcon" :size="24" />
          <strong>导入 JD / 文档 / 技能库</strong>
          <button class="btn btn-primary">选择数据源</button>
        </div>
        <table class="data-table">
          <tbody>
            <tr v-for="item in admin.imports" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.state }}</td>
              <td>{{ item.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>

    <UiCard class="admin-card" title="岗位演化管理" desc="覆盖新岗位发现与既有岗位能力更新。" tag="Review">
      <div class="admin-card__body">
        <section class="job-evolution-section">
          <div class="job-evolution-section__head">
            <strong>新岗位发现与定义</strong>
            <span>Discovery</span>
          </div>
          <article v-for="item in admin.jobDiscovery" :key="item.title" class="job-evolution-card">
            <Octicon name="telescopeIcon" />
            <div>
              <div class="job-evolution-card__title">
                <strong>{{ item.title }}</strong>
                <span class="status-pill status-pill--待定义">{{ item.state }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.source }} · {{ item.signal }}</small>
            </div>
          </article>
        </section>

        <section class="job-evolution-section">
          <div class="job-evolution-section__head">
            <strong>既有岗位能力更新</strong>
            <span>Version update</span>
          </div>
          <article v-for="item in admin.jobUpdates" :key="item.title" class="job-evolution-card">
            <Octicon name="gitBranchIcon" />
            <div>
              <div class="job-evolution-card__title">
                <strong>{{ item.title }}</strong>
                <span class="status-pill status-pill--待发布">{{ item.state }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.source }} · {{ item.signal }}</small>
            </div>
          </article>
        </section>
      </div>
      <div class="form-footer">
        <button class="btn">定义新岗位</button>
        <button class="btn">保存更新草稿</button>
        <button class="btn btn-primary">发布到图谱</button>
      </div>
    </UiCard>

    <UiCard class="admin-card" title="测试中心" desc="评测指标用工程看板方式呈现。" tag="Evaluation">
      <div class="admin-card__body">
        <div class="test-grid">
          <article v-for="item in admin.tests" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </div>
      <div class="form-footer">
        <button class="btn btn-primary">
          <Octicon name="playIcon" />
          一键执行评测
        </button>
      </div>
    </UiCard>
  </div>
</template>
