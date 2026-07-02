"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtime(table: string, onChange: () => void) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, onChange]);
}
