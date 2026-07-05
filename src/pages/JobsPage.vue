<script setup>
import { useRouter } from "vue-router";
import { jobs } from "../data/mock";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";

const router = useRouter();
</script>

<template>
  <div class="page-grid">
    <div class="filter-bar">
      <button v-for="filter in jobs.filters" :key="filter" class="btn btn-sm">
        <Octicon name="filterIcon" />
        {{ filter }}
      </button>
    </div>

    <section class="jobs-layout">
      <UiCard title="岗位列表" desc="像 GitHub issue list 一样可扫描。" tag="14 results">
        <div class="job-list">
          <button v-for="job in jobs.list" :key="job.name" class="job-row" :class="{ 'is-active': job.active }">
            <div>
              <strong>{{ job.name }}</strong>
              <p>{{ job.desc }}</p>
            </div>
            <div class="job-row__meta">
              <span>Heat {{ job.heat }}</span>
              <b>{{ job.match }}%</b>
            </div>
          </button>
        </div>
      </UiCard>

      <UiCard title="岗位详情" desc="详情页只保留决策所需信息。" tag="Selected">
        <div class="detail-block">
          <h3>数据分析工程师</h3>
          <p>负责业务数据清洗、指标体系维护、报表构建和分析结论输出。</p>
        </div>
        <div class="two-column-tags">
          <div>
            <strong>必备技能</strong>
            <div class="skill-cloud compact">
              <span v-for="skill in jobs.required" :key="skill">{{ skill }}</span>
            </div>
          </div>
          <div>
            <strong>加分技能</strong>
            <div class="skill-cloud compact">
              <span v-for="skill in jobs.bonus" :key="skill">{{ skill }}</span>
            </div>
          </div>
        </div>
        <div class="form-footer">
          <button class="btn">
            <Octicon name="diffIcon" />
            加入对比
          </button>
          <button class="btn btn-primary" @click="router.push('/matching')">
            <Octicon name="targetIcon" />
            设为目标
          </button>
        </div>
      </UiCard>
    </section>
  </div>
</template>
