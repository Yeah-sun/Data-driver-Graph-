<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import UiCard from "../components/UiCard.vue";
import Octicon from "../components/Octicon.vue";
import { fetchGraphFromNeo4j, getMockGraph } from "../services/graphApi";

cytoscape.use(fcose);

const graphContainer = ref(null);
const graphData = ref(getMockGraph());
const selectedNodeId = ref(graphData.value.nodes[0]?.id);
const isLoading = ref(false);
const loadError = ref("");
let cy = null;
let ambientFrame = 0;
let ambientStartedAt = 0;
let isDraggingNode = false;
let isPanningCanvas = false;

const selectedNode = computed(
  () => graphData.value.nodes.find((node) => node.id === selectedNodeId.value) || graphData.value.nodes[0]
);
const selectedRelations = computed(() =>
  graphData.value.relationships.filter(
    (relationship) => relationship.source === selectedNode.value?.id || relationship.target === selectedNode.value?.id
  )
);
const rootNode = computed(() => graphData.value.nodes.find((node) => node.type === "job") || graphData.value.nodes[0]);
const selectedChildRelations = computed(() =>
  graphData.value.relationships.filter((relationship) => relationship.source === selectedNode.value?.id)
);

function nodeById(id) {
  return graphData.value.nodes.find((node) => node.id === id);
}

function buildVisibleTraceIds(targetId) {
  const visibleNodeIds = new Set([targetId, rootNode.value?.id].filter(Boolean));
  const visibleEdgeIds = new Set();
  const queue = [targetId];
  const visited = new Set();

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    const incoming = graphData.value.relationships.filter((relationship) => relationship.target === currentId);

    for (const relationship of incoming) {
      visibleEdgeIds.add(relationship.id);
      visibleNodeIds.add(relationship.source);
      if (relationship.source !== rootNode.value?.id) {
        queue.push(relationship.source);
      }
    }
  }

  for (const relationship of graphData.value.relationships) {
    if (relationship.source === targetId) {
      visibleEdgeIds.add(relationship.id);
      visibleNodeIds.add(relationship.target);
    }
  }

  return { visibleNodeIds, visibleEdgeIds };
}

function applyTraceFocus(targetId = selectedNodeId.value) {
  if (!cy || !targetId) return;
  const { visibleNodeIds, visibleEdgeIds } = buildVisibleTraceIds(targetId);

  cy.elements().removeClass("is-active dimmed trace-root trace-selected trace-child");
  cy.nodes().forEach((node) => {
    if (!visibleNodeIds.has(node.id())) {
      node.addClass("dimmed");
      return;
    }

    if (node.id() === rootNode.value?.id) {
      node.addClass("trace-root");
    }

    if (node.id() === targetId) {
      node.addClass("trace-selected");
    }

    const isDirectChild = graphData.value.relationships.some(
      (relationship) => relationship.source === targetId && relationship.target === node.id()
    );
    if (isDirectChild) {
      node.addClass("trace-child");
    }
  });

  cy.edges().forEach((edge) => {
    if (visibleEdgeIds.has(edge.id())) {
      edge.addClass("is-active");
    } else {
      edge.addClass("dimmed");
    }
  });
}

function toCytoscapeElements() {
  return [
    ...graphData.value.nodes.map((node) => ({
      group: "nodes",
      data: {
        id: node.id,
        label: node.name,
        type: node.type,
        summary: node.summary,
        relationCount: node.relationCount
      },
      position: { x: node.x * 8, y: node.y * 5 }
    })),
    ...graphData.value.relationships.map((relationship) => ({
      group: "edges",
      data: {
        id: relationship.id,
        source: relationship.source,
        target: relationship.target,
        label: relationship.type,
        weight: relationship.weight
      }
    }))
  ];
}

function syncNodePositionsFromCy() {
  if (!cy) return;
  const updatedNodes = graphData.value.nodes.map((node) => {
    const cyNode = cy.getElementById(node.id);
    if (!cyNode.length) return node;
    const position = cyNode.position();

    return {
      ...node,
      x: Math.min(94, Math.max(6, position.x / 8)),
      y: Math.min(90, Math.max(10, position.y / 5))
    };
  });

  graphData.value = {
    ...graphData.value,
    nodes: updatedNodes
  };
}

function stopAmbientMotion() {
  cancelAnimationFrame(ambientFrame);
  ambientFrame = 0;
}

function rememberRestPositions() {
  if (!cy) return;
  cy.nodes().forEach((node) => {
    const position = node.position();
    node.scratch("rest", { x: position.x, y: position.y });
    node.scratch("phase", Math.random() * Math.PI * 2);
  });
}

function nodeCollisionRadius(node) {
  if (node.data("type") === "job") return 64;
  if (node.data("type") === "evidence" || node.data("type") === "resource") return 46;
  return 50;
}

