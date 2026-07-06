# 页面接口文档

## 1. 文档说明

本文档按当前 Vue3 UI 原型反推接口，目标是说明每个界面为了展示需要获取哪些数据，用户点击按钮后需要提交哪些数据。第一版服务于前后端联调和比赛演示，不展开数据库表设计，也不追求完整 OpenAPI 规范。

统一约定：

- 基础路径：`/api`
- 鉴权方式：登录后由后端返回 `token`，前端请求时通过 `Authorization: Bearer <token>` 携带。
- 返回格式：所有接口默认返回 `{ code, message, data }`。
- 时间格式：使用 ISO 字符串，例如 `2026-07-06T14:30:00+08:00`。
- 分页参数：列表接口统一支持 `page`、`pageSize`，返回 `items`、`total`。
- 异步任务：上传解析、匹配计算、学习计划生成、数据导入、评测执行统一返回 `taskId`，前端通过 Task API 查询进度。

通用任务对象：

```json
{
  "taskId": "task_001",
  "type": "resume_parse",
  "status": "pending | running | success | failed",
  "progress": 64,
  "message": "正在识别技能标签",
  "resultId": "result_001",
  "error": null,
  "createdAt": "2026-07-06T14:30:00+08:00",
  "updatedAt": "2026-07-06T14:31:00+08:00"
}
```

## 2. 登录 / 注册页

页面目标：提供学生、教师、管理员、游客演示的账号入口，并按角色进入不同界面。管理员进入管理后台，普通用户进入业务工作台。

进入页面需要获取的数据：

- 可选：学校列表、角色列表、登录配置。

用户提交的数据：

- 学校或单位名称
- 角色：`student`、`teacher`、`admin`、`demo`
- 账号
- 密码
- 注册时的姓名和确认密码

页面展示字段：

- 当前模式：登录 / 注册
- 学校名称
- 角色选项
- 账号输入框
- 密码输入框
- 表单错误信息

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 登录 | `POST /api/auth/login` | 成功后保存会话，管理员跳转 `/admin`，普通用户跳转 `/dashboard` |
| 注册并进入 | `POST /api/auth/register` | 成功后自动登录并按角色跳转 |
| 游客演示 | `POST /api/auth/demo-session` | 创建演示会话并进入 `/dashboard` |
| 退出 | `POST /api/auth/logout` | 清除会话并回到 `/login` |

接口说明：

### `POST /api/auth/login`

接口用途：账号密码登录。

请求参数：

```json
{
  "school": "示例大学",
  "role": "student",
  "account": "20260001",
  "password": "******"
}
```

