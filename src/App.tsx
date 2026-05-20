import React, { useState, useEffect } from "react";
import { 
  Warehouse as WarehouseIcon, 
  Package, 
  Activity, 
  Users, 
  Search, 
  Plus, 
  Minus, 
  Database, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  LogOut, 
  Phone, 
  User as UserIcon, 
  Edit2, 
  Trash2, 
  FileCode, 
  Copy, 
  Check, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Item, Warehouse, StockBalance, Transaction, DataState } from "./types";
import { mysqlSchemaScript } from "./mysqlSchema";

export default function App() {
  // Session & Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("wh_logged_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core Data State
  const [state, setState] = useState<DataState>({
    users: [],
    items: [],
    warehouses: [],
    stockBalances: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Nav, Filter & UI States
  const [activeTab, setActiveTab] = useState<"dashboard" | "stock" | "gudang" | "history" | "user" | "mysql">("dashboard");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Modal forms
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"IN" | "OUT">("IN");
  const [txItemId, setTxItemId] = useState("");
  const [txWarehouseId, setTxWarehouseId] = useState("");
  const [txQty, setTxQty] = useState<number | "">("");
  const [txNotes, setTxNotes] = useState("");
  const [txError, setTxError] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Warehouse Modal
  const [showWhModal, setShowWhModal] = useState(false);
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [whName, setWhName] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whPic, setWhPic] = useState("");
  const [whPhone, setWhPhone] = useState("");
  const [whError, setWhError] = useState("");

  // Item Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemUnit, setItemUnit] = useState("Kg");
  const [itemMinStock, setItemMinStock] = useState<number>(100);
  const [itemError, setItemError] = useState("");

  // User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userUsername, setUserUsername] = useState("");
  const [userNama, setUserNama] = useState("");
  const [userRole, setUserRole] = useState<"Admin" | "Operator" | "Viewer">("Viewer");
  const [userError, setUserError] = useState("");

  // API URL helper handles both production environments and dev environments
  const API_BASE = ""; 

  // Load backend content on startup or login
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/state`);
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const data = await res.json();
      setState(data);
      setApiError(null);
    } catch (err: any) {
      console.error(err);
      setApiError("Koneksi gagal. Aplikasi berjalan dengan data lokal bawaan.");
      // Fallback state matching the user data request
      setState({
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
          { item_id: "IT-001", warehouse_id: "WH-001", qty: 120 },
          { item_id: "IT-001", warehouse_id: "WH-002", qty: 100 },
          { item_id: "IT-002", warehouse_id: "WH-002", qty: 120 },
          { item_id: "IT-002", warehouse_id: "WH-003", qty: 80 },
          { item_id: "IT-003", warehouse_id: "WH-001", qty: 100 },
          { item_id: "IT-003", warehouse_id: "WH-003", qty: 150 },
          { item_id: "IT-004", warehouse_id: "WH-001", qty: 110 },
          { item_id: "IT-004", warehouse_id: "WH-002", qty: 100 },
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
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem("wh_logged_user", JSON.stringify(data.user));
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setAuthError(data.message || "Login gagal.");
      }
    } catch (err) {
      // Offline fallback login for easy preview testing
      const testUser = loginUsername.trim().toLowerCase();
      const testPass = loginPassword.trim().toLowerCase();
      
      let matched: User | undefined;
      let isPassOk = false;

      if (testUser === "admin" || testUser === "administrator utama") {
        matched = { id: "usr-1", username: "admin", nama: "Administrator Utama", role: "Admin" };
        isPassOk = (testPass === "123456" || testPass === "password");
      } else if (testUser === "operator" || testUser === "operator wh rm") {
        matched = { id: "usr-2", username: "operator", nama: "Operator WH RM", role: "Operator" };
        isPassOk = (testPass === "123456" || testPass === "password");
      } else if (testUser === "viewer") {
        matched = { id: "usr-3", username: "viewer", nama: "Viewer / Supervisor", role: "Viewer" };
        isPassOk = (testPass === "" || testPass === "no password" || testPass === "password");
      }

      if (matched && isPassOk) {
        setCurrentUser(matched);
        localStorage.setItem("wh_logged_user", JSON.stringify(matched));
        setLoginUsername("");
        setLoginPassword("");
        return;
      }
      setAuthError("Gagal menghubungi server auth atau data salah. Presets: Admin [123456], Operator [123456], Viewer [Tanpa Password]");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("wh_logged_user");
    setActiveTab("dashboard");
  };

  // Handle Stock Update Submit
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError("");
    
    if (!txItemId || !txWarehouseId || !txQty || Number(txQty) <= 0) {
      setTxError("Semua form wajib diisi dengan kuantiti valid.");
      return;
    }

    setIsSubmittingTx(true);
    try {
      const res = await fetch(`${API_BASE}/api/stocks/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: txItemId,
          warehouse_id: txWarehouseId,
          type: txType,
          qty: Number(txQty),
          notes: txNotes,
          created_by: currentUser?.nama || currentUser?.username || "Operator"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setState(data.state);
        setShowTxModal(false);
        setTxQty("");
        setTxNotes("");
      } else {
        setTxError(data.message || "Gagal memproses transaksi stock.");
      }
    } catch (err) {
      // Local Fallback simulation logic so user changes are fully reflected offline if server disconnected
      const newTxId = `TX-${Date.now().toString().slice(-6)}`;
      const activeItem = state.items.find(i => i.id === txItemId);
      if (!activeItem) return;

      const updatedBalances = [...state.stockBalances];
      const matchIdx = updatedBalances.findIndex(b => b.item_id === txItemId && b.warehouse_id === txWarehouseId);
      const currentQty = matchIdx !== -1 ? updatedBalances[matchIdx].qty : 0;

      if (txType === "OUT" && currentQty < Number(txQty)) {
        setTxError(`Stok tidak mencukupi. Sisa: ${currentQty} ${activeItem.unit}.`);
        setIsSubmittingTx(false);
        return;
      }

      const calculated = txType === "IN" ? currentQty + Number(txQty) : currentQty - Number(txQty);
      if (matchIdx !== -1) {
        updatedBalances[matchIdx].qty = calculated;
      } else {
        updatedBalances.push({ item_id: txItemId, warehouse_id: txWarehouseId, qty: calculated });
      }

      const newTx: Transaction = {
        id: newTxId,
        date: new Date().toISOString(),
        item_id: txItemId,
        warehouse_id: txWarehouseId,
        type: txType,
        qty: Number(txQty),
        notes: txNotes || (txType === "IN" ? "Stock Masuk" : "Stock Keluar"),
        created_by: currentUser?.nama || "Operator Offline"
      };

      setState(prev => ({
        ...prev,
        stockBalances: updatedBalances,
        transactions: [newTx, ...prev.transactions]
      }));
      setShowTxModal(false);
      setTxQty("");
      setTxNotes("");
    } finally {
      setIsSubmittingTx(false);
    }
  };

  // Create or Update Warehouse
  const handleWhSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhError("");

    if (!whName || !whAddress) {
      setWhError("Nama gudang dan alamat wajib diisi.");
      return;
    }

    try {
      if (editingWh) {
        const res = await fetch(`${API_BASE}/api/warehouses/${editingWh.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: whName, address: whAddress, pic: whPic, phone: whPhone })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setState(data.state);
          setShowWhModal(false);
          setEditingWh(null);
        } else {
          setWhError(data.message || "Gagal mengupdate gudang.");
        }
      } else {
        const res = await fetch(`${API_BASE}/api/warehouses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: whName, address: whAddress, pic: whPic, phone: whPhone })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setState(data.state);
          setShowWhModal(false);
        } else {
          setWhError(data.message || "Gagal menambah gudang.");
        }
      }
    } catch (err) {
      // Local fallback logic
      if (editingWh) {
        setState(prev => ({
          ...prev,
          warehouses: prev.warehouses.map(w => w.id === editingWh.id ? { ...w, name: whName, address: whAddress, pic: whPic, phone: whPhone } : w)
        }));
      } else {
        const localId = `WH-${Date.now().toString().slice(-3)}`;
        setState(prev => ({
          ...prev,
          warehouses: [...prev.warehouses, { id: localId, name: whName, address: whAddress, pic: whPic, phone: whPhone }]
        }));
      }
      setShowWhModal(false);
      setEditingWh(null);
    }
  };

  // Delete Warehouse
  const deleteWarehouse = async (id: string) => {
    const hasStocks = state.stockBalances.some(s => s.warehouse_id === id && s.qty > 0);
    if (hasStocks) {
      alert("Gudang ini masih memiliki sisa stock chemical aktif. Harap kosongkan stock terlebih dahulu.");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus gudang eksternal ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/warehouses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setState(data.state);
      } else {
        alert(data.message || "Gagal menghapus gudang.");
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        warehouses: prev.warehouses.filter(w => w.id !== id)
      }));
    }
  };

  // Create or Update Chemical Item specifications
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError("");

    if (!itemName || !itemUnit) {
      setItemError("Nama item dan Satuan wajib diisi.");
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch(`${API_BASE}/api/items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: itemName, unit: itemUnit, min_stock: itemMinStock })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setState(data.state);
          setShowItemModal(false);
          setEditingItem(null);
        } else {
          setItemError(data.message || "Gagal mengupdate barang.");
        }
      } else {
        const res = await fetch(`${API_BASE}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: itemName, unit: itemUnit, min_stock: itemMinStock })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setState(data.state);
          setShowItemModal(false);
        } else {
          setItemError(data.message || "Gagal menambah barang.");
        }
      }
    } catch (err) {
      // Local fallback
      if (editingItem) {
        setState(prev => ({
          ...prev,
          items: prev.items.map(i => i.id === editingItem.id ? { ...i, name: itemName, unit: itemUnit, min_stock: itemMinStock } : i)
        }));
      } else {
        const localId = `IT-${Date.now().toString().slice(-3)}`;
        setState(prev => ({
          ...prev,
          items: [...prev.items, { id: localId, name: itemName, unit: itemUnit, min_stock: itemMinStock }]
        }));
      }
      setShowItemModal(false);
      setEditingItem(null);
    }
  };

  // Delete Chemical Item
  const deleteItem = async (id: string) => {
    const hasStocks = state.stockBalances.some(s => s.item_id === id && s.qty > 0);
    if (hasStocks) {
      alert("Item ini masih memiliki stock di gudang eksternal. Lakukan export / stock OUT terlebih dahulu.");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus item chemical ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/items/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setState(data.state);
      } else {
        alert(data.message || "Gagal menghapus item.");
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== id)
      }));
    }
  };

  // Create User
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");

    if (!userUsername || !userNama || !userRole) {
      setUserError("Harap isi semua kolom pendaftaran.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userUsername, nama: userNama, role: userRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState(data.state);
        setShowUserModal(false);
        setUserUsername("");
        setUserNama("");
      } else {
        setUserError(data.message || "Gagal menambah user.");
      }
    } catch (err) {
      const localId = `usr-${Date.now()}`;
      setState(prev => ({
        ...prev,
        users: [...prev.users, { id: localId, username: userUsername, nama: userNama, role: userRole }]
      }));
      setShowUserModal(false);
      setUserUsername("");
      setUserNama("");
    }
  };

  // Delete User
  const deleteUser = async (id: string) => {
    if (id === "usr-1") {
      alert("Administrator utama tidak boleh dihapus.");
      return;
    }
    if (!confirm("Hapus otorisasi pengguna ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setState(data.state);
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    }
  };

  // Copy MySQL code to clipboard
  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(mysqlSchemaScript);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // Logic Calculations for Stocks
  const getSubtotalPerItemAndWh = (itemId: string, warehouseId?: string) => {
    let matches = state.stockBalances.filter(b => b.item_id === itemId);
    if (warehouseId) {
      matches = matches.filter(b => b.warehouse_id === warehouseId);
    }
    return matches.reduce((sum, current) => sum + current.qty, 0);
  };

  const getStockStatus = (qty: number, minStock: number) => {
    if (qty <= 0) return { label: "Kritis (Habis)", color: "text-red-600 bg-red-50 border-red-200", badge: "bg-red-500", text: "text-red-500" };
    if (qty < minStock) return { label: "Kritis (Low)", color: "text-red-600 bg-red-50 border-red-200", badge: "bg-red-500", text: "text-red-500" };
    if (qty < minStock * 1.5) return { label: "Hampir Habis", color: "text-amber-600 bg-amber-50 border-amber-200", badge: "bg-amber-500", text: "text-amber-500" };
    return { label: "Aman", color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "bg-emerald-500", text: "text-emerald-500" };
  };

  // Compile summary data
  const totalStockAmount = state.stockBalances.reduce((sum, cur) => sum + cur.qty, 0);
  const criticalItemsCount = state.items.filter(item => {
    const totalQty = getSubtotalPerItemAndWh(item.id, filterWarehouse || undefined);
    return totalQty < item.min_stock;
  }).length;
  const warningItemsCount = state.items.filter(item => {
    const totalQty = getSubtotalPerItemAndWh(item.id, filterWarehouse || undefined);
    return totalQty >= item.min_stock && totalQty < item.min_stock * 1.5;
  }).length;
  const safeItemsCount = state.items.filter(item => {
    const totalQty = getSubtotalPerItemAndWh(item.id, filterWarehouse || undefined);
    return totalQty >= item.min_stock * 1.5;
  }).length;


  // Filter Stocks for main view
  const getFilteredStocks = () => {
    return state.items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      return true;
    }).map(item => {
      const qty = getSubtotalPerItemAndWh(item.id, filterWarehouse || undefined);
      return {
        ...item,
        qty,
        status: getStockStatus(qty, item.min_stock)
      };
    });
  };

  // If not logged in, show polished Warehouse style login page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c111d] p-4 font-sans text-[12px] antialiased">
        <div className="w-full max-w-sm bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-[#0f172a] px-6 py-6 text-center relative overflow-hidden border-b border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/20 to-[#4f46e5]/10"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-[#2563eb]/10 p-2 rounded mb-2 border border-[#2563eb]/20 text-blue-400">
                <WarehouseIcon className="h-6 w-6" />
              </div>
              <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase leading-none">RM TECHNICAL</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1.5">EXTERNAL STOCK MONITOR</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-5 space-y-4">
            {authError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded flex items-start gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username Otoritas</label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all text-slate-800 font-mono"
                  placeholder="admin / operator / viewer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all text-slate-800 font-mono"
                placeholder={loginUsername.trim().toLowerCase() === "viewer" ? "Tanpa password" : "••••••••"}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-all duration-150 flex items-center justify-center cursor-pointer uppercase tracking-wider disabled:opacity-75"
            >
              {isLoggingIn ? "Mengautentikasi..." : "Masuk Sistem Monitoring"}
            </button>


          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-[12px] antialiased">
      
      {/* SIDEBAR ON DESKTOP - HIGH DENSITY & PROFESSIONAL SLATE */}
      <aside className={`w-full md:w-56 shrink-0 bg-[#0c111d] text-slate-400 flex flex-col border-r border-[#1e293b] transition-all duration-200 ${mobileMenuOpen ? "fixed inset-y-0 left-0 z-40 block" : "hidden md:flex"}`}>
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-2">
            <div className="bg-[#2563eb]/20 p-1.5 rounded border border-[#2563eb]/40 text-[#60a5fa]">
              <WarehouseIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider uppercase text-slate-100 leading-tight">RM TECHNICAL</h1>
              <p className="text-[9px] text-[#94a3b8] font-mono tracking-widest uppercase">EXTERNAL MONITOR</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items - High Density spacing and font sizes */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-600 tracking-wider uppercase px-2 py-1 select-none">Menu Monitoring</div>
          
          <button
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab("stock"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "stock" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span>Data Stock RM</span>
          </button>

          <button
            onClick={() => { setActiveTab("gudang"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "gudang" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <WarehouseIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Gudang Eksternal</span>
          </button>

          <button
            onClick={() => { setActiveTab("history"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "history" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>History Log</span>
          </button>

          <div className="pt-3 text-[10px] font-bold text-slate-600 tracking-wider uppercase px-2 py-1 select-none">Sistem &amp; Basis Data</div>

          <button
            onClick={() => { setActiveTab("user"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "user" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Sistem Users</span>
          </button>

          <button
            onClick={() => { setActiveTab("mysql"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer ${activeTab === "mysql" ? "bg-blue-600 text-white shadow-sm border-l-2 border-white" : "hover:bg-slate-900 hover:text-slate-100"}`}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span>Instalasi MySQL</span>
          </button>
        </nav>

        {/* User Card footer with narrow, dense layout */}
        <div className="p-2 border-t border-[#1e293b] bg-[#0c111d] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 p-2 bg-[#161e31]/80 rounded border border-[#1e293b]">
            <div className="h-7 w-7 rounded bg-teal-600 flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 shadow-inner">
              {currentUser.nama.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[11px] font-bold text-slate-100 truncate">{currentUser.nama}</div>
              <div className="text-[9px] font-mono text-slate-400 truncate tracking-wide uppercase">{currentUser.role === "Admin" ? "🛡️ Admin" : currentUser.role === "Operator" ? "🔧 Operator" : "👁️ Viewer"}</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full py-1 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded text-[10px] font-bold transition-all border border-red-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* MOBILE MENU COVER OVERLAY */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>
      )}

      {/* CORE WORKSPACE ZONE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
        
        {/* TOP COHESIVE SYSTEM INSTRUMENTATION BAR */}
        <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded">
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>SYSTEM REGISTRY:</span>
                <span className="text-blue-600">
                  {activeTab === "dashboard" && "Dashboard & Metrik Monitoring"}
                  {activeTab === "stock" && "Master Persediaan Chemical RM"}
                  {activeTab === "gudang" && "Master Lokasi Gudang Eksternal"}
                  {activeTab === "history" && "Audit Ledger Transaksi RM"}
                  {activeTab === "user" && "Manajemen Otorisasi Sistem"}
                  {activeTab === "mysql" && "Struktur Schema & Generator MySQL"}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide leading-none mt-0.5">
                WH RM Technical External Stock Monitoring • Active session: {currentUser.username} • Live data stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick API status Indicator */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono uppercase tracking-wide font-bold ${apiError ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-800"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiError ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
              <span>{apiError ? "DEMO MODE (OFFLINE)" : "CLOUD RUN DB LIVE"}</span>
            </div>

            {currentUser.role !== "Viewer" && (
              <button 
                onClick={() => { 
                  setTxType("IN"); 
                  setTxItemId(state.items[0]?.id || ""); 
                  setTxWarehouseId(state.warehouses[0]?.id || "");
                  setShowTxModal(true); 
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wide text-center"
              >
                <Plus className="h-3 w-3" />
                <span>Update Stok</span>
              </button>
            )}
          </div>
        </header>

        {/* GENERAL TAB MAIN CONTENTS - DENSE PADDING */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">

          {/* TOTAL INGREDIENT SUMMARY ROW - DENSE */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            
            <div className="bg-[#0f172a] text-white rounded border border-slate-800 px-3 py-2 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                <WarehouseIcon className="h-20 w-20 text-white" />
              </div>
              <div className="p-2 bg-blue-500/15 rounded border border-blue-500/35 text-blue-400">
                <WarehouseIcon className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Gudang Eksternal</span>
                <span className="text-lg font-black font-mono mt-0.5 block leading-none">{state.warehouses.length} <span className="text-[10px] text-slate-400 font-normal">Hubs</span></span>
                <span className="text-[9px] font-mono text-slate-500 block mt-0.5">Silo & Gudang Mitra</span>
              </div>
            </div>

            <div className="bg-white rounded border border-slate-200 px-3 py-2 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-indigo-600">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Total Stok RM</span>
                <span className="text-lg font-black font-mono text-slate-900 block truncate leading-none">{totalStockAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Kg</span></span>
                <span className="text-[9px] text-slate-400 block truncate mt-0.5">Seluruh Lokasi Kemitraan</span>
              </div>
            </div>

            <div className="bg-white rounded border border-slate-200 px-3 py-2 flex items-center gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-600">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Kondisi Kritis (LOW)</span>
                <span className="text-lg font-black font-mono text-rose-600 block leading-none">{criticalItemsCount} <span className="text-[10px] text-rose-400 font-normal">Sps</span></span>
                <span className="text-[9px] text-rose-500 block mt-0.5">Butuh Re-order / Mutasi</span>
              </div>
            </div>

            <div className="bg-white rounded border border-slate-200 px-3 py-2 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Kondisi Aman (OK)</span>
                <span className="text-lg font-black font-mono text-emerald-700 block leading-none">{safeItemsCount} <span className="text-[10px] text-emerald-500 font-normal">Sps</span></span>
                <span className="text-[9px] text-slate-400 block mt-0.5">{warningItemsCount} Hampir Habis</span>
              </div>
            </div>

          </section>

          {/* ACTIVE VIEW TAB DISTRIBUTOR STATE */}
          
          {/* 1. TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              
              {/* Warehouse stock level graph bar charts - HIGH DENSITY */}
              <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                  <div>
                    <h3 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-wider">Level Monitoring Sisa Stock RM</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Status kuantitatif kargo bahan baku di gudang terpilih</p>
                  </div>
                  
                  {/* Select warehouse filters */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={filterWarehouse}
                      onChange={(e) => setFilterWarehouse(e.target.value)}
                      className="text-[11px] font-mono border border-slate-200 rounded bg-slate-50 text-slate-700 py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="">[Semua Gudang Eksternal]</option>
                      {state.warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Graph visualization with pristine compact HTML layout */}
                <div className="space-y-3 pt-1">
                  {state.items.map(item => {
                    const matchedTotal = getSubtotalPerItemAndWh(item.id, filterWarehouse || undefined);
                    const percentOfMin = Math.min(100, Math.round((matchedTotal / (item.min_stock * 2)) * 100));
                    const criteria = getStockStatus(matchedTotal, item.min_stock);

                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono leading-none">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Min: {item.min_stock} {item.unit}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${criteria.color}`}>
                              {matchedTotal.toLocaleString()} {item.unit} • {criteria.label.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar container */}
                        <div className="w-full bg-slate-50 h-2 rounded overflow-hidden border border-slate-200/40">
                          <div 
                            style={{ width: `${percentOfMin}%` }} 
                            className={`h-full rounded-r transition-all duration-300 ${
                              matchedTotal < item.min_stock ? "bg-red-500" :
                              matchedTotal < item.min_stock * 1.5 ? "bg-amber-500" :
                              "bg-[#10b981]"
                            }`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100">
                  <span>*Batas bar korelasi diestimasi dari 200% kapasitas minimal aman reguler.</span>
                  <button 
                    onClick={() => setActiveTab("stock")}
                    className="text-blue-600 hover:text-blue-800 font-black uppercase tracking-wider text-[10px]"
                  >
                    Atur Master Item &rarr;
                  </button>
                </div>
              </div>

              {/* Sidebar helper panels with warning indicators & recent activity ledger log */}
              <div className="space-y-3">

                {/* Warehouses allocations metric status block */}
                <div className="bg-white rounded border border-slate-200 p-4 shadow-xs space-y-3">
                  <h3 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">[Alokasi Kargo per Gudang]</h3>
                  
                  <div className="space-y-2">
                    {state.warehouses.map(wh => {
                      const totalInWh = state.stockBalances
                        .filter(s => s.warehouse_id === wh.id)
                        .reduce((sum, cur) => sum + cur.qty, 0);

                      return (
                        <div key={wh.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/50 hover:bg-slate-100/50 transition-colors">
                          <div className="min-w-0 flex-1 pr-1">
                            <div className="text-[11px] font-bold text-slate-800 truncate uppercase">{wh.name}</div>
                            <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5 leading-none">{wh.address}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-extrabold font-mono text-slate-900 block leading-none">{totalInWh.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">Kg</span></span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Total Stok</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro recent Transactions list */}
                <div className="bg-white rounded border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h3 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-widest">[Buku Ledger Terkini]</h3>
                    <button 
                      onClick={() => setActiveTab("history")}
                      className="text-[9px] font-extrabold tracking-wider uppercase text-blue-600 hover:underline"
                    >
                      Lihat Semua &rarr;
                    </button>
                  </div>

                  <div className="space-y-2">
                    {state.transactions.slice(0, 4).map(tx => {
                      const itemMatch = state.items.find(i => i.id === tx.item_id);
                      const whMatch = state.warehouses.find(w => w.id === tx.warehouse_id);

                      return (
                        <div key={tx.id} className="flex items-start gap-2 justify-between p-1.5 rounded bg-slate-50/50 border border-slate-100">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              {tx.type === "IN" ? (
                                <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-bold shrink-0">IN</span>
                              ) : (
                                <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-bold shrink-0">OUT</span>
                              )}
                              <span className="text-[11px] font-bold text-slate-800 truncate tracking-tight">{itemMatch?.name || "Bahan Baku"}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5 truncate leading-none">
                              {whMatch ? whMatch.name.slice(0, 16) : "-"}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[11px] font-bold font-mono ${tx.type === "IN" ? "text-emerald-700" : "text-amber-700"}`}>
                              {tx.type === "IN" ? "+" : "-"}{tx.qty.toLocaleString()} Kg
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. TAB: DATA STOCK MASTER */}
          {activeTab === "stock" && (
            <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Table search, item details structure, and warehouse filters */}
              <div className="px-3.5 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari item chemical/ID..."
                      className="w-full pl-8 pr-3 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <select
                    value={filterWarehouse}
                    onChange={(e) => setFilterWarehouse(e.target.value)}
                    className="w-full sm:w-auto text-[11px] border border-slate-200 rounded bg-white text-slate-700 py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">[Semua Gudang Penyimpanan]</option>
                    {state.warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {currentUser.role === "Admin" && (
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setItemName("");
                        setItemUnit("Kg");
                        setItemMinStock(150);
                        setShowItemModal(true);
                      }}
                      className="px-2.5 py-1 border border-slate-200 rounded text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Tambah Raw Material</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Responsive Table Layout - HIGH DENSITY CELL PADDING */}
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID &amp; NAMA CHEMICAL</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DISTRIBUSI GUDANG EKSTERNAL</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">SAFETY LIMIT</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">TOTAL VOL</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">STATUS</th>
                      {currentUser.role !== "Viewer" && (
                        <th className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">TINDAKAN</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-mono text-[11px]">
                    {getFilteredStocks().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[11px] text-slate-400 italic">
                          Tidak ada chemical item yang cocok dengan pencarian Anda.
                        </td>
                      </tr>
                    ) : (
                      getFilteredStocks().map(item => {
                        // Gather what precise allocations this item has across selected or all warehouses
                        const inWarehouses = state.warehouses.map(w => {
                          const quantity = state.stockBalances.find(b => b.item_id === item.id && b.warehouse_id === w.id)?.qty || 0;
                          return { name: w.name, quantity };
                        }).filter(wq => filterWarehouse ? state.warehouses.find(g => g.id === filterWarehouse)?.name === wq.name : wq.quantity > 0);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${item.qty < item.min_stock ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}/>
                                <div className="leading-tight">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">{item.id}</span>
                                  <div className="text-[11px] font-bold text-slate-900 uppercase font-sans tracking-wide">{item.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-1.5 min-w-[200px] font-sans">
                              {inWarehouses.length === 0 ? (
                                <span className="text-[10px] text-rose-500 font-bold italic block">[STOK KOSONG DI GUDANG MITRA]</span>
                              ) : (
                                <div className="grid grid-cols-1 gap-0.5 max-y-12 overflow-y-auto">
                                  {inWarehouses.map((whInfo, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-1.5 max-w-[260px] text-[10px] leading-none py-0.5">
                                      <span className="text-slate-500 truncate block">{whInfo.name}</span>
                                      <span className="font-mono font-bold text-slate-700 block bg-slate-100 px-1 py-0.2 rounded">{whInfo.quantity.toLocaleString()} Kg</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-slate-500 font-bold">
                              {item.min_stock.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right font-bold text-slate-900 text-[12px]">
                              {item.qty.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center font-sans">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${item.status.color} uppercase tracking-wider`}>
                                {item.status.label}
                              </span>
                            </td>
                            {currentUser.role !== "Viewer" && (
                              <td className="px-3.5 py-2 whitespace-nowrap text-right font-sans text-[11px]">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setTxItemId(item.id);
                                      setTxWarehouseId(state.warehouses[0]?.id || "");
                                      setTxType("IN");
                                      setTxQty("");
                                      setTxNotes("");
                                      setShowTxModal(true);
                                    }}
                                    className="p-1 px-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                  >
                                    + IN
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTxItemId(item.id);
                                      setTxWarehouseId(state.warehouses[0]?.id || "");
                                      setTxType("OUT");
                                      setTxQty("");
                                      setTxNotes("");
                                      setShowTxModal(true);
                                    }}
                                    className="p-1 px-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                  >
                                    - OUT
                                  </button>
                                  {currentUser.role === "Admin" && (
                                    <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-0.5">
                                      <button
                                        onClick={() => {
                                          setEditingItem(item);
                                          setItemName(item.name);
                                          setItemUnit(item.unit);
                                          setItemMinStock(item.min_stock);
                                          setShowItemModal(true);
                                        }}
                                        className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-100 rounded cursor-pointer"
                                        title="Edit Spek"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded cursor-pointer"
                                        title="Hapus"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. TAB: DATA GUDANG EKSTERNAL */}
          {activeTab === "gudang" && (
            <div className="space-y-3">

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-wider">Master Data Gudang Pengiriman Eksternal</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Titik lokasi penyimpanan RM Technical sebelum dilokasikan ke lini produksi utama</p>
                </div>
                {currentUser.role === "Admin" && (
                  <button
                    onClick={() => {
                      setEditingWh(null);
                      setWhName("");
                      setWhAddress("");
                      setWhPic("");
                      setWhPhone("");
                      setShowWhModal(true);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Gudang Mitra</span>
                  </button>
                )}
              </div>

              {/* Grid cards displaying detailed warehouses info - HIGH DENSITY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {state.warehouses.map(wh => {
                  const itemsInWh = state.stockBalances.filter(b => b.warehouse_id === wh.id);
                  const totalKgInWh = itemsInWh.reduce((sum, current) => sum + current.qty, 0);

                  return (
                    <div key={wh.id} className="bg-white rounded border border-slate-200 p-3.5 space-y-3 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute right-0 top-0 h-0.5 bg-blue-600 w-1/4 group-hover:w-full transition-all duration-300"></div>
                      
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">ID: {wh.id}</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[8px] font-extrabold border border-blue-200 uppercase tracking-widest font-mono">
                            External Hub
                          </span>
                        </div>

                        <div>
                          <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-wide leading-none">{wh.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium flex items-start gap-1 p-1.5 bg-slate-50 border border-slate-100 rounded mt-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>{wh.address}</span>
                          </span>
                        </div>

                        {/* Operational PIC Details */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-sans">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">PIC Lapangan</span>
                            <span className="font-bold text-slate-700">{wh.pic}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Kontak Telepon</span>
                            <span className="font-semibold flex items-center gap-0.5 text-slate-700 justify-end"><Phone className="h-2.5 w-2.5" />{wh.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cumulative stats block */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">Uraian Stok</span>
                          <span className="text-[10px] font-bold text-slate-700 font-sans">{itemsInWh.length} Jenis Chemical</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block uppercase">Total Kuantitas</span>
                          <span className="text-[11px] font-black text-slate-900">{totalKgInWh.toLocaleString()} Kg</span>
                        </div>
                      </div>

                      {/* Config buttons logic */}
                      {currentUser.role === "Admin" && (
                        <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100 font-sans">
                          <button
                            onClick={() => {
                              setEditingWh(wh);
                              setWhName(wh.name);
                              setWhAddress(wh.address);
                              setWhPic(wh.pic);
                              setWhPhone(wh.phone);
                              setShowWhModal(true);
                            }}
                            className="p-1 px-2.5 text-[9px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded font-bold border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                            <span>Edit Info</span>
                          </button>
                          <button
                            onClick={() => deleteWarehouse(wh.id)}
                            className="p-1 px-2.5 text-[9px] text-red-600 hover:text-red-700 hover:bg-red-50 rounded font-bold border border-red-100 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 4. TAB: HISTORY LOGS */}
          {activeTab === "history" && (
            <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Header and filters */}
              <div className="px-3.5 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari transaksi / operator / notes..."
                      className="w-full pl-8 pr-3 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <select
                    value={filterWarehouse}
                    onChange={(e) => setFilterWarehouse(e.target.value)}
                    className="w-full sm:w-auto text-[11px] border border-slate-200 rounded bg-white text-slate-700 py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">[Semua Lokasi Gudang]</option>
                    {state.warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="shrink-0 leading-none">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase">
                    Total: {state.transactions.length} Transaksi
                  </span>
                </div>
              </div>

              {/* Transactions list log - HIGH DENSITY CELL PADDING */}
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-200 text-left font-mono text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID LOG</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">WAKTU (WIB)</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CHEMICAL ITEM</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">LOKASI GUDANG</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TIPE ACTION</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">KUANTITI</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">KETERANGAN / DOK</th>
                      <th className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PETUGAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {state.transactions
                      .filter(tx => {
                        const itemMatch = state.items.find(i => i.id === tx.item_id);
                        const whMatch = state.warehouses.find(w => w.id === tx.warehouse_id);
                        const fieldsText = `${tx.id} ${itemMatch?.name || ""} ${whMatch?.name || ""} ${tx.notes} ${tx.created_by}`.toLowerCase();
                        
                        const matchSearch = fieldsText.includes(searchQuery.toLowerCase());
                        const matchWarehouse = filterWarehouse ? tx.warehouse_id === filterWarehouse : true;
                        
                        return matchSearch && matchWarehouse;
                      })
                      .map(tx => {
                        const itemMatch = state.items.find(i => i.id === tx.item_id);
                        const whMatch = state.warehouses.find(w => w.id === tx.warehouse_id);

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-1.5 whitespace-nowrap">
                              <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">
                                {tx.id}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                              {new Date(tx.date).toLocaleString("id-ID", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                              })} WIB
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap uppercase font-sans font-bold text-slate-800">
                              {itemMatch ? itemMatch.name : tx.item_id}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap font-sans text-slate-600">
                              {whMatch ? whMatch.name : tx.warehouse_id}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-center font-sans">
                              {tx.type === "IN" ? (
                                <span className="px-1.5 py-0.2 text-[8px] font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-200 font-mono">
                                  [IN] MASUK
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 text-[8px] font-extrabold tracking-wider uppercase bg-amber-100 text-amber-800 rounded border border-amber-200 font-mono">
                                  [OUT] KELUAR
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-right font-black">
                              <span className={tx.type === "IN" ? "text-emerald-700" : "text-amber-700"}>
                                {tx.type === "IN" ? "+" : "-"}{tx.qty.toLocaleString()} Kg
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-slate-500 max-w-xs truncate font-sans text-[11px]" title={tx.notes}>
                              {tx.notes || "-"}
                            </td>
                            <td className="px-3.5 py-1.5 whitespace-nowrap font-sans text-[11px] text-slate-600">
                              <div className="flex items-center gap-1">
                                <div className="h-4.5 w-4.5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-extrabold text-slate-600 shrink-0">
                                  {tx.created_by.slice(0, 1).toUpperCase()}
                                </div>
                                <span className="truncate">{tx.created_by}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 5. TAB: MANAGEMENT USER */}
          {activeTab === "user" && (
            <div className="space-y-3">

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-wider">Manajemen Pengguna &amp; Otoritas Sistem</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Pembatasan role dan akses pencatatan transaksi masuk-keluar WH RM Technical</p>
                </div>
                {currentUser.role === "Admin" && (
                  <button
                    onClick={() => {
                      setUserUsername("");
                      setUserNama("");
                      setUserRole("Viewer");
                      setShowUserModal(true);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Petugas Baru</span>
                  </button>
                )}
              </div>

              {/* Users detailed grid - HIGH DENSITY */}
              <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest font-mono">Daftar Akun Otoritas Wh Technical</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {state.users.map(u => (
                    <div key={u.id} className="p-3 flex items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 border border-slate-200/50 shrink-0">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{u.nama}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">Username: {u.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          u.role === "Admin" ? "bg-red-50 text-red-700 border-red-200" :
                          u.role === "Operator" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        } font-mono uppercase tracking-wide`}>
                          {u.role}
                        </span>

                        {currentUser.role === "Admin" && u.id !== "usr-1" ? (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer transition-colors"
                            title="Hapus Hak Akses"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : u.id === "usr-1" ? (
                          <span className="text-[9px] text-slate-400 font-mono italic">Superadmin</span>
                        ) : null}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 6. TAB: MYSQL SCHEMA HUB SUMMARY */}
          {activeTab === "mysql" && (
            <div className="space-y-3">
              
              <div className="p-4 bg-[#0f172a] border border-slate-800 rounded text-white space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/15 p-2 rounded border border-blue-500/30 text-blue-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[12px] text-slate-100 uppercase tracking-wider">Database Setup &amp; Integrasi MySQL</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Gunakan script DDL relational schema berikut untuk melakukan deployment database lokal / server produksi</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed max-w-4xl">
                  Rancangan database relational ini dirancang khusus untuk menyimpan relasi stok multi-gudang (One-to-Many pada Warehouses &amp; Items, dan Many-to-Many pada Stock Balances), lengkap dengan ledger audit histori keluar-masuk barang RM.
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[9px]">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Host: port 3306 (MySQL)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Engine: InnoDB
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Collate: utf8mb4_unicode_ci
                  </span>
                </div>
              </div>

              {/* Copy DDL SQL installation container */}
              <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-slate-500" />
                    <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest block font-mono">Script SQL (DDL + Seeds Insert)</span>
                  </div>

                  <button
                    onClick={copySchemaToClipboard}
                    className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedSchema ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-950">
                  <pre className="text-[10px] font-mono text-slate-300 font-medium overflow-x-auto max-h-72 leading-relaxed custom-scroll">
                    {mysqlSchemaScript}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ----------------- MODAL ACTIONS ----------------- */}

      {/* A. TRANSACTION MODAL (STOCK IN / OUT) */}
      <AnimatePresence>
        {showTxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTxModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <span className="text-sm font-extrabold tracking-widest uppercase">
                  {txType === "IN" ? "📝 TAMBAH STOK MASUK (IN)" : "📝 UPDATE STOK KELUAR (OUT)"}
                </span>
                <button 
                  onClick={() => setShowTxModal(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
                {txError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-start gap-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{txError}</span>
                  </div>
                )}

                {/* Switcher IN/OUT toggler */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setTxType("IN")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${txType === "IN" ? "bg-white text-emerald-700 shadow-xs border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Stock IN (Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("OUT")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${txType === "OUT" ? "bg-white text-amber-700 shadow-xs border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Stock OUT (Keluar)
                    </button>
                  </div>
                </div>

                {/* Item Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pilih Chemical Item</label>
                  <select
                    value={txItemId}
                    onChange={(e) => setTxItemId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 py-3 px-3.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  >
                    <option value="" disabled>-- Pilih Raw Material --</option>
                    {state.items.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                    ))}
                  </select>
                </div>

                {/* Warehouse Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pilih Gudang Eksternal</label>
                  <select
                    value={txWarehouseId}
                    onChange={(e) => setTxWarehouseId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 py-3 px-3.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  >
                    <option value="" disabled>-- Pilih Gudang Eksternal --</option>
                    {state.warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-qty and unit validation check */}
                {txItemId && txWarehouseId && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 flex justify-between font-mono">
                    <span>Sisa Stok Terkini di Gudang Terpilih:</span>
                    <span className="font-extrabold text-blue-950">
                      {state.stockBalances.find(b => b.item_id === txItemId && b.warehouse_id === txWarehouseId)?.qty || 0} Kg
                    </span>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Jumlah (Kuantitas Kg)</label>
                  <input
                    type="number"
                    value={txQty}
                    onChange={(e) => setTxQty(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    placeholder="Contoh: 50"
                    min="1"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Keterangan / Deskripsi Transaksi</label>
                  <textarea
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 h-16 resize-none"
                    placeholder="Contoh: Penerimaan No. PO 8812 atau Pengeluaran ke Line Batch C"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTxModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTx}
                    className="px-6 py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-xs font-semibold cursor-pointer border-b border-black/50 transition-colors shadow-md disabled:opacity-75"
                  >
                    {isSubmittingTx ? "Memproses..." : txType === "IN" ? "Submit IN" : "Submit OUT"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. WAREHOUSE MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showWhModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWhModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <span className="text-sm font-extrabold tracking-widest uppercase">
                  {editingWh ? "✏️ EDIT INFO GUDANG" : "➕ TAMBAH GUDANG MITRA"}
                </span>
                <button onClick={() => setShowWhModal(false)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleWhSubmit} className="p-6 space-y-4">
                {whError && (
                  <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-lg">
                    {whError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Gudang Eksternal</label>
                  <input
                    type="text"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: WH BCS Logistic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Alamat Lengkap</label>
                  <textarea
                    value={whAddress}
                    onChange={(e) => setWhAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 h-16 resize-none"
                    placeholder="Contoh: Kawasan Industri Bojonegara, Serang..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama PIC Lapangan</label>
                  <input
                    type="text"
                    value={whPic}
                    onChange={(e) => setWhPic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: Hendra Wijaya"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Kontak Telepon PIC</label>
                  <input
                    type="text"
                    value={whPhone}
                    onChange={(e) => setWhPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: +62 811..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowWhModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-slate-850"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. CHEMICAL ITEM MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowItemModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <span className="text-sm font-extrabold tracking-widest uppercase">
                  {editingItem ? "✏️ EDIT SPEK BAHAN RM" : "➕ TAMBAH RAW MATERIAL BARU"}
                </span>
                <button onClick={() => setShowItemModal(false)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
                {itemError && (
                  <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-lg">
                    {itemError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Raw Material Chemical</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: Benzofuranol"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Satuan Ukuran</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: Kg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Batas Minimum Safe (Batas Alert Kuning/Merah)</label>
                  <input
                    type="number"
                    value={itemMinStock}
                    onChange={(e) => setItemMinStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: 150"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-slate-850"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. USER MODAL */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <span className="text-sm font-extrabold tracking-widest uppercase">
                  ➕ TAMBAH USER / PETUGAS BARU
                </span>
                <button onClick={() => setShowUserModal(false)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                {userError && (
                  <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-lg">
                    {userError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username (Untuk Login)</label>
                  <input
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: ricky_spv"
                    required
                  />
                  <p className="text-[9px] text-slate-400 mt-1">*Password default akun baru di-set: "password"</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Lengkap Petugas</label>
                  <input
                    type="text"
                    value={userNama}
                    onChange={(e) => setUserNama(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Contoh: Ricky Kurniawan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Hak Akses (Role)</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="Viewer">Viewer / Supervisor (Lihat Saja)</option>
                    <option value="Operator">Operator WH (Update Stok masuk keluar)</option>
                    <option value="Admin">Admin (Tambah & Hapus Objek/Akun)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-slate-850"
                  >
                    Daftarkan Pengguna
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
