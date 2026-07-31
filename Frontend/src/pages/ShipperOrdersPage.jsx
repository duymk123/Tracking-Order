import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { MobileLayout } from "../layouts/MobileLayout.jsx";
import { Truck, ChevronRight, Box, Clock, CheckCircle2, XCircle, AlertCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING:   { label: "Chờ lấy hàng", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={14} /> },
  CONFIRMED: { label: "Đã phân công", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} /> },
  PICKING:   { label: "Cần lấy hàng", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Box size={14} /> },
  SHIPPING:  { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck size={14} /> },
  DELIVERED: { label: "Đã giao xong", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={14} /> },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle size={14} /> },
  REATTEMPT: { label: "Cần giao lại", color: "bg-pink-100 text-pink-700 border-pink-200", icon: <Truck size={14} /> },
};

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PICKING", label: "Cần lấy" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
];

export function ShipperOrdersPage() {
  const [page, setPage] = useState({ content: [], totalPages: 0, number: 0 });
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Real app would filter via API if supported
    apiRequest(`/api/v1/orders/shipper?pageSize=50&pageNumber=${pageNumber}`)
      .then(setPage)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [pageNumber]);

  // Client-side filtering
  const filteredOrders = page.content?.filter(order => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PICKING" && (order.status === "CONFIRMED" || order.status === "PICKING")) return true;
    if (activeTab === "SHIPPING" && (order.status === "SHIPPING" || order.status === "REATTEMPT")) return true;
    return order.status === activeTab;
  }) || [];

  return (
    <MobileLayout>
      <div className="bg-[#0d47a1] pt-6 pb-4 px-4 sticky top-0 z-10 text-white rounded-b-2xl shadow-md">
        <h1 className="text-2xl font-black mb-1">Nhiệm vụ hôm nay</h1>
        <p className="text-blue-200 text-sm font-semibold">{filteredOrders.length} đơn hàng cần xử lý</p>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full transition-all border ${
                activeTab === tab.id
                  ? "bg-white text-[#0d47a1] border-white shadow-sm"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-[#0d47a1]">
            <Truck className="animate-bounce mb-4" size={40} />
            <p className="font-bold text-slate-600 text-sm">Đang tải danh sách nhiệm vụ...</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700 shadow-sm">
            <p className="font-bold mb-1 text-sm">Không thể tải dữ liệu</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400 shadow-sm">
                <Truck size={48} className="mb-4 opacity-30 text-slate-300" strokeWidth={1} />
                <p className="font-bold text-slate-600">Tuyệt vời!</p>
                <p className="text-xs text-slate-500 mt-1">Hiện không có nhiệm vụ nào.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Box size={14} /> };
                
                return (
                  <div
                    key={order.orderId}
                    onClick={() => navigate(`/shipper/orders/${order.orderId}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
                  >
                    {/* Status side indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.color.split(' ')[0].replace('100', '500')}`} />
                    
                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mã đơn hàng</p>
                        <p className="font-black text-slate-900 leading-none">#{order.orderId?.slice(0, 8)}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </div>
                    
                    <div className="pl-2 mb-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex gap-2">
                        <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{order.recipientName} - {order.recipientPhone}</p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {order.detailAddress}, {order.district}, {order.city && `${order.city}, `}{order.province}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pl-2">
                      <div className="flex items-center gap-1 text-[#0d47a1]">
                        <p className="font-black">{Number(order.grandTotal).toLocaleString("vi-VN")}₫</p>
                        <span className="text-[10px] font-bold bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 ml-1">Thu hộ</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {page.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  disabled={pageNumber === 1}
                  onClick={() => setPageNumber(p => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 shadow-sm"
                >
                  Trước
                </button>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                  {pageNumber} / {page.totalPages}
                </span>
                <button
                  disabled={pageNumber >= page.totalPages}
                  onClick={() => setPageNumber(p => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 shadow-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