function relaxNodeCollisions(iterations = 2, strength = 0.38) {
  if (!cy) return;
  const nodes = cy.nodes().toArray();

  cy.batch(() => {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const source = nodes[i];
          const target = nodes[j];
          const sourcePosition = source.position();
          const targetPosition = target.position();
          const dx = targetPosition.x - sourcePosition.x || 0.1;
          const dy = targetPosition.y - sourcePosition.y || 0.1;
          const distance = Math.hypot(dx, dy);
          const minimumDistance = nodeCollisionRadius(source) + nodeCollisionRadius(target);

          if (distance >= minimumDistance) continue;

          const push = ((minimumDistance - distance) / 2) * strength;
          const nx = dx / distance;
          const ny = dy / distance;

          if (!source.grabbed()) {
            source.position({
              x: sourcePosition.x - nx * push,
              y: sourcePosition.y - ny * push
            });
            const rest = source.scratch("rest");
            if (rest) source.scratch("rest", { x: rest.x - nx * push * 0.34, y: rest.y - ny * push * 0.34 });
          }

          if (!target.grabbed()) {
            target.position({
              x: targetPosition.x + nx * push,
              y: targetPosition.y + ny * push
            });
            const rest = target.scratch("rest");
            if (rest) target.scratch("rest", { x: rest.x + nx * push * 0.34, y: rest.y + ny * push * 0.34 });
          }
        }
      }
    }
  });
}

function startAmbientMotion() {
  if (!cy) return;
  stopAmbientMotion();
  rememberRestPositions();
  ambientStartedAt = performance.now();

  function frame(now) {
    if (!cy) {
      ambientFrame = requestAnimationFrame(frame);
      return;
    }

    const elapsed = (now - ambientStartedAt) / 1000;
    cy.batch(() => {
      cy.nodes().forEach((node) => {
        if (node.grabbed()) return;
        const rest = node.scratch("rest") || node.position();
        const phase = node.scratch("phase") || 0;
        const amplitude = node.data("type") === "job" ? 0.9 : 1.8;
        const dragDamping = isDraggingNode ? 0.55 : 1;
        const panDamping = isPanningCanvas ? 0.18 : 1;
        const current = node.position();
        const softenedRest = {
          x: rest.x + (current.x - rest.x) * 0.008,
          y: rest.y + (current.y - rest.y) * 0.008
        };
        node.scratch("rest", softenedRest);

        node.position({
          x: softenedRest.x + Math.cos(elapsed * 0.75 + phase) * amplitude * dragDamping * panDamping,
          y: softenedRest.y + Math.sin(elapsed * 0.62 + phase) * amplitude * dragDamping * panDamping
        });
      });
      relaxNodeCollisions(2, isPanningCanvas ? 0.12 : 0.22);
    });

    ambientFrame = requestAnimationFrame(frame);
  }

  ambientFrame = requestAnimationFrame(frame);
}

function pushNearbyNodes(activeNode) {
  if (!cy) return;
  const activePosition = activeNode.position();
  const radius = 220;

  cy.batch(() => {
    cy.nodes().not(activeNode).forEach((node) => {
      const position = node.position();
      const dx = position.x - activePosition.x || 0.1;
      const dy = position.y - activePosition.y || 0.1;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) return;

      const force = ((radius - distance) / radius) * 11;
      node.position({
        x: position.x + (dx / distance) * force,
        y: position.y + (dy / distance) * force
      });
    });
  });
}

function runLayout(animate = true) {
  if (!cy) return;
  stopAmbientMotion();
  cy.layout({
    name: "fcose",
    animate,
    animationDuration: 650,
    animationEasing: "ease-out",
    fit: true,
    padding: 44,
    randomize: false,
    quality: "proof",
    nodeRepulsion: 12000,
    idealEdgeLength: 150,
    edgeElasticity: 0.34,
    nestingFactor: 0.8,
    gravity: 0.18,
    gravityRange: 4.2,
    numIter: 5200,
    nodeDimensionsIncludeLabels: true,
    uniformNodeDimensions: false,
    tile: true,
    packComponents: true
  }).run();
}

function syncCanvasBackground() {
  if (!cy || !graphContainer.value) return;
  const pan = cy.pan();
  graphContainer.value.style.setProperty("--graph-pan-x", `${pan.x}px`);
  graphContainer.value.style.setProperty("--graph-pan-y", `${pan.y}px`);
  graphContainer.value.style.setProperty("--graph-zoom", cy.zoom().toString());
}

