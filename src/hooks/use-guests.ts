"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Guest, Conflict } from "@/types";

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGuests = useCallback(async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching guests:", error);
    } else {
      setGuests(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchGuests();

    const channel = supabase
      .channel("guests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGuests((prev) => [payload.new as Guest, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setGuests((prev) =>
              prev.map((g) => (g.id === payload.new.id ? (payload.new as Guest) : g))
            );
          } else if (payload.eventType === "DELETE") {
            setGuests((prev) => prev.filter((g) => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchGuests]);

  const addGuest = async (guest: Omit<Guest, "id" | "created_at">) => {
    const { data, error } = await supabase.from("guests").insert(guest).select().single();
    if (error) throw error;
    return data as Guest;
  };

  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    const { data, error } = await supabase.from("guests").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as Guest;
  };

  const deleteGuest = async (id: string) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) throw error;
  };

  const assignSeat = async (guestId: string, tableId: string | null, seatNumber: number | null) => {
    const { data, error } = await supabase
      .from("guests")
      .update({ table_id: tableId, seat_number: seatNumber })
      .eq("id", guestId)
      .select()
      .single();
    if (error) throw error;
    return data as Guest;
  };

  const addGuestsBatch = async (
    items: { name: string; group_size: number }[],
    side: "bride" | "groom" | "both",
    relation: string,
    specialNeeds: string | null
  ) => {
    const guestsToInsert = items.map((item) => ({
      name: item.name,
      side,
      relation: relation.trim(),
      group_size: item.group_size,
      special_needs: specialNeeds?.trim() || null,
      table_id: null,
      seat_number: null,
    }));
    const { data, error } = await supabase.from("guests").insert(guestsToInsert).select();
    if (error) throw error;
    return data as Guest[];
  };

  const unassignedGuests = guests.filter((g) => !g.table_id);
  const assignedGuests = guests.filter((g) => g.table_id);
  const totalPeople = guests.reduce((sum, g) => sum + (g.group_size || 1), 0);

  return { guests, loading, totalPeople, unassignedGuests, assignedGuests, addGuest, addGuestsBatch, updateGuest, deleteGuest, assignSeat, refresh: fetchGuests };
}

export function useConflicts() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const supabase = createClient();

  const fetchConflicts = useCallback(async () => {
    const { data } = await supabase.from("conflicts").select("*");
    setConflicts(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const addConflict = async (guestAId: string, guestBId: string, reason?: string) => {
    const { data, error } = await supabase
      .from("conflicts")
      .insert({ guest_a_id: guestAId, guest_b_id: guestBId, reason })
      .select()
      .single();
    if (error) throw error;
    return data as Conflict;
  };

  const deleteConflict = async (id: string) => {
    const { error } = await supabase.from("conflicts").delete().eq("id", id);
    if (error) throw error;
  };

  const hasConflict = (guestAId: string, guestBId: string) => {
    return conflicts.some(
      (c) =>
        (c.guest_a_id === guestAId && c.guest_b_id === guestBId) ||
        (c.guest_a_id === guestBId && c.guest_b_id === guestAId)
    );
  };

  return { conflicts, addConflict, deleteConflict, hasConflict, refresh: fetchConflicts };
}
