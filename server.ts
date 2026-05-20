import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Interfaces defining types
interface User {
  id: string;
  username: string;
  nama: string;
  role: "Admin" | "Operator" | "Viewer";
}

interface Item {
  id: string;
  name: string;
  unit: string;
  min_stock: number;
}

interface Warehouse {
  id: string;
  name: string;
  address: string;
  pic: string;
  phone: string;
}

interface StockBalance {
  item_id: string;
  warehouse_id: string;
  qty: number;
}

interface Transaction {
  id: string;
  date: string;
  item_id: string;
  warehouse_id: string;
  type: "IN" | "OUT";
  qty: number;
  notes: string;
  created_by: string;
}

interface DataState {
  users: User[];
  items: Item[];
  warehouses: Warehouse[];
  stockBalances: StockBalance[];
  transactions: Transaction[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "data_store.json");

// Helper to load or initialize database state
function loadState(): DataState {
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading data file, using default data template.", e);
    }
  }

  // Pre-populated default database state
  const defaultState: DataState = {
    users: [
      { id: "usr-1", username: "admin", nama: "Administrator Utama", role: "Admin" },
      { id: "usr-2", username: "operator", nama: "Operator WH RM", role: "Operator" },
      { id: "usr-3", username: "viewer", nama: "Viewer / Supervisor", role: "Viewer" }
    ],
    items: [
      { id: "IT-001", name: "Benzofuranol", unit: "Kg", min_stock: 150 },
      { id: "IT-002", name: "OSBP", unit: "Kg", min_stock: 150 },
      { id: "IT-003", name: "ODCB", unit: "Kg", min_stock: 180 },
      { id: "IT-004", name: "Oipop", unit: "Kg", min_stock: 120 },
      { id: "IT-005", name: "MCS", unit: "Kg", min_stock: 150 }
    ],
    warehouses: [
      { id: "WH-001", name: "WH BCS Logistic", address: "Jl. Raya Merak No. 12, Cilegon", pic: "Budi Santoso", phone: "+62 812-3456-7890" },
      { id: "WH-002", name: "WH Salira", address: "Kawasan Industri Bojonegara, Serang", pic: "Hendra Wijaya", phone: "+62 811-9876-5432" },
      { id: "WH-003", name: "WH MJS (Teratai, Bojonefara)", address: "Jl. Teratai Raya Blok B, Bojonegara", pic: "Agus Salim", phone: "+62 857-1111-2222" }
    ],
    stockBalances: [
      // Benzofuranol: 220 Kg
      { item_id: "IT-001", warehouse_id: "WH-001", qty: 120 },
      { item_id: "IT-001", warehouse_id: "WH-002", qty: 100 },
      
      // OSBP: 200 Kg
      { item_id: "IT-002", warehouse_id: "WH-002", qty: 120 },
      { item_id: "IT-002", warehouse_id: "WH-003", qty: 80 },
      
      // ODCB: 250 Kg
      { item_id: "IT-003", warehouse_id: "WH-001", qty: 100 },
      { item_id: "IT-003", warehouse_id: "WH-003", qty: 150 },
      
      // Oipop: 210 Kg
      { item_id: "IT-004", warehouse_id: "WH-001", qty: 110 },
      { item_id: "IT-004", warehouse_id: "WH-002", qty: 100 },
      
      // MCS: 200 Kg
      { item_id: "IT-005", warehouse_id: "WH-002", qty: 80 },
      { item_id: "IT-005", warehouse_id: "WH-003", qty: 120 }
    ],
    transactions: [
      { id: "TX-1001", date: "2026-05-18T08:30:00.000Z", item_id: "IT-001", warehouse_id: "WH-001", type: "IN", qty: 120, notes: "Penerimaan barang impor baru", created_by: "Operator WH RM" },
      { id: "TX-1002", date: "2026-05-18T09:15:00.000Z", item_id: "IT-001", warehouse_id: "WH-002", type: "IN", qty: 100, notes: "Stock awal masuk", created_by: "Operator WH RM" },
      { id: "TX-1003", date: "2026-05-19T10:00:00.000Z", item_id: "IT-002", warehouse_id: "WH-002", type: "IN", qty: 120, notes: "Penerimaan dari supplier lokal", created_by: "Operator WH RM" },
      { id: "TX-1004", date: "2026-05-19T11:45:00.000Z", item_id: "IT-002", warehouse_id: "WH-003", type: "IN", qty: 80, notes: "Transfer stok dari kargo", created_by: "Operator WH RM" },
      { id: "TX-1005", date: "2026-05-19T14:20:00.000Z", item_id: "IT-003", warehouse_id: "WH-003", type: "IN", qty: 150, notes: "Stock Opname awal", created_by: "Administrator Utama" }
    ]
  };

  saveState(defaultState);
  return defaultState;
}

