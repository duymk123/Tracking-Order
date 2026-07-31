import { LogOut, PackageSearch, Package, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearCredentials, getStoredProfile } from "../services/authStorage.js";

export function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getStoredProfile();

  function handleLogout() {
    clearCredentials();
    navigate("/login", { replace: true });
  }

  const navLinks = [
    { to: "/shipper/orders", icon: <PackageSearch size={24} />, label: "Nhiệm vụ" },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans md:max-w-md md:mx-auto md:border-x md:border-slate-200 md:shadow-2xl">
      {/* Top Header */}
      <header className="h-16 bg-[#0d47a1] text-white px-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">Shipper App</h1>
            <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">{profile?.username || "Tài xế"}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <LogOut size={20} />
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:max-w-md md:mx-auto bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-20 pb-safe">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? "text-[#0d47a1]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {link.icon}
              <span className={`text-[10px] font-bold ${isActive ? "text-[#0d47a1]" : "text-slate-500"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
        
        <Link
          to="/shipper/profile"
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            location.pathname === "/shipper/profile" ? "text-[#0d47a1]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <User size={24} />
          <span className={`text-[10px] font-bold ${location.pathname === "/shipper/profile" ? "text-[#0d47a1]" : "text-slate-500"}`}>
            Tài khoản
          </span>
        </Link>
      </nav>
    </div>
  );
}
