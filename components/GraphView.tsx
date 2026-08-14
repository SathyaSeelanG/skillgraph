"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import type { GraphData, GraphNodeType } from "@/lib/types";

export const NODE_COLORS: Record<GraphNodeType, { bg: string; border: string; text: string }> = {
  Developer: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af" },
  Skill: { bg: "#dcfce7", border: "#16a34a", text: "#15803d" },
  Job: { bg: "#fef9c3", border: "#ca8a04", text: "#854d0e" },
  Company: { bg: "#fce7f3", border: "#db2777", text: "#9d174d" },
  Location: { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6" },
};

export const LEGEND_ITEMS: { type: GraphNodeType; label: string }[] = [
  { type: "Developer", label: "Developer" },
  { type: "Skill", label: "Skill" },
  { type: "Job", label: "Job" },
  { type: "Company", label: "Company" },
  { type: "Location", label: "Location" },
];

function layoutNodes(data: GraphData): Node[] {
  const byType = new Map<GraphNodeType, string[]>();
  for (const n of data.nodes) {
    const list = byType.get(n.type) ?? [];
    list.push(n.id);
    byType.set(n.type, list);
  }

  const typeOrder: GraphNodeType[] = ["Developer", "Skill", "Job", "Company", "Location"];
  const columnWidth = 260;
  const rowHeight = 90;

  const positions = new Map<string, { x: number; y: number }>();
  let columnIndex = 0;
  for (const type of typeOrder) {
    const ids = byType.get(type);
    if (!ids || ids.length === 0) continue;
    ids.forEach((id, rowIndex) => {
      positions.set(id, { x: columnIndex * columnWidth, y: rowIndex * rowHeight });
    });
    columnIndex += 1;
  }

  return data.nodes.map((n) => {
    const pos = positions.get(n.id) ?? { x: 0, y: 0 };
    const colors = NODE_COLORS[n.type];
    return {
      id: n.id,
      position: pos,
      data: { label: n.label },
      style: {
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        width: 180,
      },
    };
  });
}

function layoutEdges(data: GraphData): Edge[] {
  return data.edges.map((e, i) => ({
    id: `${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    label: e.type,
    labelStyle: { fontSize: 10 },
    style: { stroke: "#94a3b8" },
    animated: false,
  }));
}

export function GraphView({
  data,
  onNodeClick,
}: {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
}) {
  const nodes = useMemo(() => layoutNodes(data), [data]);
  const edges = useMemo(() => layoutEdges(data), [data]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{ x: 24, y: 24, zoom: 0.85 }}
        minZoom={0.3}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable className="hidden sm:block" />
      </ReactFlow>
    </div>
  );
}