function saveState(state: DataState) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to data store file.", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // CORS and response headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Load state on startup
  const state = loadState();

  // ---------------- AUTH API ----------------
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    // In our simplified/professional mock, any of the three users with 'password' can authenticate.
    const matchedUser = state.users.find(u => u.username.toLowerCase() === username?.trim().toLowerCase());
    
    if (matchedUser && password === "password") {
      res.json({
        success: true,
        user: matchedUser
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Username atau Password salah. (Gunakan username 'admin', 'operator', atau 'viewer' dengan password 'password')"
      });
    }
  });

  // ---------------- GENERAL STATE API ----------------
  app.get("/api/state", (req, res) => {
    res.json(state);
  });

  // ---------------- UPDATE STOCK TRANSACTION ----------------
  app.post("/api/stocks/transaction", (req, res) => {
    const { item_id, warehouse_id, type, qty, notes, created_by } = req.body;
    
    if (!item_id || !warehouse_id || !type || !qty || qty <= 0) {
      return res.status(400).json({ success: false, message: "Parameter tidak lengkap atau kuantiti tidak valid." });
    }

    const item = state.items.find(i => i.id === item_id);
    const wh = state.warehouses.find(w => w.id === warehouse_id);

    if (!item || !wh) {
      return res.status(404).json({ success: false, message: "Item atau Gudang tidak ditemukan." });
    }

    // Locate exist stock balance or create new
    let balanceIdx = state.stockBalances.findIndex(
      b => b.item_id === item_id && b.warehouse_id === warehouse_id
    );

    let currentQty = balanceIdx !== -1 ? state.stockBalances[balanceIdx].qty : 0;

    if (type === "OUT" && currentQty < qty) {
      return res.status(400).json({ 
        success: false, 
        message: `Sisa stok item di gudang ini tidak mencukupi. (Sisa: ${currentQty} ${item.unit}, Permintaan: ${qty} ${item.unit})` 
      });
    }

    const calculatedNewQty = type === "IN" ? currentQty + Number(qty) : currentQty - Number(qty);

    if (balanceIdx !== -1) {
      state.stockBalances[balanceIdx].qty = calculatedNewQty;
    } else {
      state.stockBalances.push({
        item_id,
        warehouse_id,
        qty: calculatedNewQty
      });
    }

    // Create unique TX ID
    const newTxId = `TX-${Date.now().toString().slice(-6)}`;
    const newTransaction: Transaction = {
      id: newTxId,
      date: new Date().toISOString(),
      item_id,
      warehouse_id,
      type,
      qty: Number(qty),
      notes: notes || (type === "IN" ? "Stock Masuk Baru" : "Stock Keluar Baru"),
      created_by: created_by || "System"
    };

    state.transactions.unshift(newTransaction);
    saveState(state);

    res.json({
      success: true,
      message: `Berhasil mencatat transaksi ${type} sebesar ${qty} ${item.unit}`,
      state
    });
  });

  // ---------------- WAREHOUSE MANAGEMENT ----------------
  app.post("/api/warehouses", (req, res) => {
    const { name, address, pic, phone } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: "Nama dan alamat gudang harus diisi." });
    }

    const newWhId = `WH-${(state.warehouses.length + 1).toString().padStart(3, "0")}`;
    const newWarehouse: Warehouse = {
      id: newWhId,
      name,
      address,
      pic: pic || "-",
      phone: phone || "-"
    };

    state.warehouses.push(newWarehouse);
    saveState(state);
    res.json({ success: true, message: "Gudang berhasil ditambahkan.", state });
  });

  app.put("/api/warehouses/:id", (req, res) => {
    const { id } = req.params;
    const { name, address, pic, phone } = req.body;
    const index = state.warehouses.findIndex(w => w.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Gudang tidak ditemukan." });
    }

    state.warehouses[index] = {
      ...state.warehouses[index],
      name: name || state.warehouses[index].name,
      address: address || state.warehouses[index].address,
      pic: pic || state.warehouses[index].pic,
      phone: phone || state.warehouses[index].phone
    };

    saveState(state);
    res.json({ success: true, message: "Gudang berhasil diupdate.", state });
  });

  app.delete("/api/warehouses/:id", (req, res) => {
    const { id } = req.params;
    const hasStocks = state.stockBalances.some(s => s.warehouse_id === id && s.qty > 0);
    
    if (hasStocks) {
      return res.status(400).json({ 
        success: false, 
        message: "Gudang ini masih memiliki persediaan stok aktif. Kosongkan stok terlebih dahulu sebelum menghapus." 
      });
    }

    state.warehouses = state.warehouses.filter(w => w.id !== id);
    saveState(state);
    res.json({ success: true, message: "Gudang berhasil dihapus.", state });
  });

  // ---------------- ITEM MANAGEMENT ----------------
  app.post("/api/items", (req, res) => {
    const { name, unit, min_stock } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ success: false, message: "Nama item dan satuan harus diisi." });
    }

    const newId = `IT-${(state.items.length + 1).toString().padStart(3, "0")}`;
    const newItem: Item = {
      id: newId,
      name,
      unit,
      min_stock: Number(min_stock) || 100
    };

    state.items.push(newItem);
    saveState(state);
    res.json({ success: true, message: `Barang ${name} berhasil ditambahkan.`, state });
  });

  app.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { name, unit, min_stock } = req.body;
    const index = state.items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Barang tidak ditemukan." });
    }

    state.items[index] = {
      ...state.items[index],
      name: name || state.items[index].name,
      unit: unit || state.items[index].unit,
      min_stock: min_stock !== undefined ? Number(min_stock) : state.items[index].min_stock
    };

    saveState(state);
    res.json({ success: true, message: "Spesifikasi barang berhasil diupdate.", state });
  });

  app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const hasStocks = state.stockBalances.some(s => s.item_id === id && s.qty > 0);
    if (hasStocks) {
      return res.status(400).json({
        success: false,
        message: "Barang ini masih memiliki stock aktif di beberapa gudang. Harap lakukan stock out sebelum menghapus."
      });
    }

    state.items = state.items.filter(i => i.id !== id);
    saveState(state);
    res.json({ success: true, message: "Item berhasil dihapus.", state });
  });

  // ---------------- USER MANAGEMENT ----------------
  app.post("/api/users", (req, res) => {
    const { username, nama, role } = req.body;
    if (!username || !nama || !role) {
      return res.status(400).json({ success: false, message: "Harap isi username, nama, dan role." });
    }

    const exist = state.users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exist) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan." });
    }

    const newUsr: User = {
      id: `usr-${Date.now()}`,
      username: username.toLowerCase().trim(),
      nama,
      role
    };

    state.users.push(newUsr);
    saveState(state);
    res.json({ success: true, message: "Pengguna baru berhasil didaftarkan.", state });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    if (id === "usr-1") {
      return res.status(400).json({ success: false, message: "Tidak diperbolehkan menghapus administrator utama." });
    }

    state.users = state.users.filter(u => u.id !== id);
    saveState(state);
    res.json({ success: true, message: "Pengguna berhasil dihapus.", state });
  });

  // Vite integration as middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