响应字段：

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user_001",
    "name": "张林",
    "school": "示例大学",
    "role": "student",
    "avatarText": "张"
  },
  "homePath": "/dashboard"
}
```

### `POST /api/auth/register`

接口用途：创建账号并返回登录会话。

请求参数：

```json
{
  "school": "示例大学",
  "role": "student",
  "name": "张林",
  "account": "20260001",
  "password": "******"
}
```

响应字段：同登录接口。

### `GET /api/auth/me`

接口用途：刷新页面后恢复当前用户会话。

响应字段：

```json
{
  "id": "user_001",
  "name": "张林",
  "school": "示例大学",
  "role": "student",
  "avatarText": "张"
}
```

异常 / 空态：

- 账号或密码错误：提示“账号或密码不正确”。
- 管理员访问业务页：后端可返回 `403`，前端回到管理员首页。
- 普通用户访问管理后台：后端返回 `403`，前端回到工作台。

## 3. 我的工作台

页面目标：展示用户主流程进度、关键指标、推荐动作和最近任务状态，是业务用户的总入口。

进入页面需要获取的数据：

- 用户基本信息
- 主流程进度
- 当前推荐动作
- 统计卡片
- 最近异步任务
- 顶部通知

用户提交的数据：

- 刷新工作台状态
- 点击动作行进入对应页面，通常不提交后端

页面展示字段：

- `user.name`：用户姓名
- `workflow.stage[].label`：流程节点名称
- `workflow.stage[].progress`：流程进度
- `stats[].label`、`stats[].value`、`stats[].detail`：指标卡
- `nextActions[].title`、`nextActions[].targetPath`：快捷动作
- `tasks[].status`、`tasks[].progress`：任务状态

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 刷新状态 | `GET /api/dashboard/summary` + `GET /api/tasks/recent` | 重新渲染指标和任务进度 |
| 演示流程 | 无后端接口 | 触发前端演示态或引导 |
| 继续主流程 | 无后端接口 | 根据当前阶段跳转到简历、岗位、匹配或学习路径 |
| 快速动作行 | 无后端接口 | 跳转到目标页面 |

### `GET /api/dashboard/summary`

接口用途：获取工作台聚合视图。

响应字段：

```json
{
  "user": {
    "id": "user_001",
    "name": "张林",
    "role": "student",
    "school": "示例大学"
  },
  "notices": ["简历画像待复核 3 项", "学习路径生成中"],
  "workflow": {
    "currentStage": "target_job",
    "nextPath": "/resume",
    "stage": [
      { "label": "简历解析", "progress": 100, "state": "完成" },
      { "label": "目标岗位", "progress": 70, "state": "进行中" },
      { "label": "差距路径", "progress": 35, "state": "待生成" }
    ]
  },
  "stats": [
    { "label": "当前匹配", "value": "78%", "tone": "success", "detail": "数据分析工程师" }
  ],
  "nextActions": [
    {
      "title": "确认简历画像",
      "detail": "复核低置信技能后保存为最新画像",
      "targetPath": "/resume",
      "icon": "checkCircleIcon"
    }
  ]
}
```

### `GET /api/tasks/recent`

接口用途：获取最近任务状态。

响应字段：

```json
{
  "items": [
    {
      "taskId": "task_001",
      "title": "学习路径生成",
      "status": "running",
      "progress": 64,
      "message": "正在生成计划文件"
    }
  ]
}
```

异常 / 空态：

- 无推荐动作：展示“当前没有待处理事项”。
- 任务查询失败：保留上次展示数据，显示轻量错误提示。

## 4. 简历中心

页面目标：上传简历、查看解析进度、校对技能画像，并保存为后续岗位匹配的输入。

进入页面需要获取的数据：

- 简历文件列表
- 最新简历解析任务
- 技能画像
- 待人工复核项

用户提交的数据：

- 简历文件
- 解析任务请求
- 人工校对后的技能标签、熟练度、证据说明
- 确认后的简历画像

页面展示字段：

- `files[].name`、`files[].state`、`files[].size`、`files[].uploadedAt`
- `parseSteps[].label`、`parseSteps[].state`
- `skills[].name`、`skills[].level`、`skills[].confidence`
- `reviews[].title`、`reviews[].detail`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 选择文件 | `POST /api/resumes/upload` | 上传文件并得到 `resumeId` |
| 发起解析 | `POST /api/resumes/{resumeId}/parse` | 返回 `taskId`，轮询 Task API |
| 编辑技能 | 前端编辑态，可选 `PUT /api/resumes/{resumeId}/profile` | 修改技能标签和熟练度 |
| 保存并选岗位 | `PUT /api/resumes/{resumeId}/profile` | 保存画像后跳转 `/jobs` |

### `GET /api/resumes`

接口用途：获取当前用户的简历列表和最新画像摘要。

响应字段：

```json
{
  "items": [
    {
      "resumeId": "resume_001",
      "fileName": "张林-求职简历-v3.pdf",
      "fileType": "pdf",
      "size": 1887436,
      "state": "parsed",
      "uploadedAt": "2026-07-06T14:08:00+08:00"
    }
  ],
  "latestProfileId": "profile_001"
}
```

### `POST /api/resumes/upload`

接口用途：上传简历文件。

请求参数：`multipart/form-data`

| 字段 | 说明 |
| --- | --- |
| `file` | PDF / DOCX 简历文件 |

响应字段：

```json
{
  "resumeId": "resume_001",
  "fileName": "张林-求职简历-v3.pdf",
  "state": "uploaded"
}
```

### `POST /api/resumes/{resumeId}/parse`

接口用途：发起简历解析任务。

响应字段：

```json
{
  "taskId": "task_resume_parse_001"
}
```

### `GET /api/resumes/{resumeId}/profile`

接口用途：获取解析后的简历画像。

响应字段：

```json
{
  "profileId": "profile_001",
  "resumeId": "resume_001",
  "skills": [
    {
      "skillId": "skill_python",
      "name": "Python",
      "level": "熟练",
      "confidence": 0.92,
      "evidence": "项目经历中多次出现 Python 数据处理"
    }
  ],
  "reviews": [
    {
      "skillName": "Airflow",
      "suggestion": "建议人工确认",
      "reason": "仅从调度平台描述中推断"
    }
  ],
  "parseSteps": [
    { "label": "文件校验", "state": "success" },
    { "label": "文本抽取", "state": "success" },
    { "label": "技能识别", "state": "success" },
    { "label": "人工校对", "state": "pending" }
  ]
}
```

### `PUT /api/resumes/{resumeId}/profile`

接口用途：保存人工校对后的简历画像。

请求参数：

```json
{
  "skills": [
    {
      "skillId": "skill_python",
      "name": "Python",
      "level": "熟练",
      "confirmed": true,
      "evidence": "数据清洗项目"
    }
  ],
  "reviewResolved": true
}
```

响应字段：

```json
{
  "profileId": "profile_001",
  "state": "confirmed",
  "updatedAt": "2026-07-06T14:20:00+08:00"
}
```

异常 / 空态：

- 没有简历：展示上传空态。
- 解析失败：展示失败原因，允许重新发起解析。
- 待复核项为空：展示“技能画像已确认”。

## 5. 岗位探索

页面目标：筛选岗位、浏览岗位热度和匹配度、查看详情，并将岗位设为目标岗位。

进入页面需要获取的数据：

- 岗位筛选项
- 岗位列表
- 当前选中岗位详情
- 对比列表

用户提交的数据：

- 搜索关键词
- 筛选条件
- 选中岗位
- 加入对比的岗位 ID
- 目标岗位 ID

页面展示字段：

- `filters[].label`、`filters[].value`
- `jobs[].name`、`jobs[].heat`、`jobs[].match`、`jobs[].desc`
- `jobDetail.requiredSkills[]`
- `jobDetail.bonusSkills[]`
- `jobDetail.responsibilities[]`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 筛选按钮 | `GET /api/jobs` | 带筛选参数刷新列表 |
| 点击岗位行 | `GET /api/jobs/{jobId}` | 刷新右侧详情 |
| 加入对比 | `POST /api/jobs/compare` | 加入对比队列 |
| 设为目标 | `POST /api/jobs/target` | 保存目标岗位并跳转 `/matching` |

### `GET /api/jobs/filters`

接口用途：获取岗位筛选配置。

响应字段：

```json
{
  "tracks": ["AI 数据应用", "数据分析", "BI"],
  "levels": ["初级", "中级"],
  "dateRanges": ["最近 30 天", "最近 90 天"],
  "sortOptions": ["热度优先", "匹配优先"]
}
```

### `GET /api/jobs`

接口用途：按条件查询岗位列表。

请求参数：

| 参数 | 说明 |
| --- | --- |
| `keyword` | 岗位或技能关键词 |
| `track` | 技术赛道 |
| `level` | 岗位级别 |
| `sort` | 排序方式 |

响应字段：

```json
{
  "items": [
    {
      "jobId": "job_data_analyst",
      "name": "数据分析工程师",
      "heat": 92,
      "match": 78,
      "desc": "SQL、Python、指标体系和业务分析综合岗位",
      "updatedAt": "2026-07-06T12:00:00+08:00"
    }
  ],
  "total": 14
}
```

### `GET /api/jobs/{jobId}`

接口用途：获取岗位详情。

响应字段：

```json
{
  "jobId": "job_data_analyst",
  "name": "数据分析工程师",
  "summary": "面向业务分析和数据决策的岗位",
  "heat": 92,
  "requiredSkills": ["SQL", "Python", "Pandas", "统计分析"],
  "bonusSkills": ["Airflow", "A/B 测试", "埋点设计"],
  "responsibilities": ["指标监控", "专题分析", "报表建设"],
  "graphEntryNodeId": "job:data-analyst"
}
```

### `POST /api/jobs/target`

接口用途：设置目标岗位。

请求参数：

```json
{
  "jobId": "job_data_analyst"
}
```

响应字段：

```json
{
  "targetJobId": "job_data_analyst",
  "state": "selected"
}
```

异常 / 空态：

- 无岗位结果：展示“没有找到匹配岗位”。
- 未确认简历画像：提示先完成简历中心画像确认。

## 6. 匹配分析

页面目标：基于当前简历画像和目标岗位生成匹配报告，展示综合分、分项解释、命中技能和差距技能。

进入页面需要获取的数据：

- 当前目标岗位
- 当前简历画像
- 最新匹配报告，如果没有则发起匹配

用户提交的数据：

- 简历画像 ID
- 目标岗位 ID
- 发起匹配任务

页面展示字段：

- `score`：综合匹配分
- `parts[].label`、`parts[].value`：分项评分
- `hits[]`：命中技能
- `gaps[]`：缺失技能
- `notes[].title`、`notes[].detail`：解释说明

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 重新匹配 | `POST /api/matching/tasks` | 发起异步匹配任务 |
| 查看差距路径 | 无后端接口 | 跳转 `/learning` |

### `POST /api/matching/tasks`

接口用途：发起匹配计算。

请求参数：

```json
{
  "profileId": "profile_001",
  "jobId": "job_data_analyst"
}
```

响应字段：

```json
{
  "taskId": "task_matching_001"
}
```

### `GET /api/matching/reports/{reportId}`

接口用途：获取匹配报告。

响应字段：

```json
{
  "reportId": "match_report_001",
  "profileId": "profile_001",
  "jobId": "job_data_analyst",
  "score": 78,
  "level": "可冲刺",
  "parts": [
    { "label": "必备技能", "value": 84 },
    { "label": "加分技能", "value": 56 },
    { "label": "项目经验", "value": 73 },
    { "label": "语义相似", "value": 81 }
  ],
  "hits": ["Python", "SQL", "Pandas", "数据清洗"],
  "gaps": [
    {
      "skillId": "skill_airflow",
      "name": "Airflow",
      "priority": "high",
      "reason": "岗位要求中频繁出现，简历证据不足"
    }
  ],
  "notes": [
    {
      "title": "优势项",
      "detail": "工具链完整，基础分析能力稳定"
    }
  ],
  "createdAt": "2026-07-06T14:30:00+08:00"
}
```

异常 / 空态：

- 无目标岗位：提示先去岗位探索选择目标岗位。
- 无简历画像：提示先上传并确认简历。
- 匹配任务失败：展示失败原因，允许重新匹配。

## 7. 学习路径

页面目标：把匹配差距作为输入，请求生成一份可下载的计划文件，并在右侧小页面中预览计划内容。

进入页面需要获取的数据：

- 匹配报告中的差距技能
- 目标岗位
- 最近一次生成的计划文件

用户提交的数据：

- 目标岗位
- 差距技能列表
- 计划周期
- 输出文件类型

页面展示字段：

- `gaps[].title`、`gaps[].detail`
- `planFile.fileName`
- `planFile.fileType`
- `planFile.state`
- `planFile.generatedAt`
- `planFile.summary`
- `planFile.sections[].period`
- `planFile.sections[].title`
- `planFile.sections[].objective`
- `planFile.sections[].deliverable`
- `planFile.sections[].acceptance`
- `planFile.sections[].workload`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 请求生成计划文件 | `POST /api/learning-plan` | 返回计划文件对象或任务 ID |
| 重新请求 | `POST /api/learning-plan` | 重新生成并覆盖当前预览 |
| 导出文件 | `GET /api/learning-plan/{planId}/download` | 下载 Markdown / PDF 文件 |

### `POST /api/learning-plan`

接口用途：基于差距技能生成学习计划文件。

请求参数：

```json
{
  "job": "数据分析工程师",
  "reportId": "match_report_001",
  "gaps": ["指标体系设计", "Airflow 调度", "实验分析"],
  "durationWeeks": 6,
  "format": "markdown"
}
```

响应字段：

```json
{
  "id": "plan_001",
  "fileName": "数据分析工程师-六周能力提升方案.md",
  "fileType": "Markdown / PDF",
  "state": "generated",
  "generatedAt": "2026-07-06T14:30:00+08:00",
  "summary": "基于当前匹配差距生成的六周执行方案",
  "downloadUrl": "/api/learning-plan/plan_001/download",
  "sections": [
    {
      "period": "第 1-2 周",
      "title": "业务分析基本功",
      "objective": "复盘一份业务案例，输出指标树和分析结论",
      "deliverable": "1 份指标树说明文档",
      "acceptance": "能解释指标口径、业务目标和分析结论",
      "workload": "每周 5 小时"
    }
  ]
}
```

### `GET /api/learning-plan/{planId}`

接口用途：获取已生成计划文件详情。

响应字段：同生成接口响应。

### `GET /api/learning-plan/{planId}/download`

接口用途：下载计划文件。

响应类型：文件流，`Content-Type` 根据格式返回 `text/markdown` 或 `application/pdf`。

异常 / 空态：

- 没有匹配报告：提示先完成匹配分析。
- 生成失败：显示错误原因，保留重新请求按钮。
- 文件过长：页面不整体滚动，只在计划文件预览区域内部滚动。

## 8. 能力图谱

页面目标：展示岗位、技能、学习资源、项目证据之间的关系网络，支持 Neo4j 数据渲染、节点拖拽、滚轮缩放、空白拖动、节点详情和子节点展开。

进入页面需要获取的数据：

- 指定岗位的 Neo4j 图谱
- 节点详情
- 节点邻居
- 岗位能力版本演化

用户提交的数据：

- 查询岗位名称
- 选中节点 ID
- 展开节点请求
- 刷新图谱请求

页面展示字段：

- `nodes[].id`
- `nodes[].name`
- `nodes[].type`
- `nodes[].summary`
- `nodes[].relationCount`
- `relationships[].source`
- `relationships[].target`
- `relationships[].type`
- `relationships[].weight`
- `versions[].time`
- `versions[].text`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 刷新图谱 | `GET /api/graph/neo4j?job=...` | 重新获取图谱并渲染 |
| 力导向重排 | 无后端接口 | 前端重新计算布局 |
| 适应视图 | 无后端接口 | 前端调整缩放和画布中心 |
| 展开子技能 | `GET /api/graph/nodes/{nodeId}/neighbors` | 追加节点和关系 |
| 点击节点 | `GET /api/graph/nodes/{nodeId}` | 刷新节点说明 |

### `GET /api/graph/neo4j?job=数据分析工程师`

接口用途：获取可直接渲染的 Neo4j 图谱。

响应字段：

```json
{
  "source": "neo4j",
  "updatedAt": "2026-07-06T14:30:00+08:00",
  "nodes": [
    {
      "id": "job:data-analyst",
      "name": "数据分析工程师",
      "type": "job",
      "summary": "数据分析核心岗位",
      "relationCount": 7,
      "x": 50,
      "y": 48
    }
  ],
  "relationships": [
    {
      "id": "rel:sql",
      "source": "job:data-analyst",
      "target": "skill:sql",
      "type": "REQUIRES",
      "weight": 0.96
    }
  ],
  "versions": [
    {
      "time": "2026.06",
      "text": "新增指标体系设计与实验分析要求"
    }
  ]
}
```

### `GET /api/graph/nodes/{nodeId}`

接口用途：获取节点详情。

响应字段：

```json
{
  "id": "skill:airflow",
  "name": "Airflow",
  "type": "skill",
  "summary": "用于数据调度和工作流编排",
  "properties": {
    "level": "bonus",
    "frequency": 0.66,
    "source": "JD 聚类"
  },
  "directRelations": [
    {
      "type": "HAS_SUB_SKILL",
      "targetName": "DAG 编排"
    }
  ]
}
```

### `GET /api/graph/nodes/{nodeId}/neighbors`

接口用途：展开节点的邻居或子技能。

请求参数：

| 参数 | 说明 |
| --- | --- |
| `depth` | 展开深度，默认 `1` |
| `limit` | 最大节点数，默认 `20` |

响应字段：

```json
{
  "nodes": [
    {
      "id": "resource:airflow-dag",
      "name": "DAG 编排",
      "type": "resource",
      "summary": "Airflow 核心子能力"
    }
  ],
  "relationships": [
    {
      "id": "rel:airflow-dag",
      "source": "skill:airflow",
      "target": "resource:airflow-dag",
      "type": "HAS_SUB_SKILL",
      "weight": 0.58
    }
  ]
}
```

### `GET /api/graph/versions?job=数据分析工程师`

接口用途：获取岗位能力版本演化。

响应字段：

```json
{
  "items": [
    {
      "time": "2026.06",
      "text": "新增指标体系设计与实验分析要求",
      "changedSkills": ["指标体系设计", "A/B 测试"]
    }
  ]
}
```

异常 / 空态：

- Neo4j 请求失败：前端可降级展示本地 mock，并显示错误提示。
- 节点无邻居：按钮置灰或提示“暂无可展开关系”。
- 图谱节点过多：后端应限制返回局部图谱，避免一次性返回全库。

## 9. 管理后台

页面目标：管理员只负责平台管理，不进入简历、岗位匹配和学习路径等个人业务流程。后台固定为用户管理、数据导入、岗位演化管理、测试中心四个模块。

进入页面需要获取的数据：

- 用户列表
- 数据导入任务
- 新岗位发现列表
- 既有岗位能力更新列表
- 测试中心指标

用户提交的数据：

- 新建用户
- 批量导入账号
- 重置密码
- 审核通过
- 禁用账号
- 导入 JD / 文档 / 技能库
- 定义新岗位
- 保存岗位更新草稿
- 发布到图谱
- 执行评测

页面展示字段：

- `users[].name`、`users[].role`、`users[].org`、`users[].state`、`users[].lastActive`
- `imports[].name`、`imports[].state`、`imports[].count`
- `jobDiscovery[].title`、`jobDiscovery[].signal`、`jobDiscovery[].state`
- `jobUpdates[].title`、`jobUpdates[].signal`、`jobUpdates[].state`
- `tests[].label`、`tests[].value`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 新建用户 | `POST /api/admin/users` | 创建账号并刷新用户列表 |
| 批量导入账号 | `POST /api/admin/users/import` | 返回导入任务 ID |
| 重置密码 | `POST /api/admin/users/{userId}/reset-password` | 显示重置结果 |
| 审核通过 | `POST /api/admin/users/{userId}/approve` | 更新用户状态 |
| 禁用账号 | `POST /api/admin/users/{userId}/disable` | 更新用户状态 |
| 选择数据源 | `POST /api/admin/imports` | 上传数据并创建导入任务 |
| 定义新岗位 | `POST /api/admin/jobs/discoveries/{discoveryId}/define` | 生成候选岗位 |
| 保存更新草稿 | `POST /api/admin/job-updates/{updateId}/draft` | 保存但不发布 |
| 发布到图谱 | `POST /api/admin/jobs/publish` | 将岗位变更同步到图谱 |
| 一键执行评测 | `POST /api/admin/evaluations/run` | 返回评测任务 ID |

### `GET /api/admin/users`

接口用途：获取用户列表。

响应字段：

```json
{
  "items": [
    {
      "userId": "user_001",
      "name": "张林",
      "role": "student",
      "org": "软件学院",
      "state": "normal",
      "lastActive": "2026-07-06T14:08:00+08:00"
    }
  ],
  "total": 4
}
```

### `POST /api/admin/imports`

接口用途：导入 JD、文档或技能库。

请求参数：`multipart/form-data`

| 字段 | 说明 |
| --- | --- |
| `file` | 数据文件 |
| `sourceType` | `jd`、`document`、`skill_library` |

响应字段：

```json
{
  "taskId": "task_import_001"
}
```

### `GET /api/admin/job-discoveries`

接口用途：获取新岗位发现候选。

响应字段：

```json
{
  "items": [
    {
      "discoveryId": "discovery_001",
      "title": "AI 数据运营分析师",
      "source": "近 30 天 JD 聚类",
      "signal": "新增 42 条相似 JD",
      "state": "pending_define",
      "detail": "职责集中在数据分析、AI 工具运营和指标复盘"
    }
  ]
}
```

### `GET /api/admin/job-updates`

接口用途：获取既有岗位能力更新候选。

响应字段：

```json
{
  "items": [
    {
      "updateId": "update_001",
      "jobId": "job_data_analyst",
      "title": "数据分析工程师",
      "source": "存量岗位版本 v2026.06",
      "signal": "新增 3 项能力要求",
      "state": "pending_publish",
      "changedSkills": ["Airflow", "A/B 测试", "指标体系设计"]
    }
  ]
}
```

### `POST /api/admin/jobs/publish`

接口用途：发布岗位定义或能力更新到图谱。

请求参数：

```json
{
  "jobId": "job_data_analyst",
  "discoveryId": null,
  "updateId": "update_001",
  "publishMode": "graph"
}
```

响应字段：

```json
{
  "publishId": "publish_001",
  "state": "published",
  "graphVersion": "2026.07"
}
```

### `POST /api/admin/evaluations/run`

接口用途：执行评测任务。

请求参数：

```json
{
  "dataset": "jd_resume_mixed_128",
  "metrics": ["jd_parse_accuracy", "resume_extract_accuracy", "matching_accuracy"]
}
```

响应字段：

```json
{
  "taskId": "task_eval_001"
}
```

### `GET /api/admin/evaluations/latest`

接口用途：获取测试中心最新指标。

响应字段：

```json
{
  "items": [
    { "label": "JD 解析准确率", "value": "91%" },
    { "label": "简历提取准确率", "value": "89%" },
    { "label": "匹配准确率", "value": "87%" },
    { "label": "测试用例数", "value": "128" }
  ]
}
```

异常 / 空态：

- 无管理员权限：返回 `403`。
- 无导入任务：展示数据导入空态。
- 发布失败：保留草稿并提示失败原因。

## 10. 全局 AI Agent

页面目标：在非管理员页面提供右下角 AI Agent 抽屉，帮助解释匹配分、技能差距、岗位图谱和学习路径。管理员页面不显示该入口。

进入页面需要获取的数据：

- 当前用户上下文
- 当前页面上下文
- 可选建议问题

用户提交的数据：

- 用户问题
- 当前路由
- 当前目标岗位
- 当前简历画像 ID
- 当前匹配报告 ID
- 当前选中的图谱节点 ID

页面展示字段：

- `messages[].role`
- `messages[].content`
- `suggestions[]`
- `loading`

按钮触发接口：

| 按钮 | 接口 | 前端行为 |
| --- | --- | --- |
| 打开 AI Agent | 无后端接口 | 打开抽屉 |
| 点击建议问题 | `POST /api/agent/chat` | 发送建议问题 |
| 发送 | `POST /api/agent/chat` | 发送用户输入并展示回复 |

### `POST /api/agent/chat`

接口用途：根据当前页面上下文回答问题。

请求参数：

```json
{
  "message": "为什么我的 Airflow 是短板？",
  "route": "/matching",
  "context": {
    "profileId": "profile_001",
    "jobId": "job_data_analyst",
    "reportId": "match_report_001",
    "selectedNodeId": null
  }
}
```

响应字段：

```json
{
  "messageId": "msg_001",
  "answer": "Airflow 被判定为短板，是因为目标岗位中它属于加分技能且近期 JD 权重上升，但你的简历证据较弱。",
  "references": [
    {
      "type": "matching_report",
      "id": "match_report_001",
      "label": "匹配报告"
    }
  ],
  "suggestions": ["生成 Airflow 学习任务", "查看图谱中的 Airflow 节点"]
}
```

异常 / 空态：

- 用户未输入内容：前端不发送请求。
- 后端超时：展示“AI Agent 暂时不可用”。
- 管理员页面：不加载该组件，不请求接口。

## 11. Task API

页面目标：统一支撑长耗时流程的进度查询，避免各模块重复定义任务状态。

适用场景：

- 简历解析
- 匹配计算
- 学习计划生成
- 数据导入
- 评测执行
- 图谱发布

### `GET /api/tasks/{taskId}`

接口用途：查询单个任务进度。

响应字段：

```json
{
  "taskId": "task_001",
  "type": "resume_parse",
  "status": "running",
  "progress": 64,
  "message": "正在识别技能标签",
  "resultId": null,
  "error": null,
  "createdAt": "2026-07-06T14:30:00+08:00",
  "updatedAt": "2026-07-06T14:31:00+08:00"
}
```

### `GET /api/tasks/recent`

接口用途：工作台展示最近任务。

响应字段：

```json
{
  "items": [
    {
      "taskId": "task_001",
      "title": "学习路径生成",
      "type": "learning_plan",
      "status": "running",
      "progress": 64,
      "message": "正在生成计划文件"
    }
  ]
}
```

状态说明：

| 状态 | 含义 | 前端显示 |
| --- | --- | --- |
| `pending` | 已提交，等待执行 | 队列中 |
| `running` | 正在执行 | 进度条 |
| `success` | 执行成功 | 完成 |
| `failed` | 执行失败 | 错误提示和重试入口 |

## 12. 主流程联调检查

前台主流程：

1. `POST /api/auth/login`
2. `GET /api/dashboard/summary`
3. `POST /api/resumes/upload`
4. `POST /api/resumes/{resumeId}/parse`
5. `GET /api/tasks/{taskId}`
6. `PUT /api/resumes/{resumeId}/profile`
7. `GET /api/jobs`
8. `POST /api/jobs/target`
9. `POST /api/matching/tasks`
10. `GET /api/matching/reports/{reportId}`
11. `POST /api/learning-plan`
12. `GET /api/learning-plan/{planId}/download`

后台闭环：

1. `POST /api/auth/login`，角色为 `admin`
2. `POST /api/admin/imports`
3. `GET /api/tasks/{taskId}`
4. `GET /api/admin/job-discoveries`
5. `GET /api/admin/job-updates`
6. `POST /api/admin/jobs/publish`
7. `GET /api/graph/neo4j?job=...`
8. `POST /api/admin/evaluations/run`
9. `GET /api/admin/evaluations/latest`

验收标准：

- 每个页面至少有一个获取接口和明确展示字段。
- 每个按钮都有明确动作：请求接口、下载文件、刷新数据或路由跳转。
- 异步任务都能通过 `Task API` 追踪状态。
- 图谱接口可以兼容 Neo4j 节点和关系结构。
- 管理员只进入管理后台，不进入个人业务流程。
