import graphDataRaw from "$lib/data/graph.json";
import type { Node, Neighbor } from "$lib/types";

const graph: Record<string, Node> = graphDataRaw as unknown as Record<string, Node>;

export function getNode(id: string): Node | null {
  return graph[id] || null;
}

export function checkConnection(sourceId: string, targetId: string): Neighbor | null {
  const sourceNode = graph[sourceId];
  if (!sourceNode || !sourceNode.neighbors) return null;

  const neighbor = sourceNode.neighbors.find((n) => n.id === targetId);
  return neighbor || null;
}
