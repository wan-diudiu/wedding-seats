"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Guest, Table } from "@/types";
import { TableComponent } from "@/components/table-component";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { useConflicts } from "@/hooks/use-guests";

interface SeatingChartProps {
  guests: Guest[];
  tables: Table[];
  onAssignSeat: (guestId: string, tableId: string | null, seatNumber: number | null) => Promise<Guest>;
  loading: boolean;
}

export function SeatingChart({ guests, tables, onAssignSeat, loading }: SeatingChartProps) {
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const { hasConflict } = useConflicts();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const guest = guests.find((g) => g.id === event.active.id);
    if (guest) setActiveGuest(guest);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGuest(null);
    setConflictWarning(null);

    if (!over) return;

    const guestId = active.id as string;
    const overId = over.id as string;
    const draggedGuest = guests.find((g) => g.id === guestId);
    if (!draggedGuest) return;
    const groupSize = draggedGuest.group_size || 1;

    // Check if dropping back to unassigned area
    if (overId === "unassigned-area") {
      await onAssignSeat(guestId, null, null);
      return;
    }

    // Check if dropping on a seat (format: "table-{tableId}-seat-{seatNumber}")
    const seatMatch = overId.match(/^table-(.+)-seat-(\d+)$/);
    if (!seatMatch) return;

    const tableId = seatMatch[1];
    const seatNumber = parseInt(seatMatch[2]);
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable) return;

    // 1. Check if consecutive seats are available (groupSize consecutive seats from seatNumber)
    const otherGuests = guests.filter((g) => g.table_id === tableId && g.id !== guestId);
    for (let i = 0; i < groupSize; i++) {
      const targetSeat = seatNumber + i;

      // Exceeds table capacity
      if (targetSeat >= targetTable.capacity) {
        setConflictWarning(
          `位置不足：${draggedGuest.name} 需要 ${groupSize} 个连续座位，但从位置 ${seatNumber + 1} 开始超出了桌子容量！`
        );
        setTimeout(() => setConflictWarning(null), 4000);
        return;
      }

      // Check if this seat is occupied by another guest/group
      const occupant = otherGuests.find(
        (g) =>
          g.seat_number !== null &&
          g.seat_number !== undefined &&
          targetSeat >= g.seat_number &&
          targetSeat < g.seat_number + (g.group_size || 1)
      );
      if (occupant) {
        setConflictWarning(
          `位置被占用：${draggedGuest.name} 需要 ${groupSize} 个连续座位，但位置 ${targetSeat + 1} 已被 ${occupant.name} 占用！`
        );
        setTimeout(() => setConflictWarning(null), 4000);
        return;
      }
    }

    // 2. Check capacity: total people on table cannot exceed capacity
    const occupiedPeople = otherGuests.reduce((sum, g) => sum + (g.group_size || 1), 0);
    const remainingCapacity = targetTable.capacity - occupiedPeople;
    if (groupSize > remainingCapacity) {
      setConflictWarning(
        `容量不足：${draggedGuest.name} 代表 ${groupSize} 人，但该桌仅剩 ${remainingCapacity} 个座位！`
      );
      setTimeout(() => setConflictWarning(null), 4000);
      return;
    }

    // 3. Check conflicts with any guests at the target table
    for (const tg of otherGuests) {
      if (hasConflict(guestId, tg.id)) {
        setConflictWarning(`警告：${draggedGuest.name} 与 ${tg.name} 在同一桌有冲突！`);
        setTimeout(() => setConflictWarning(null), 4000);
        // Still allow but warn
        break;
      }
    }

    // All checks passed - assign
    await onAssignSeat(guestId, tableId, seatNumber);
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  const assignedGuests = guests.filter((g) => g.table_id);
  const unassignedGuests = guests.filter((g) => !g.table_id);

  return (
    <div className="space-y-4">
      {conflictWarning && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
          {conflictWarning}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Unassigned guests - draggable to seats */}
        <DroppableCancelArea>
          <Card className="border-dashed border-2 border-wedding-gold/40 bg-wedding-cream/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                未安排宾客（拖到下方座位）
              </h3>
              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {unassignedGuests.map((guest) => (
                  <DraggableGuest key={guest.id} guest={guest} />
                ))}
                {unassignedGuests.length === 0 && (
                  <span className="text-sm text-muted-foreground">所有宾客已安排</span>
                )}
              </div>
            </CardContent>
          </Card>
        </DroppableCancelArea>

        {/* Assigned guests - static display only */}
        {assignedGuests.length > 0 && (
          <Card className="border-green-200/50 bg-green-50/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-green-700 mb-3">
                已安排宾客（从座位点拖拽可取消）
              </h3>
              <div className="flex flex-wrap gap-2">
                {assignedGuests.map((guest) => {
                  const table = tables.find((t) => t.id === guest.table_id);
                  return (
                    <div
                      key={guest.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 border border-green-300 text-green-800 text-sm"
                    >
                      {guest.name}
                      {(guest.group_size || 1) > 1 && (
                        <span className="text-xs text-green-600 font-bold">×{guest.group_size}</span>
                      )}
                      <span className="text-xs text-green-500">{table?.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seating chart */}
        <div id="seating-chart-container" className="wedding-pattern rounded-xl border border-wedding-gold/20 p-6 min-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {tables.map((table) => (
              <TableComponent
                key={table.id}
                table={table}
                guests={guests.filter((g) => g.table_id === table.id)}
              />
            ))}
          </div>
          {tables.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              暂无桌子，请先在数据库中添加桌子数据
            </div>
          )}
        </div>

        <DragOverlay>
          {activeGuest ? (
            <div className="bg-wedding-red text-white px-4 py-2 rounded-lg shadow-xl font-medium">
              {activeGuest.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DraggableGuest({ guest }: { guest: Guest }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-wedding-gold/40
        shadow-sm cursor-grab hover:shadow-md transition-shadow select-none
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <GripVertical className="w-3 h-3 text-wedding-gold" />
      <span className="text-sm font-medium">{guest.name}</span>
      {(guest.group_size || 1) > 1 && (
        <span className="text-xs text-wedding-red font-bold">×{guest.group_size}</span>
      )}
      <Badge variant="outline" className="text-xs px-1 py-0">
        {guest.side === "bride" ? "女" : guest.side === "groom" ? "男" : "双"}
      </Badge>
    </div>
  );
}

function DroppableCancelArea({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "unassigned-area" });

  return (
    <div ref={setNodeRef} className={`transition-all ${isOver ? "ring-2 ring-wedding-gold rounded-lg" : ""}`}>
      {children}
    </div>
  );
}
