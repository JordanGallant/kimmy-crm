export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Partner = {
  id: string;
  organisation_name: string;
  country: string | null;
  website: string | null;
  status: "active" | "inactive" | "lead" | "archived";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  partner_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Activity = {
  id: string;
  partner_id: string;
  user_id: string | null;
  type: "note" | "email" | "call" | "meeting" | "other";
  title: string;
  description: string | null;
  created_at: string;
};

export type PartnerWithContacts = Partner & {
  contacts: Contact[];
};
