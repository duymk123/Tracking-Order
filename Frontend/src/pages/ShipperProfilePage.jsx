import { useEffect, useState } from "react";
import { MobileLayout } from "../layouts/MobileLayout.jsx";
import { getStoredProfile } from "../services/authStorage.js";
import { apiRequest } from "../api/httpClient.js";
import { CheckCircle2, Package, Star, Clock } from "lucide-react";

export function ShipperProfilePage() {
  const profile = getStoredProfile();
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all shipper orders to calculate the number of delivered orders
    apiRequest(`/api/v1/orders/shipper?pageSize=100&pageNumber=1`)
      .then(page => {
        const delivered = page.content?.filter(order => order.status === "DELIVERED") || [];
        setDeliveredCount(delivered.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileLayout>
      <div className="bg-[#0d47a1] pt-8 pb-24 px-4 sticky top-0 z-10 text-white rounded-b-3xl shadow-md flex flex-col items-center">
        <h1 className="text-xl font-black mb-6 w-full text-center">Tài khoản cá nhân</h1>
        
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white shadow-xl overflow-hidden mb-4 flex items-center justify-center relative">
          <img 
            src="/images/user_avatar.png" 
            alt="Avatar" 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-3xl text-slate-800 font-black">' + (profile?.username?.[0]?.toUpperCase() || 'S') + '</span>'; }}
          />
        </div>
        
        <h2 className="text-2xl font-black">{profile?.username || "Shipper"}</h2>
        <p className="text-blue-200 text-sm font-semibold mt-1 bg-white/10 px-3 py-1 rounded-full border border-white/20">
          Nhân viên giao hàng
        </p>
      </div>

      <div className="-mt-16 px-4 pb-8 relative z-20 space-y-4">
        
        {/* Stats Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg flex justify-around">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 size={24} />
            </div>
            {loading ? (
              <div className="w-8 h-6 bg-slate-200 animate-pulse rounded mb-1"></div>
            ) : (
              <p className="text-2xl font-black text-slate-900">{deliveredCount}</p>
            )}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn đã giao</p>
          </div>
          
          <div className="w-px bg-slate-100"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
              <Star size={24} fill="currentColor" />
            </div>
            <p className="text-2xl font-black text-slate-900">4.9</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đánh giá</p>
          </div>
        </div>

        {/* Info Menu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
              <Package size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Trung tâm đơn hàng</p>
              <p className="text-xs text-slate-500">Xem tất cả đơn giao nhiệm vụ</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Lịch sử hoạt động</p>
              <p className="text-xs text-slate-500">Thời gian làm việc gần đây</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
