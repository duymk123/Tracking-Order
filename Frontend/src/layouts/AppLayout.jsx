import { LogOut, Package, ShoppingCart, Truck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials, getStoredProfile } from "../services/authStorage.js";

export function AppLayout({ children }) {
  const navigate = useNavigate();
  const profile = getStoredProfile();

  function handleLogout() {
    clearCredentials();
    navigate("/login", { replace: true });
  }

  const navLinks = {
    BUYER: [
      { to: "/products", icon: <Package size={18} />, label: "Products" },
      { to: "/cart", icon: <ShoppingCart size={18} />, label: "Cart" },
      { to: "/orders", icon: <Truck size={18} />, label: "My Orders" },
    ],
    SELLER: [
      { to: "/seller/orders", icon: <Package size={18} />, label: "Orders" },
    ],
    SHIPPER: [
      { to: "/shipper/orders", icon: <Truck size={18} />, label: "Deliveries" },
    ],
  };

  const links = navLinks[profile?.role] || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-[#09389a] text-white">
            <Truck size={18} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-black text-[#09389a]">Tracking Order</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <User size={16} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-700">{profile?.username}</span>
            <span className="rounded-full bg-[#09389a] px-2 py-0.5 text-xs font-bold text-white">
              {profile?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
