"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useOnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: Math.random().toString(36).substring(7),
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { onlineCount };
}