function renderGraph() {
  if (!graphContainer.value) return;

  if (cy) {
    cy.destroy();
  }

  cy = cytoscape({
    container: graphContainer.value,
    elements: toCytoscapeElements(),
    minZoom: 0.35,
    maxZoom: 2.2,
    wheelSensitivity: 0.22,
    boxSelectionEnabled: false,
    autoungrabify: false,
    userPanningEnabled: true,
    userZoomingEnabled: true,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "font-size": 12,
          "font-weight": 700,
          color: "#24292f",
          "text-valign": "center",
          "text-halign": "center",
          "text-wrap": "wrap",
          "text-max-width": 74,
          width: 62,
          height: 62,
          shape: "ellipse",
          "background-color": "#ffffff",
          "border-width": 2,
          "border-color": "#c9d1d9",
          "shadow-blur": 18,
          "shadow-color": "#8c959f",
          "shadow-opacity": 0.18,
          "shadow-offset-x": 0,
          "shadow-offset-y": 8,
          "overlay-opacity": 0,
          "transition-property": "background-color, border-color, opacity, shadow-opacity, width, height",
          "transition-duration": "160ms"
        }
      },
      {
        selector: "node[type = 'job']",
        style: {
          color: "#ffffff",
          width: 94,
          height: 94,
          "background-color": "#bc4c00",
          "border-color": "#8a3700",
          "font-size": 13,
          "text-max-width": 82,
          "shadow-color": "#bc4c00",
          "shadow-opacity": 0.28
        }
      },
      {
        selector: "node[type = 'evidence']",
        style: {
          "background-color": "#dafbe1",
          "border-color": "#aceebb"
        }
      },
      {
        selector: "node[type = 'resource']",
        style: {
          "background-color": "#fff8c5",
          "border-color": "#d4a72c"
        }
      },
      {
        selector: "node.dimmed",
        style: {
          opacity: 0.52,
          "shadow-opacity": 0.12
        }
      },
      {
        selector: "node.trace-root",
        style: {
          opacity: 1,
          "border-width": 5,
          "border-color": "#bc4c00",
          "shadow-blur": 28,
          "shadow-color": "#bc4c00",
          "shadow-opacity": 0.28
        }
      },
      {
        selector: "node.trace-selected",
        style: {
          opacity: 1,
          "border-width": 5,
          "border-color": "#1f883d",
          "shadow-blur": 24,
          "shadow-color": "#1f883d",
          "shadow-opacity": 0.26
        }
      },
      {
        selector: "node.trace-child",
        style: {
          opacity: 1,
          "border-width": 3,
          "border-color": "#bc4c00",
          "shadow-opacity": 0.2
        }
      },
      {
        selector: "node:selected",
        style: {
          "border-width": 4,
          "border-color": "#bc4c00",
          "shadow-blur": 28,
          "shadow-color": "#bc4c00",
          "shadow-opacity": 0.34,
          "shadow-offset-x": 0,
          "shadow-offset-y": 10
        }
      },
      {
        selector: "edge",
        style: {
          width: "mapData(weight, 0, 1, 1, 2.4)",
          "line-color": "#b7c0ca",
          "target-arrow-color": "#b7c0ca",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "control-point-step-size": 42,
          opacity: 0.44,
          label: "data(label)",
          "font-size": 9,
          color: "#57606a",
          "text-background-color": "#f6f8fa",
          "text-background-opacity": 0,
          "text-background-padding": 2,
          "text-opacity": 0
        }
      },
      {
        selector: "edge.dimmed",
        style: {
          opacity: 0.18
        }
      },
      {
        selector: "edge.is-active",
        style: {
          "line-color": "#bc4c00",
          "target-arrow-color": "#bc4c00",
          width: 3,
          opacity: 0.96,
          "text-opacity": 1,
          "text-background-opacity": 0.86
        }
      }
    ]
  });

  cy.on("tap", "node", (event) => {
    selectedNodeId.value = event.target.id();
    applyTraceFocus(event.target.id());
  });

  cy.on("grab", (event) => {
    if (event.target !== cy) return;
    isPanningCanvas = true;
    stopAmbientMotion();
  });
  cy.on("free", (event) => {
    if (event.target === cy) {
      isPanningCanvas = false;
      window.setTimeout(startAmbientMotion, 120);
    }
  });
  cy.on("grab", "node", () => {
    isDraggingNode = true;
    stopAmbientMotion();
  });
  cy.on("drag", "node", (event) => {
    pushNearbyNodes(event.target);
  });
  cy.on("free", "node", () => {
    isDraggingNode = false;
    syncNodePositionsFromCy();
    runLayout(true);
  });
  cy.on("dragfree", "node", syncNodePositionsFromCy);
  cy.on("layoutstop", () => {
    syncNodePositionsFromCy();
    startAmbientMotion();
  });
  cy.on("pan", syncCanvasBackground);
  cy.on("zoom", syncCanvasBackground);

  if (selectedNodeId.value) {
    const selected = cy.getElementById(selectedNodeId.value);
    if (selected.length) {
      selected.select();
      applyTraceFocus(selectedNodeId.value);
    }
  }

  runLayout(false);
  syncCanvasBackground();
}

