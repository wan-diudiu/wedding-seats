"use client";

import { GuestForm } from "@/components/guest-form";
import { GuestList } from "@/components/guest-list";
import { StatisticsBar } from "@/components/statistics-bar";
import { ConflictManager } from "@/components/conflict-manager";
import { ExportTools } from "@/components/export-tools";
import { TableManager } from "@/components/table-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuests } from "@/hooks/use-guests";
import { useTables } from "@/hooks/use-tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Swords, Download, Table2 } from "lucide-react";

export default function GuestsPage() {
  const { guests, loading, addGuest, addGuestsBatch, deleteGuest, assignSeat } = useGuests();
  const { tables, addTable, deleteTable, refresh: refreshTables } = useTables();

  const guestsWithTableNames = guests.map((g) => ({
    ...g,
    table_name: g.table_id ? tables.find((t) => t.id === g.table_id)?.name || null : null,
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-wedding-red">宾客管理</h1>
        <p className="text-muted-foreground">添加宾客信息，管理座位安排</p>
      </div>

      <StatisticsBar guests={guests} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">
            <Users className="w-4 h-4 mr-2" />
            宾客列表
          </TabsTrigger>
          <TabsTrigger value="tables">
            <Table2 className="w-4 h-4 mr-2" />
            桌子管理
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            <Swords className="w-4 h-4 mr-2" />
            冲突管理
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <GuestForm onAdd={addGuest} onAddBatch={addGuestsBatch} />
          <GuestList
            guests={guests}
            loading={loading}
            onDelete={deleteGuest}
            onUnassign={(id) => assignSeat(id, null, null)}
            tables={tables}
          />
        </TabsContent>

        <TabsContent value="tables">
          <TableManager
            tables={tables}
            onAddTable={addTable}
            onDeleteTable={deleteTable}
            refresh={refreshTables}
          />
        </TabsContent>

        <TabsContent value="conflicts">
          <ConflictManager guests={guests} />
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>导出数据</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportTools guests={guestsWithTableNames} tables={tables} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
