import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 解析批量输入的宾客列表
 * 支持格式：
 * - 张三                     → 1人
 * - 李四全家(3)              → 3人
 * - 王五:4                   → 4人（中文冒号）
 * - 赵六 3                   → 3人
 * - 多行输入，用换行或逗号/分号分隔
 */
export function parseGuestBatch(input: string): { name: string; group_size: number }[] {
  return input
    .split(/\n|,|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const matchParen = line.match(/(.+?)\s*\((\d+)\)$/);
      if (matchParen) {
        return { name: matchParen[1].trim(), group_size: parseInt(matchParen[2], 10) };
      }
      const matchColon = line.match(/(.+?)\s*[：:]\s*(\d+)$/);
      if (matchColon) {
        return { name: matchColon[1].trim(), group_size: parseInt(matchColon[2], 10) };
      }
      return { name: line, group_size: 1 };
    });
}

export function generateCSV(
  guests: {
    name: string;
    side: string;
    relation: string;
    table_name?: string | null;
    seat_number?: number | null;
    group_size?: number | null;
    special_needs?: string | null;
  }[]
): string {
  const headers = ["姓名", "所属方", "关系", "人数", "桌号", "座位号", "特殊需求"];
  const rows = guests.map((g) => [
    g.name,
    g.side === "bride" ? "女方" : g.side === "groom" ? "男方" : "双方",
    g.relation,
    (g.group_size || 1).toString(),
    g.table_name || "未安排",
    g.seat_number?.toString() || "-",
    g.special_needs || "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '\\"')}"`).join(","))
    .join("\n");
  return "\ufeff" + csv;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
