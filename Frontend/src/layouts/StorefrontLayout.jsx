import { Search, ShoppingCart, User, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials, getStoredProfile } from "../services/authStorage.js";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";

export function StorefrontLayout({ children }) {
  const navigate = useNavigate();
  const profile = getStoredProfile();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (profile?.username) {
      apiRequest("/api/v1/cart")
        .then(data => {
          setCartCount(data.items?.length || 0);
        })
        .catch(e => console.error("Could not fetch cart count", e));
    }
  }, [profile?.username]);

  function handleLogout() {
    clearCredentials();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fc] text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center">
          
          <Link to="/products" className="flex items-center mr-10">
            <span className="text-2xl font-black text-[#1a429b] tracking-tight">Storefront</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/products" className="text-[#1a429b] font-black border-b-2 border-[#1a429b] pb-1 mt-1">Shop</Link>
            <Link to="/products" className="text-slate-500 font-bold hover:text-slate-900 transition">Categories</Link>
            <Link to="/orders" className="text-slate-500 font-bold hover:text-slate-900 transition">Tracking</Link>
            <Link to="/products" className="text-slate-500 font-bold hover:text-slate-900 transition">Support</Link>
          </nav>

          <div className="flex-1"></div>

          <div className="hidden md:flex items-center bg-[#eef2f9] rounded-lg px-4 py-2.5 w-[300px]">
            <Search size={16} strokeWidth={2.5} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-6 ml-8">
            <Link to="/cart" className="relative text-slate-600 hover:text-[#1a429b] transition">
              <ShoppingCart size={22} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#1a429b] text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white box-content">
                  {cartCount}
                </span>
              )}
            </Link>

            <button className="text-slate-600 hover:text-[#1a429b] transition">
              <Bell size={22} strokeWidth={2.5} />
            </button>

            <div className="relative group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                 <img src="/images/user_avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              
              <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-black text-slate-900">{profile?.username || "Guest"}</p>
                </div>
                <Link to="/orders" className="px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1a429b]">Đơn hàng của tôi</Link>
                <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 text-left">Đăng xuất</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
