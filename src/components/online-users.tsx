"use client";

import { useOnlineUsers } from "@/hooks/use-online-users";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export function OnlineUsers() {
  const { onlineCount } = useOnlineUsers();

  return (
    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
      <Users className="w-3 h-3 mr-1" />
      {onlineCount} 人在线
    </Badge>
  );
}
