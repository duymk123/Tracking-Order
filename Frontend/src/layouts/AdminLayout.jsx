import { LogOut, Package, PackageSearch, RotateCcw, Truck, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearCredentials, getStoredProfile } from "../services/authStorage.js";

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getStoredProfile();

  function handleLogout() {
    clearCredentials();
    navigate("/login", { replace: true });
  }

  const navLinks = [
    { to: "/seller/orders", icon: <Package size={20} />, label: "Quản lý đơn hàng" },
    { to: "/seller/returns", icon: <RotateCcw size={20} />, label: "Yêu cầu trả hàng" },
    { to: "/seller/inventory", icon: <PackageSearch size={20} />, label: "Kho hàng (Read-only)" },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d47a1] text-white flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-6">
          <Link to="/seller/orders" className="flex items-center gap-3">
            <div className="bg-white text-[#0d47a1] p-1.5 rounded-lg shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
            <span className="text-xl font-black tracking-tight">Admin Console</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? "bg-white/10 text-white shadow-inner" 
                    : "text-blue-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="bg-[#1565c0] rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-400/30 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">{profile?.username}</p>
              <p className="text-xs font-semibold text-blue-200 uppercase">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
          <h1 className="text-xl font-black text-slate-800">
            {navLinks.find(l => location.pathname.startsWith(l.to))?.label || "Admin Console"}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
