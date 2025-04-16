
export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: 'Lead' | 'Prospect' | 'Customer';
  created_at: string;
  updated_at: string;
  tags?: Tag[];
};

export type Activity = {
  id: string;
  contact_id: string;
  type: 'Call' | 'Meeting' | 'Email' | 'Note';
  description: string;
  date: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  email: string;
};