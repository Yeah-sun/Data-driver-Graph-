import { graph as mockGraph } from "../data/mock";

const GRAPH_API_BASE = import.meta.env.VITE_GRAPH_API_BASE || "";

function normalizeNode(rawNode, index, total) {
  const properties = rawNode.properties || rawNode;
  const labels = rawNode.labels || [rawNode.type || properties.type || "skill"];
  const angle = (Math.PI * 2 * index) / Math.max(total, 1);
  const isJob = labels.includes("Job") || labels.includes("Position") || properties.type === "job";

  return {
    id: rawNode.id?.toString() || properties.id || properties.name,
    name: properties.name || properties.title || rawNode.name || "未命名节点",
    type: isJob ? "job" : properties.type || "skill",
    summary: properties.summary || properties.description || "来自 Neo4j 图谱节点",
    relationCount: Number(properties.relationCount || properties.degree || 0),
    x: Number(properties.x || (isJob ? 50 : 50 + Math.cos(angle) * 32)),
    y: Number(properties.y || (isJob ? 48 : 50 + Math.sin(angle) * 32))
  };
}

function normalizeRelationship(rawRelationship) {
  const properties = rawRelationship.properties || {};

  return {
    id:
      rawRelationship.id?.toString() ||
      `${rawRelationship.startNodeId || rawRelationship.source}-${rawRelationship.endNodeId || rawRelationship.target}`,
    source: (rawRelationship.startNodeId || rawRelationship.source || rawRelationship.from)?.toString(),
    target: (rawRelationship.endNodeId || rawRelationship.target || rawRelationship.to)?.toString(),
    type: rawRelationship.type || properties.type || "REQUIRES",
    weight: Number(properties.weight || rawRelationship.weight || 1)
  };
}

export function normalizeNeo4jGraph(payload) {
  const rawNodes = payload.nodes || [];
  const rawRelationships = payload.relationships || payload.edges || [];
  const nodes = rawNodes.map((node, index) => normalizeNode(node, index, rawNodes.length));
  const idByName = new Map(nodes.map((node) => [node.name, node.id]));
  const relationships = rawRelationships.map((relationship) => {
    const normalized = normalizeRelationship(relationship);

    return {
      ...normalized,
      source: idByName.get(normalized.source) || normalized.source,
      target: idByName.get(normalized.target) || normalized.target
    };
  });

  return {
    source: payload.source || "neo4j",
    updatedAt: payload.updatedAt || new Date().toISOString(),
    nodes,
    relationships,
    versions: payload.versions || mockGraph.versions
  };
}

export async function fetchGraphFromNeo4j(jobName = "数据分析工程师") {
  const response = await fetch(`${GRAPH_API_BASE}/api/graph/neo4j?job=${encodeURIComponent(jobName)}`);

  if (!response.ok) {
    throw new Error(`Graph API 请求失败：${response.status}`);
  }

  return normalizeNeo4jGraph(await response.json());
}

export function getMockGraph() {
  return normalizeNeo4jGraph({
    source: "mock",
    nodes: mockGraph.nodes,
    relationships: mockGraph.relationships,
    versions: mockGraph.versions
  });
}
