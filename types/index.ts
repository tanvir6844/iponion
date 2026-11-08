export interface Service {
  id: string;
  title: string;
  price: number;
  description: string;
  active: boolean;
  icon: string;
}

export interface Engineer {
  id: number;
  name: string;
  phone: string;
  email: string;
  skill: string;
}

export interface Booking {
  id: number;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  service_title: string;
  area: string;
  support_mode: string;
  preferred_time: string;
  problem_desc?: string;
  status: "Pending" | "In Progress" | "Completed";
  assigned_engineer_id?: number | null;
  engineers?: Engineer | null;
  created_at: string;
}
