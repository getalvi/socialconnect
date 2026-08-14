import { Handle, Position } from "reactflow";

const CATEGORY_COLOR: Record<string, string> = {
  trigger: "var(--trigger)",
  action: "var(--action)",
  logic: "var(--logic)",
  ai: "var(--ai)",
};

// Execution-status visuals, applied on top of the category color. Driven by
// data.execStatus, which WorkflowEditor.tsx sets from the last Test Run's
// nodeLogs after each run completes - this file doesn't know anything about
// execution itself, it just renders whatever status it's given.
const STATUS_STYLE: Record<string, { border: string; badgeBg: string; badgeIcon: string; label: string }> = {
  running: { border: "#d9a441", badgeBg: "#d9a441", badgeIcon: "\u23f3", label: "Running" },
  success: { border: "#4f8a68", badgeBg: "#4f8a68", badgeIcon: "\u2713", label: "Success" },
  error: { border: "#c0564a", badgeBg: "#c0564a", badgeIcon: "\u2715", label: "Error" },
  skipped: { border: "var(--border)", badgeBg: "var(--text-dim)", badgeIcon: "\u2013", label: "Branch not taken" },
};

export default function GenericNode({ data, selected }: any) {
  const color = CATEGORY_COLOR[data.category] || "var(--text-dim)";
  const outputs: string[] = data.outputs || ["main"];
  const execStatus: string | undefined = data.execStatus;
  const statusStyle = execStatus ? STATUS_STYLE[execStatus] : undefined;
  const borderColor = statusStyle?.border || (selected ? color : "var(--border)");

  return (
    <div
      title={data.execError ? `${statusStyle?.label}: ${data.execError}` : statusStyle?.label}
      style={{
        position: "relative",
        background: "var(--surface)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        minWidth: 180,
        opacity: execStatus === "skipped" ? 0.5 : 1,
        boxShadow: execStatus === "running"
          ? `0 0 0 3px ${statusStyle!.border}33`
          : selected
          ? `0 0 0 3px ${color}22`
          : "none",
        animation: execStatus === "running" ? "flowai-pulse 1.1s ease-in-out infinite" : "none",
      }}
    >
      {statusStyle && (
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: statusStyle.badgeBg,
            color: "#fff",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            boxShadow: "0 0 0 2px var(--surface)",
          }}
        >
          {statusStyle.badgeIcon}
        </div>
      )}
      {data.category !== "trigger" && <Handle type="target" position={Position.Left} style={{ background: color }} />}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color }}>{data.category}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{data.label}</div>
        {data.subtitle && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{data.subtitle}</div>
        )}
        {execStatus === "error" && data.execError && (
          <div style={{ fontSize: 11, color: statusStyle!.border, marginTop: 4, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.execError}
          </div>
        )}
        {execStatus === "success" && typeof data.execDurationMs === "number" && (
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{data.execDurationMs}ms</div>
        )}
      </div>
      {outputs.map((output, i) => (
        <Handle
          key={output}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            background: color,
            top: outputs.length > 1 ? `${30 + (i * 40)}%` : "50%",
          }}
        />
      ))}
      {outputs.length > 1 &&
        outputs.map((output, i) => (
          <div
            key={output}
            style={{
              position: "absolute",
              right: -36,
              top: `${30 + (i * 40)}%`,
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "var(--text-dim)",
            }}
          >
            {output}
          </div>
        ))}
    </div>
  );
}
