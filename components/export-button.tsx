"use client";

type ExportButtonProps = {
  taskId: string;
};

export function ExportButton({ taskId }: ExportButtonProps) {
  return (
    <a
      href={`/api/export/${taskId}`}
      style={{
        display: "inline-block",
        background: "#111827",
        color: "#fff",
        border: "1px solid #111827",
        borderRadius: 8,
        padding: "8px 12px",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600
      }}
    >
      导出 CSV
    </a>
  );
}
