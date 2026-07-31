import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { Package, ChevronRight, ChevronLeft, Search, Filter, Box, Clock, Truck, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
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
  { id: "ALL", label: "Tất cả đơn" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "PICKING", label: "Đang lấy hàng" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
];

export function SellerOrdersPage() {
  const [page, setPage] = useState({ content: [], totalPages: 0, number: 0 });
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // In a real app we would pass status filter to API. 
    // Here we just fetch all and filter client side for demo, or rely on API if it supports it.
    // The current API doesn't seem to support status filter in query, so we fetch standard page.
    apiRequest(`/api/v1/orders/seller?pageSize=50&pageNumber=${pageNumber}`)
      .then(setPage)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [pageNumber]);

  // Client-side filtering
  const filteredOrders = page.content?.filter(order => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch = order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.buyerUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  }) || [];

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quản lý Đơn hàng</h1>
          <p className="text-slate-500 font-medium">Theo dõi và xử lý các đơn đặt hàng từ khách hàng</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Tìm mã đơn, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0d47a1] focus:ring-1 focus:ring-[#0d47a1] w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>
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
          <p className="font-bold text-slate-600">Đang tải danh sách đơn hàng...</p>
        </div>
      )}
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm mb-6">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Mã đơn hàng</th>
                  <th className="p-4">Ngày đặt</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={48} className="mb-4 opacity-30 text-slate-400" strokeWidth={1} />
                        <p className="font-bold text-slate-600">Không tìm thấy đơn hàng nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Box size={14} /> };
                    
                    return (
                      <tr key={order.orderId} className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => navigate(`/seller/orders/${order.orderId}`)}>
                        <td className="p-4 pl-6">
                          <p className="font-black text-slate-900 uppercase">#{order.orderId?.slice(0, 8)}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-semibold text-slate-600">{order.createdAt?.slice(0, 10)}</p>
                          <p className="text-xs text-slate-400">{order.createdAt?.slice(11, 16)}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-800">{order.buyerUsername}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-black text-[#0d47a1]">
                            {Number(order.grandTotal).toLocaleString("vi-VN")}₫
                          </p>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/seller/orders/${order.orderId}`); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#0d47a1] hover:border-[#0d47a1] hover:bg-blue-50 transition shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {page.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-semibold text-slate-500">
                Hiển thị trang {pageNumber} trên {page.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pageNumber === 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition shadow-sm"
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <button
                  disabled={pageNumber >= page.totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition shadow-sm"
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

