export type Side = "bride" | "groom" | "both";
export type TableType = "round" | "long";

export interface Table {
  id: string;
  name: string;
  type: TableType;
  capacity: number;
  position_x: number;
  position_y: number;
  relation_type?: string | null;
  created_at?: string;
}

export interface Guest {
  id: string;
  name: string;
  side: Side;
  relation: string;
  table_id?: string | null;
  seat_number?: number | null;
  group_size?: number | null;
  special_needs?: string | null;
  created_at?: string;
}

export interface Conflict {
  id: string;
  guest_a_id: string;
  guest_b_id: string;
  reason?: string | null;
  created_at?: string;
}

export interface SeatedGuest extends Guest {
  table_id: string;
  seat_number: number;
}

export interface TableWithGuests extends Table {
  guests: Guest[];
}

export type OnlineUser = {
  id: string;
  name: string;
  online_at: string;
};
