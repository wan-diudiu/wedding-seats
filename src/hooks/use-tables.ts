"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table } from "@/types";

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTables = useCallback(async () => {
    const { data, error } = await supabase.from("tables").select("*").order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching tables:", error);
    } else {
      setTables(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTables();

    const channel = supabase
      .channel("tables_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTables((prev) => [...prev, payload.new as Table]);
          } else if (payload.eventType === "UPDATE") {
            setTables((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Table) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTables((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchTables]);

  const addTable = async (table: Omit<Table, "id" | "created_at">) => {
    const { data, error } = await supabase.from("tables").insert(table).select().single();
    if (error) throw error;
    return data as Table;
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    const { data, error } = await supabase.from("tables").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as Table;
  };

  const deleteTable = async (id: string) => {
    const { error } = await supabase.from("tables").delete().eq("id", id);
    if (error) throw error;
  };

  return { tables, loading, addTable, updateTable, deleteTable, refresh: fetchTables };
}
