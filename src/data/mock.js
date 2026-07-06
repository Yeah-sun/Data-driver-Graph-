export const navItems = [
  { to: "/dashboard", label: "工作台", icon: "homeIcon", detail: "总览与入口" },
  { to: "/resume", label: "简历中心", icon: "uploadIcon", detail: "解析与校对" },
  { to: "/jobs", label: "岗位探索", icon: "telescopeIcon", detail: "筛选与对比" },
  { to: "/matching", label: "匹配分析", icon: "graphIcon", detail: "评分与解释" },
  { to: "/learning", label: "学习路径", icon: "projectRoadmapIcon", detail: "路线与导出" },
  { to: "/graph", label: "能力图谱", icon: "gitBranchIcon", detail: "关系与演化" },
  { to: "/admin", label: "管理后台", icon: "toolsIcon", detail: "用户与平台管理", admin: true }
];

export const workspace = {
  user: "张林",
  role: "学生端",
  query: "搜索岗位、技能、图谱节点或任务",
  notices: ["简历画像待复核 3 项", "学习路径生成中", "图谱快照已更新"]
};

export const dashboard = {
  stage: [
    { label: "简历解析", value: 100, state: "完成" },
    { label: "目标岗位", value: 70, state: "进行中" },
    { label: "差距路径", value: 35, state: "待生成" }
  ],
  stats: [
    { label: "当前匹配", value: "78%", tone: "success", detail: "数据分析工程师" },
    { label: "推荐岗位", value: "14", tone: "accent", detail: "覆盖 3 个赛道" },
    { label: "待复核技能", value: "3", tone: "warning", detail: "Airflow 等待确认" },
    { label: "测试样本", value: "128", tone: "neutral", detail: "JD 与简历混合集" }
  ],
  nextActions: [
    { title: "确认简历画像", detail: "复核低置信技能后保存为最新画像", to: "/resume", icon: "checkCircleIcon" },
    { title: "比较两个目标岗位", detail: "查看数据分析与 BI 开发的技能差异", to: "/jobs", icon: "diffIcon" },
    { title: "打开岗位能力图谱", detail: "从目标岗位展开核心技能与演化快照", to: "/graph", icon: "gitBranchIcon" }
  ],
  tasks: [
    { title: "学习路径生成", meta: "运行中", progress: 64 },
    { title: "图谱局部展开", meta: "队列中", progress: 28 },
    { title: "简历画像保存", meta: "成功", progress: 100 }
  ]
};

export const resume = {
  files: [
    { name: "张林-求职简历-v3.pdf", state: "解析中", size: "1.8 MB", time: "14:08" },
    { name: "张林-项目版简历.docx", state: "已归档", size: "544 KB", time: "昨天" }
  ],
  steps: ["文件校验", "文本抽取", "技能识别", "人工校对"],
  skills: [
    ["Python", "熟练"],
    ["SQL", "熟练"],
    ["Pandas", "熟练"],
    ["Tableau", "实践"],
    ["Airflow", "了解"],
    ["A/B 测试", "了解"],
    ["指标分析", "实践"],
    ["数据清洗", "熟练"]
  ],
  reviews: [
    { title: "Airflow", detail: "仅从调度平台描述中推断，建议确认" },
    { title: "指标体系设计", detail: "证据不足，可能应降级为了解" },
    { title: "Tableau", detail: "项目证据较强，可考虑提升熟练度" }
  ],
  graph: {
    root: "张林简历画像",
    nodes: [
      { id: "candidate", label: "张林", type: "candidate", x: 50, y: 48 },
      { id: "python", label: "Python", type: "skill", x: 20, y: 24 },
      { id: "sql", label: "SQL", type: "skill", x: 80, y: 24 },
      { id: "pandas", label: "Pandas", type: "skill", x: 18, y: 72 },
      { id: "metric", label: "指标分析", type: "skill", x: 82, y: 72 },
      { id: "project", label: "用户留存项目", type: "evidence", x: 50, y: 84 },
      { id: "airflow", label: "Airflow", type: "risk", x: 50, y: 16 }
    ],
    relationships: [
      { source: "candidate", target: "python", label: "熟练" },
      { source: "candidate", target: "sql", label: "熟练" },
      { source: "candidate", target: "pandas", label: "熟练" },
      { source: "candidate", target: "metric", label: "实践" },
      { source: "candidate", target: "project", label: "证据" },
      { source: "candidate", target: "airflow", label: "待复核" }
    ]
  },
  graphStats: [
    { label: "技能节点", value: "5" },
    { label: "项目证据", value: "1" },
    { label: "待复核关系", value: "1" }
  ]
};

export const jobs = {
  filters: ["AI 数据应用", "初级 / 中级", "最近 90 天", "热度优先"],
  list: [
    { name: "数据分析工程师", heat: 92, match: 78, desc: "SQL、Python、指标体系和业务分析综合岗位", active: true },
    { name: "BI 开发工程师", heat: 84, match: 74, desc: "偏报表交付、数仓理解和可视化建模" },
    { name: "数据产品分析师", heat: 79, match: 67, desc: "偏用户分析、实验设计和产品策略" }
  ],
  required: ["SQL", "Python", "Pandas", "统计分析", "业务理解", "报表分析"],
  bonus: ["Airflow", "A/B 测试", "埋点设计", "数仓建模"]
};