async function loadGraph() {
  isLoading.value = true;
  loadError.value = "";

  try {
    graphData.value = await fetchGraphFromNeo4j("数据分析工程师");
    selectedNodeId.value = graphData.value.nodes[0]?.id;
  } catch (error) {
    graphData.value = getMockGraph();
    selectedNodeId.value = graphData.value.nodes[0]?.id;
    loadError.value = `${error.message}，当前展示本地 mock 图谱。`;
  } finally {
    isLoading.value = false;
    await nextTick();
    renderGraph();
  }
}

function fitGraph() {
  cy?.animate({ fit: { eles: cy.elements(), padding: 44 }, duration: 280, easing: "ease-out" });
}

function expandSelectedNode() {
  const current = selectedNode.value;
  if (!current) return;

  const exists = graphData.value.nodes.some((node) => node.id === `${current.id}:case`);
  if (exists) {
    runLayout(true);
    return;
  }

  const extraNodes = [
    {
      id: `${current.id}:case`,
      name: current.type === "job" ? "业务指标案例" : "项目证据",
      type: "evidence",
      summary: "展开得到的二级图谱节点，可由 Neo4j 邻居查询返回。",
      relationCount: 1,
      x: current.x + 18,
      y: current.y - 12
    },
    {
      id: `${current.id}:method`,
      name: current.type === "job" ? "能力权重" : "学习资源",
      type: "resource",
      summary: "用于说明节点的上下游关系、资源和证据来源。",
      relationCount: 1,
      x: current.x - 16,
      y: current.y + 14
    }
  ];
  const extraRelationships = extraNodes.map((node, index) => ({
    id: `expanded:${current.id}:${index}`,
    source: current.id,
    target: node.id,
    type: index === 0 ? "HAS_EVIDENCE" : "RELATED_TO",
    weight: 0.5
  }));

  graphData.value = {
    ...graphData.value,
    nodes: [...graphData.value.nodes, ...extraNodes],
    relationships: [...graphData.value.relationships, ...extraRelationships]
  };
  nextTick(() => {
    renderGraph();
    runLayout(true);
  });
}

onMounted(loadGraph);
onBeforeUnmount(() => {
  stopAmbientMotion();
  cy?.destroy();
  cy = null;
});
</script>

<template>
  <div class="page-grid graph-layout">
    <UiCard title="关系画布" desc="滚轮缩放，拖动画布平移，拖拽节点会挤开邻居。" tag="Neo4j Graph">
      <div class="graph-toolbar">
        <span class="status-pill" :class="graphData.source === 'neo4j' ? 'status-pill--正常' : 'status-pill--受限'">
          {{ graphData.source === "neo4j" ? "Neo4j 数据" : "Mock fallback" }}
        </span>
        <button class="btn btn-sm" type="button" @click="runLayout(true)">
          <Octicon name="graphIcon" />
          fCoSE 重排
        </button>
        <button class="btn btn-sm" type="button" @click="fitGraph">适应视图</button>
        <button class="btn btn-sm" type="button" @click="loadGraph">
          <Octicon name="syncIcon" />
          {{ isLoading ? "加载中" : "刷新图谱" }}
        </button>
      </div>

      <p v-if="loadError" class="graph-error">{{ loadError }}</p>

      <div ref="graphContainer" class="graph-canvas graph-canvas--cytoscape"></div>
    </UiCard>

    <UiCard title="节点说明" desc="点击节点后展示 Neo4j 属性和关联关系。" tag="Selected">
      <div class="detail-block">
        <div class="node-inspector-title">
          <h3>{{ selectedNode?.name }}</h3>
          <button class="btn btn-sm btn-primary" type="button" @click="expandSelectedNode">
            <Octicon name="gitBranchIcon" />
            展开子技能
          </button>
        </div>
        <p>{{ selectedNode?.summary }}</p>
        <p>
          根节点：{{ rootNode?.name }}，当前节点有 {{ selectedRelations.length }} 条直接关系，
          {{ selectedChildRelations.length }} 个直接子节点。
        </p>
      </div>
      <div class="skill-cloud compact">
        <span v-for="relationship in selectedRelations" :key="relationship.id">
          <b>{{ relationship.type }}</b>
          {{ nodeById(relationship.source === selectedNode?.id ? relationship.target : relationship.source)?.name }}
        </span>
      </div>
    </UiCard>

    <UiCard title="版本演化" desc="承接动态演化分析的评分点。" tag="Timeline">
      <div class="timeline compact-timeline">
        <article v-for="item in graphData.versions" :key="item.time">
          <span>{{ item.time }}</span>
          <div>
            <strong>{{ item.text }}</strong>
          </div>
        </article>
      </div>
    </UiCard>
  </div>
</template>
