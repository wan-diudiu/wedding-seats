"use client";

import { useState } from "react";
import { Table } from "@/types";
import { useTables } from "@/hooks/use-tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Table2, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableManagerProps {
  tables: Table[];
  onAddTable: (table: Omit<Table, "id" | "created_at">) => Promise<Table>;
  onDeleteTable: (id: string) => Promise<void>;
  refresh: () => void;
}

export function TableManager({ tables, onAddTable, onDeleteTable, refresh }: TableManagerProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [relationType, setRelationType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAddTable({
        name: name.trim(),
        type: "round",
        capacity,
        position_x: 0,
        position_y: 0,
        relation_type: relationType.trim() || null,
      });
      setName("");
      setCapacity(10);
      setRelationType("");
      refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这张桌子吗？已安排的宾客将取消座位。")) return;
    try {
      await onDeleteTable(id);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const relationOptions = ["新人", "亲戚", "同事", "同学", "朋友", "其他"];

  return (
    <div className="space-y-6">
      <Card className="wedding-gold-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Table2 className="w-5 h-5 mr-2 text-wedding-gold" />
            添加圆桌
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="table-name">桌号/名称</Label>
                <Input
                  id="table-name"
                  placeholder="如：主桌、桌1、亲戚桌"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-capacity">人数</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="table-capacity"
                    type="number"
                    min={2}
                    max={30}
                    value={capacity}
                    onChange={(e) => setCapacity(Math.max(2, Math.min(30, parseInt(e.target.value) || 10)))}
                    required
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">人</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>关系类型（可选）</Label>
                <Select value={relationType} onValueChange={setRelationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择关系类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {relationOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="wedding-gold-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "添加中..." : "添加圆桌"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="border-wedding-gold/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{table.name}</h3>
                    <Badge variant="outline" className="bg-wedding-gold/10 text-wedding-gold-dark border-wedding-gold/30">
                      <Users className="w-3 h-3 mr-1" />
                      {table.capacity}人
                    </Badge>
                  </div>
                  {table.relation_type && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 mb-2">
                      {table.relation_type}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    圆桌 · 座位 {table.capacity}个
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(table.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tables.length === 0 && (
          <div className="text-center py-12 text-muted-foreground col-span-3">
            暂无桌子，请添加圆桌
          </div>
        )}
      </div>
    </div>
  );
}
