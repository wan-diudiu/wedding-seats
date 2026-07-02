"use client";

import { SeatingChart } from "@/components/seating-chart";
import { StatisticsBar } from "@/components/statistics-bar";
import { OnlineUsers } from "@/components/online-users";
import { AutoSeatModal } from "@/components/auto-seat-modal";
import { useGuests } from "@/hooks/use-guests";
import { useTables } from "@/hooks/use-tables";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Wand2, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import { downloadFile } from "@/lib/utils";

export default function SeatingPage() {
  const { guests, unassignedGuests, assignedGuests, assignSeat, loading } = useGuests();
  const { tables } = useTables();
  const [showAutoSeat, setShowAutoSeat] = useState(false);

  const handleExportImage = async () => {
    const element = document.getElementById("seating-chart-container");
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: "#FFF8F0" });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "婚礼座位图.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wedding-red">座位安排</h1>
          <p className="text-muted-foreground">拖拽宾客到座位上，实时协作</p>
        </div>
        <div className="flex items-center gap-3">
          <OnlineUsers />
          <Button
            variant="outline"
            className="border-wedding-gold text-wedding-gold-dark"
            onClick={handleExportImage}
          >
            <Camera className="w-4 h-4 mr-2" />
            导出图片
          </Button>
          <Button
            className="wedding-red-gradient text-white"
            onClick={() => setShowAutoSeat(true)}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            自动排座
          </Button>
        </div>
      </div>

      <StatisticsBar guests={guests} />

      <SeatingChart
        guests={guests}
        tables={tables}
        onAssignSeat={assignSeat}
        loading={loading}
      />

      {showAutoSeat && (
        <AutoSeatModal
          guests={unassignedGuests}
          tables={tables}
          onClose={() => setShowAutoSeat(false)}
          onAssign={assignSeat}
        />
      )}
    </div>
  );
}
