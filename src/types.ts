export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff';
}

export interface Seed {
  id: number;
  name: string;
  variety: string;
  quantity: number;
  unit: string;
  category: string;
  last_updated: string;
}

export interface Distribution {
  id: number;
  seed_id: number;
  seed_name?: string;
  recipient: string;
  quantity: number;
  date: string;
}
