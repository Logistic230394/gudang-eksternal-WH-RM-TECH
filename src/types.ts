export interface User {
  id: string;
  username: string;
  nama: string;
  role: "Admin" | "Operator" | "Viewer";
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  min_stock: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  pic: string;
  phone: string;
}

export interface StockBalance {
  item_id: string;
  warehouse_id: string;
  qty: number;
}

export interface Transaction {
  id: string;
  date: string;
  item_id: string;
  warehouse_id: string;
  type: "IN" | "OUT";
  qty: number;
  notes: string;
  created_by: string;
}

export interface DataState {
  users: User[];
  items: Item[];
  warehouses: Warehouse[];
  stockBalances: StockBalance[];
  transactions: Transaction[];
}
