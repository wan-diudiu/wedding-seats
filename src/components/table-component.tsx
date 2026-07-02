"use client";

import { Guest, Table } from "@/types";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface TableComponentProps {
  table: Table;
  guests: Guest[];
}

/** 判断座位 i 是否被某个 guest 占用（包括连续占用的组） */
function getSeatOccupant(guests: Guest[], tableId: string, seatIndex: number): Guest | undefined {
  return guests.find(
    (g) =>
      g.table_id === tableId &&
      g.seat_number !== null &&
      g.seat_number !== undefined &&
      seatIndex >= g.seat_number &&
      seatIndex < g.seat_number + (g.group_size || 1)
  );
}

export function TableComponent({ table, guests }: TableComponentProps) {
  const capacity = table.capacity;
  const totalPeople = guests.reduce((sum, g) => sum + (g.group_size || 1), 0);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-wedding-red-dark mb-2">{table.name}</h3>
      {table.relation_type && (
        <span className="text-xs text-wedding-gold-dark mb-2">{table.relation_type}</span>
      )}

      <div className="relative w-48 h-48">
        {/* Table circle */}
        <div className="absolute inset-8 rounded-full wedding-gold-gradient flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">{table.name}</span>
        </div>
        {/* Seats around the circle */}
        {Array.from({ length: capacity }).map((_, i) => {
          const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
          const radius = 90;
          const x = 96 + radius * Math.cos(angle) - 16;
          const y = 96 + radius * Math.sin(angle) - 16;
          const guest = getSeatOccupant(guests, table.id, i);
          return (
            <DroppableSeat
              key={i}
              tableId={table.id}
              seatNumber={i}
              guest={guest}
              style={{ left: x, top: y, position: "absolute" }}
            />
          );
        })}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {totalPeople}/{capacity} 人 · {guests.length} 组
      </div>
    </div>
  );
}

function DroppableSeat({
  tableId,
  seatNumber,
  guest,
  style,
}: {
  tableId: string;
  seatNumber: number;
  guest?: Guest;
  style: React.CSSProperties;
}) {
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-${tableId}-seat-${seatNumber}`,
  });

  const isGroupStart = guest && guest.seat_number === seatNumber;

  // Only the group-starting seat is draggable (drag moves the whole group)
  const draggableId = isGroupStart ? guest.id : null;
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: draggableId || `seat-inert-${tableId}-${seatNumber}`,
    data: { guest },
    disabled: !isGroupStart,
  });

  // Combine refs so the element is both droppable and (optionally) draggable
  const combinedRef = (node: HTMLElement | null) => {
    setDropRef(node);
    if (isGroupStart && setDragRef) setDragRef(node);
  };

  return (
    <div
      ref={combinedRef}
      {...(isGroupStart ? { ...listeners, ...attributes } : {})}
      style={style}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all relative",
        guest
          ? "bg-wedding-red text-white shadow-md"
          : "bg-white border-2 border-wedding-gold/40 text-muted-foreground",
        isGroupStart && "cursor-grab hover:shadow-lg ring-2 ring-wedding-gold/50",
        isDragging && "opacity-50",
        isOver && !guest && "bg-wedding-gold-light border-wedding-gold scale-125",
        isOver && guest && "bg-red-400 border-red-600 scale-125"
      )}
      title={guest ? `${guest.name} (${guest.group_size || 1}人)` : "空座位"}
    >
      {guest ? (isGroupStart ? guest.name.charAt(0) : "·") : seatNumber + 1}
      {isGroupStart && (guest.group_size || 1) > 1 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-wedding-red text-white rounded-full text-[8px] flex items-center justify-center">
          {guest.group_size}
        </span>
      )}
      {isGroupStart && (
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] text-wedding-gold whitespace-nowrap">
          <GripVertical className="w-3 h-3 inline" />
        </span>
      )}
    </div>
  );
}