export const matching = {
  score: 78,
  parts: [
    { label: "必备技能", value: 84 },
    { label: "加分技能", value: 56 },
    { label: "项目经验", value: 73 },
    { label: "语义相似", value: 81 }
  ],
  hits: ["Python", "SQL", "Pandas", "数据清洗"],
  gaps: ["Airflow", "A/B 测试", "指标体系设计"],
  notes: [
    { title: "优势项", detail: "工具链完整，基础分析能力稳定" },
    { title: "主要短板", detail: "企业级流程和指标方法论证据不足" }
  ]
};

export const learning = {
  gaps: [
    { title: "指标体系设计", detail: "从业务目标拆解核心指标和评估口径" },
    { title: "Airflow 调度", detail: "补齐 DAG、依赖、失败重试和调度场景" },
    { title: "实验分析", detail: "学习 A/B 测试、样本分组与结果解释" }
  ],
  plan: [
    {
      week: "第 1-2 周",
      title: "业务分析基本功",
      detail: "复盘一份业务案例，输出指标树和分析结论",
      deliverable: "1 份指标树说明文档",
      acceptance: "能解释指标口径、业务目标和分析结论",
      workload: "每周 5 小时"
    },
    {
      week: "第 3-4 周",
      title: "数据流程工程化",
      detail: "完成一个调度任务 demo 并记录异常处理",
      deliverable: "1 个 Airflow DAG demo",
      acceptance: "包含依赖、失败重试和运行日志截图",
      workload: "每周 6 小时"
    },
    {
      week: "第 5-6 周",
      title: "作品集强化",
      detail: "把项目改写成面试可讲述的业务故事",
      deliverable: "1 份项目复盘和面试讲稿",
      acceptance: "能围绕问题、方法、结果、反思完整讲述",
      workload: "每周 4 小时"
    }
  ]
};

export const graph = {
  nodes: [
    { id: "job:data-analyst", name: "数据分析工程师", type: "job", x: 50, y: 48, relationCount: 6 },
    { id: "skill:sql", name: "SQL", type: "skill", x: 18, y: 24, relationCount: 3 },
    { id: "skill:python", name: "Python", type: "skill", x: 76, y: 22, relationCount: 4 },
    { id: "skill:metric", name: "指标体系", type: "skill", x: 78, y: 72, relationCount: 5 },
    { id: "skill:viz", name: "可视化", type: "skill", x: 22, y: 76, relationCount: 2 },
    { id: "skill:airflow", name: "Airflow", type: "skill", x: 52, y: 86, relationCount: 2 },
    { id: "resource:airflow-dag", name: "DAG 编排", type: "resource", x: 63, y: 82, relationCount: 1 },
    { id: "resource:airflow-retry", name: "失败重试", type: "resource", x: 44, y: 88, relationCount: 1 },
    { id: "evidence:metric-tree", name: "指标树案例", type: "evidence", x: 86, y: 78, relationCount: 1 }
  ],
  relationships: [
    { id: "rel:sql", source: "job:data-analyst", target: "skill:sql", type: "REQUIRES", weight: 0.96 },
    { id: "rel:python", source: "job:data-analyst", target: "skill:python", type: "REQUIRES", weight: 0.92 },
    { id: "rel:metric", source: "job:data-analyst", target: "skill:metric", type: "CORE_SKILL", weight: 0.88 },
    { id: "rel:viz", source: "job:data-analyst", target: "skill:viz", type: "BONUS_SKILL", weight: 0.72 },
    { id: "rel:airflow", source: "job:data-analyst", target: "skill:airflow", type: "EVOLVING_SKILL", weight: 0.66 },
    { id: "rel:airflow-dag", source: "skill:airflow", target: "resource:airflow-dag", type: "HAS_SUB_SKILL", weight: 0.58 },
    { id: "rel:airflow-retry", source: "skill:airflow", target: "resource:airflow-retry", type: "HAS_SUB_SKILL", weight: 0.54 },
    { id: "rel:metric-tree", source: "skill:metric", target: "evidence:metric-tree", type: "HAS_EVIDENCE", weight: 0.62 }
  ],
  versions: [
    { time: "2026.06", text: "新增指标体系设计与实验分析要求" },
    { time: "2026.04", text: "加强报表讲述和可视化表达" },
    { time: "2026.01", text: "核心仍集中在 SQL、Python 与数据清洗" }
  ]
};

export const admin = {
  imports: [
    { name: "JD 批量导入", state: "运行中", count: "100 条" },
    { name: "技能标准库更新", state: "成功", count: "312 项" }
  ],
  jobDiscovery: [
    {
      title: "AI 数据运营分析师",
      source: "近 30 天 JD 聚类",
      signal: "新增 42 条相似 JD",
      state: "待定义",
      detail: "系统发现岗位职责集中在数据分析、AI 工具运营和指标复盘，需要管理员定义岗位边界。"
    }
  ],
  jobUpdates: [
    {
      title: "数据分析工程师",
      source: "存量岗位版本 v2026.06",
      signal: "新增 3 项能力要求",
      state: "待发布",
      detail: "Airflow、A/B 测试和指标体系设计权重上升，待同步到能力图谱。"
    }
  ],
  tests: [
    { label: "JD 解析准确率", value: "91%" },
    { label: "简历提取准确率", value: "89%" },
    { label: "匹配准确率", value: "87%" },
    { label: "测试用例数", value: "128" }
  ],
  users: [
    { name: "张林", role: "学生", org: "软件学院", state: "正常", lastActive: "今天 14:08" },
    { name: "陈老师", role: "教师", org: "就业指导中心", state: "待审核", lastActive: "昨天" },
    { name: "系统管理员", role: "管理员", org: "平台运维组", state: "正常", lastActive: "10 分钟前" },
    { name: "演示账号", role: "游客", org: "比赛演示", state: "受限", lastActive: "刚刚" }
  ]
};
