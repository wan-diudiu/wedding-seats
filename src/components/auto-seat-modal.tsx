"use client";

import { useState, useMemo } from "react";
import { Guest, Table } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Check, AlertCircle } from "lucide-react";

interface AutoSeatModalProps {
  guests: Guest[];
  tables: Table[];
  onClose: () => void;
  onAssign: (guestId: string, tableId: string | null, seatNumber: number | null) => Promise<Guest>;
}

export function AutoSeatModal({ guests, tables, onClose, onAssign }: AutoSeatModalProps) {
  const [assigning, setAssigning] = useState(false);
  const [results, setResults] = useState<{ guest: Guest; table: Table; seat: number }[]>([]);

  const plan = useMemo(() => {
    const plan: { guest: Guest; table: Table; seat: number }[] = [];
    const tableOccupancy = new Map<string, Set<number>>();

    tables.forEach((t) => {
      tableOccupancy.set(
        t.id,
        new Set(tables.find((tbl) => tbl.id === t.id)?.capacity ? [] : [])
      );
    });

    const grouped = guests.reduce((acc, g) => {
      const key = g.relation;
      if (!acc[key]) acc[key] = [];
      acc[key].push(g);
      return acc;
    }, {} as Record<string, Guest[]>);

    for (const [relation, groupGuests] of Object.entries(grouped)) {
      const matchingTable = tables.find((t) => t.relation_type === relation);
      const targetTable = matchingTable || tables.find((t) => {
        const occupied = tableOccupancy.get(t.id);
        return occupied && occupied.size < t.capacity;
      });

      if (!targetTable) continue;

      for (const guest of groupGuests) {
        const occupied = tableOccupancy.get(targetTable.id) || new Set();
        let seat = 0;
        while (occupied.has(seat) && seat < targetTable.capacity) seat++;
        if (seat >= targetTable.capacity) continue;

        occupied.add(seat);
        tableOccupancy.set(targetTable.id, occupied);
        plan.push({ guest, table: targetTable, seat });
      }
    }

    return plan;
  }, [guests, tables]);

  const handleAutoAssign = async () => {
    setAssigning(true);
    const assigned: typeof results = [];
    for (const { guest, table, seat } of plan) {
      try {
        await onAssign(guest.id, table.id, seat);
        assigned.push({ guest, table, seat });
      } catch (e) {
        console.error("Failed to assign:", guest.name, e);
      }
    }
    setResults(assigned);
    setAssigning(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-wedding-red">
            <Wand2 className="w-5 h-5 mr-2" />
            自动排座
          </DialogTitle>
          <DialogDescription>
            按关系自动分组分配未排座位的宾客到对应桌子
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {plan.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              没有可自动分配的宾客或桌子已满
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                预计分配 {plan.length} 位宾客
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                {plan.map(({ guest, table, seat }) => (
                  <Card key={guest.id} className="border-wedding-gold/30">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{guest.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {guest.relation}
                        </Badge>
                      </div>
                      <div className="text-sm text-wedding-gold-dark">
                        → {table.name} · 座位 {seat + 1}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {results.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              <Check className="w-5 h-5 inline mr-2" />
              成功分配 {results.length} 位宾客
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          {plan.length > 0 && results.length === 0 && (
            <Button
              onClick={handleAutoAssign}
              disabled={assigning}
              className="wedding-red-gradient text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {assigning ? "分配中..." : "一键分配"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
