"use client";

import { Guest } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

interface StatisticsBarProps {
  guests: Guest[];
}

export function StatisticsBar({ guests }: StatisticsBarProps) {
  const total = guests.length;
  const totalPeople = guests.reduce((sum, g) => sum + (g.group_size || 1), 0);
  const assigned = guests.filter((g) => g.table_id).length;
  const unassigned = total - assigned;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="border-wedding-gold/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">总宾客</p>
            <p className="text-2xl font-bold text-wedding-red">{total}</p>
          </div>
          <Users className="w-8 h-8 text-wedding-gold" />
        </CardContent>
      </Card>
      <Card className="border-wedding-gold/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">总人数</p>
            <p className="text-2xl font-bold text-wedding-red-dark">{totalPeople}</p>
          </div>
          <Users className="w-8 h-8 text-wedding-gold-dark" />
        </CardContent>
      </Card>
      <Card className="border-wedding-gold/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">已排座</p>
            <p className="text-2xl font-bold text-green-600">{assigned}</p>
          </div>
          <UserCheck className="w-8 h-8 text-green-500" />
        </CardContent>
      </Card>
      <Card className="border-wedding-gold/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">未排座</p>
            <p className="text-2xl font-bold text-orange-500">{unassigned}</p>
          </div>
          <UserX className="w-8 h-8 text-orange-400" />
        </CardContent>
      </Card>
    </div>
  );
}
