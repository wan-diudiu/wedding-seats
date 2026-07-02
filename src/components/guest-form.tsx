"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Guest } from "@/types";
import { Plus, UserPlus, Users, List } from "lucide-react";
import { parseGuestBatch } from "@/lib/utils";

interface GuestFormProps {
  onAdd: (guest: Omit<Guest, "id" | "created_at">) => Promise<Guest>;
  onAddBatch?: (items: { name: string; group_size: number }[], side: "bride" | "groom" | "both", relation: string, specialNeeds: string | null) => Promise<Guest[]>;
}

export function GuestForm({ onAdd, onAddBatch }: GuestFormProps) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [name, setName] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [side, setSide] = useState<"bride" | "groom" | "both">("bride");
  const [relation, setRelation] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{ name: string; group_size: number }[] | null>(null);

  const handleBatchInputChange = (value: string) => {
    setBatchInput(value);
    if (value.trim()) {
      setParsedPreview(parseGuestBatch(value));
    } else {
      setParsedPreview(null);
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !relation.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        name: name.trim(),
        side,
        relation: relation.trim(),
        group_size: 1,
        special_needs: specialNeeds.trim() || null,
        table_id: null,
        seat_number: null,
      });
      setName("");
      setRelation("");
      setSpecialNeeds("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchInput.trim() || !relation.trim() || !onAddBatch) return;
    const items = parseGuestBatch(batchInput);
    if (items.length === 0) return;
    setLoading(true);
    try {
      await onAddBatch(items, side, relation.trim(), specialNeeds.trim() || null);
      setBatchInput("");
      setParsedPreview(null);
      setRelation("");
      setSpecialNeeds("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="wedding-gold-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-wedding-red" />
          添加宾客
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={mode === "single" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("single")}
            className={mode === "single" ? "wedding-red-gradient text-white" : "border-wedding-gold"}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            单条添加
          </Button>
          <Button
            type="button"
            variant={mode === "batch" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("batch")}
            className={mode === "batch" ? "wedding-red-gradient text-white" : "border-wedding-gold"}
          >
            <List className="w-3 h-3 mr-1" />
            批量添加
          </Button>
        </div>

        {mode === "single" ? (
          <form onSubmit={handleSubmitSingle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="请输入宾客姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>所属方</Label>
                <Select value={side} onValueChange={(v) => setSide(v as "bride" | "groom" | "both")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">女方</SelectItem>
                    <SelectItem value="groom">男方</SelectItem>
                    <SelectItem value="both">双方</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relation">关系</Label>
                <Input
                  id="relation"
                  placeholder="如：亲戚、同事、同学"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special">特殊需求</Label>
                <Input
                  id="special"
                  placeholder="如：素食、过敏、行动不便"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="wedding-red-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "添加中..." : "添加宾客"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmitBatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">批量输入（每行一个）</Label>
                <textarea
                  id="batch"
                  className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder={`张三
李四全家(3)
王五:4
赵六 3人`}
                  value={batchInput}
                  onChange={(e) => handleBatchInputChange(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  支持格式：姓名（1人）、姓名(3)、姓名:4
                </p>
              </div>
              <div className="space-y-2">
                <Label>所属方</Label>
                <Select value={side} onValueChange={(v) => setSide(v as "bride" | "groom" | "both")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">女方</SelectItem>
                    <SelectItem value="groom">男方</SelectItem>
                    <SelectItem value="both">双方</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="relation-batch">关系</Label>
                  <Input
                    id="relation-batch"
                    placeholder="如：亲戚、同事、同学"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="special-batch">特殊需求</Label>
                  <Input
                    id="special-batch"
                    placeholder="如：素食、过敏、行动不便"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {parsedPreview && parsedPreview.length > 0 && (
              <div className="p-3 bg-wedding-cream rounded-lg border border-wedding-gold/20">
                <p className="text-sm font-medium text-wedding-red-dark mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  解析结果：共 {parsedPreview.length} 条，{parsedPreview.reduce((s, i) => s + i.group_size, 0)} 人
                </p>
                <div className="flex flex-wrap gap-2">
                  {parsedPreview.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border border-wedding-gold/30"
                    >
                      {item.name}
                      <span className="ml-1 text-wedding-red font-medium">×{item.group_size}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !parsedPreview || parsedPreview.length === 0}
              className="wedding-red-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "添加中..." : `批量添加 (${parsedPreview?.reduce((s, i) => s + i.group_size, 0) || 0}人)`}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
