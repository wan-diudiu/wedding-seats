"use client";

import { Button } from "@/components/ui/button";
import { downloadFile, generateCSV } from "@/lib/utils";
import { Download, FileSpreadsheet } from "lucide-react";

interface ExportToolsProps {
  guests: { name: string; side: string; relation: string; table_name?: string | null; seat_number?: number | null; special_needs?: string | null }[];
  tables: { name: string; capacity: number; guests?: number }[];
}

export function ExportTools({ guests, tables }: ExportToolsProps) {
  const handleExportCSV = () => {
    const csv = generateCSV(guests);
    downloadFile(csv, "宾客名单.csv", "text/csv;charset=utf-8;");
  };

  const handleExportTableCSV = () => {
    const headers = ["桌号", "类型", "容量", "已安排人数"];
    const rows = tables.map((t) => [
      t.name,
      "圆桌",
      t.capacity.toString(),
      (t.guests || 0).toString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '\"')}"`).join(","))
      .join("\n");
    downloadFile("\ufeff" + csv, "桌子安排.csv", "text/csv;charset=utf-8;");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg border-wedding-gold/30">
          <h4 className="font-medium mb-2">导出宾客名单</h4>
          <p className="text-sm text-muted-foreground mb-3">导出所有宾客信息为 CSV 格式</p>
          <Button onClick={handleExportCSV} variant="outline" className="border-wedding-gold">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            导出 CSV
          </Button>
        </div>
        <div className="p-4 border rounded-lg border-wedding-gold/30">
          <h4 className="font-medium mb-2">导出桌子安排</h4>
          <p className="text-sm text-muted-foreground mb-3">导出所有桌子信息为 CSV 格式</p>
          <Button onClick={handleExportTableCSV} variant="outline" className="border-wedding-gold">
            <Download className="w-4 h-4 mr-2" />
            导出表格
          </Button>
        </div>
      </div>
    </div>
  );
}
