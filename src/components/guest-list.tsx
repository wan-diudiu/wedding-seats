"use client";

import { Guest, Table } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, MapPin } from "lucide-react";

interface GuestListProps {
  guests: Guest[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUnassign?: (id: string) => Promise<void>;
  tables: Table[];
}

export function GuestList({ guests, loading, onDelete, onUnassign, tables }: GuestListProps) {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  if (guests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          暂无宾客，请添加宾客信息
        </CardContent>
      </Card>
    );
  }

  const sideLabels = { bride: "女方", groom: "男方", both: "双方" };
  const sideColors = {
    bride: "bg-pink-100 text-pink-700 border-pink-200",
    groom: "bg-blue-100 text-blue-700 border-blue-200",
    both: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guests.map((guest) => {
        const table = tables.find((t) => t.id === guest.table_id);
        return (
          <Card key={guest.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{guest.name}</h3>
                    {(guest.group_size || 1) > 1 && (
                      <Badge variant="outline" className="text-xs bg-wedding-red/10 text-wedding-red border-wedding-red/20">
                        {guest.group_size}人
                      </Badge>
                    )}
                    <Badge variant="outline" className={sideColors[guest.side]}>
                      {sideLabels[guest.side]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{guest.relation}</p>
                  {guest.special_needs && (
                    <p className="text-xs text-orange-600 mt-1">{guest.special_needs}</p>
                  )}
                  {table && (
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {table.name} · 座位 {guest.seat_number}
                      {onUnassign && (
                        <button
                          className="ml-2 text-orange-500 hover:text-orange-700 underline cursor-pointer"
                          onClick={() => onUnassign(guest.id)}
                        >
                          取消
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(guest.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
