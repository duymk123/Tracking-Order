import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import { Package, Eye, ChevronRight, Box, Clock, Truck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={14} /> },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} /> },
  PICKING:   { label: "Đang lấy hàng", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Box size={14} /> },
  SHIPPING:  { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck size={14} /> },
  DELIVERED: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={14} /> },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle size={14} /> },
  REATTEMPT: { label: "Giao lại", color: "bg-pink-100 text-pink-700 border-pink-200", icon: <Truck size={14} /> },
};

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
  { id: "FAILED", label: "Thất bại" },
];

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiRequest("/api/v1/orders/my-orders")
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = activeTab === "ALL" 
    ? orders 
    : orders.filter(order => order.status === activeTab || 
        (activeTab === "SHIPPING" && ["PICKING", "SHIPPING", "REATTEMPT"].includes(order.status)) ||
        (activeTab === "PENDING" && order.status === "CONFIRMED")
      );

  return (
    <StorefrontLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Đơn hàng của tôi</h1>
        <p className="text-slate-500 font-medium">Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-6 pb-[1px]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? "border-[#0d47a1] text-[#0d47a1]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-[#0d47a1]">
          <Box className="animate-bounce mb-4" size={40} />
          <p className="font-bold text-slate-600">Đang tải đơn hàng...</p>
        </div>
      )}
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <Package size={64} className="mb-4 opacity-30" strokeWidth={1} />
              <p className="font-bold text-lg text-slate-600">Không có đơn hàng nào.</p>
              <p className="text-sm">Bạn chưa có đơn hàng nào ở trạng thái này.</p>
            </div>
          )}
          
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Box size={14} /> };
            
            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#0d47a1]/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0d47a1] flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-900 text-lg uppercase">#{order.orderId?.slice(0, 8)}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        Đặt ngày {new Date(order.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Số lượng</p>
                      <p className="font-bold text-slate-800">{order.totalItems} sản phẩm</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền</p>
                      <p className="font-black text-[#0d47a1] text-lg">
                        {Number(order.grandTotal).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-[#f8f9fc] hover:border-[#0d47a1] hover:text-[#0d47a1] transition"
                  >
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StorefrontLayout>
  );
}

