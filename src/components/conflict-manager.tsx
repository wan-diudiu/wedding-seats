"use client";

import { useState } from "react";
import { Guest, Conflict } from "@/types";
import { useConflicts } from "@/hooks/use-guests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

interface ConflictManagerProps {
  guests: Guest[];
}

export function ConflictManager({ guests }: ConflictManagerProps) {
  const { conflicts, addConflict, deleteConflict, hasConflict } = useConflicts();
  const [guestA, setGuestA] = useState("");
  const [guestB, setGuestB] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async () => {
    if (!guestA || !guestB || guestA === guestB) return;
    if (hasConflict(guestA, guestB)) return;
    await addConflict(guestA, guestB, reason || undefined);
    setGuestA("");
    setGuestB("");
    setReason("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            添加冲突关系
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>宾客 A</Label>
              <Select value={guestA} onValueChange={setGuestA}>
                <SelectTrigger>
                  <SelectValue placeholder="选择宾客" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={g.id} disabled={g.id === guestB}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>宾客 B</Label>
              <Select value={guestB} onValueChange={setGuestB}>
                <SelectTrigger>
                  <SelectValue placeholder="选择宾客" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={g.id} disabled={g.id === guestA}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>原因（可选）</Label>
              <Input
                placeholder="如：前任关系"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={!guestA || !guestB || guestA === guestB}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加冲突
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conflicts.map((conflict) => {
          const a = guests.find((g) => g.id === conflict.guest_a_id);
          const b = guests.find((g) => g.id === conflict.guest_b_id);
          if (!a || !b) return null;
          return (
            <Card key={conflict.id} className="border-red-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {a.name}
                    </Badge>
                    <span className="text-red-400">×</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {b.name}
                    </Badge>
                  </div>
                  {conflict.reason && (
                    <p className="text-xs text-red-500 mt-1">{conflict.reason}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteConflict(conflict.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {conflicts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground col-span-2">
            暂无冲突关系
          </div>
        )}
      </div>
    </div>
  );
}
