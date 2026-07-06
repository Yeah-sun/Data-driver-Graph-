import { learning } from "../data/mock";

const LEARNING_API_BASE = import.meta.env.VITE_LEARNING_API_BASE || "";

export async function requestLearningPlan(payload) {
  const response = await fetch(`${LEARNING_API_BASE}/api/learning-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Learning API 请求失败：${response.status}`);
  }

  return response.json();
}

export function getMockLearningPlanFile() {
  return {
    id: "plan-20260705-data-analyst",
    fileName: "数据分析工程师_六周能力提升方案.md",
    fileType: "Markdown / PDF",
    state: "已生成",
    generatedAt: "2026-07-05 14:30",
    summary: "基于当前匹配差距生成的六周执行方案，包含阶段目标、任务、交付物和验收标准。",
    downloadUrl: "#mock-learning-plan",
    sections: learning.plan.map((item) => ({
      period: item.week,
      title: item.title,
      objective: item.detail,
      deliverable: item.deliverable,
      acceptance: item.acceptance,
      workload: item.workload
    }))
  };
}
