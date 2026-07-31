import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { CheckCircle2, RotateCcw, XCircle, Search, Filter, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  APPROVED: { label: "Đã chấp nhận", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" },
};

export function ReturnsManagementPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  function fetchReturns() {
    setLoading(true);
    apiRequest("/api/v1/returns")
      .then(setReturns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReturns();
  }, []);

  async function handleUpdateStatus(returnId, status) {
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái thành ${status}?`)) return;
    
    setActionLoading(true);
    try {
      await apiRequest(`/api/v1/returns/${returnId}/status?status=${status}`, { method: "PUT" });
      fetchReturns();
    } catch (e) {
      alert("Lỗi: " + e.message);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredReturns = returns.filter(ret => {
    const matchesTab = activeTab === "ALL" || ret.status === activeTab;
    const matchesSearch = ret.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ret.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Yêu cầu trả hàng</h1>
          <p className="text-slate-500 font-medium">Quản lý các yêu cầu hoàn trả từ khách hàng</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Tìm mã đơn, lý do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0d47a1] focus:ring-1 focus:ring-[#0d47a1] w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-6 pb-[1px]">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? "border-[#0d47a1] text-[#0d47a1]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "ALL" ? "Tất cả" : STATUS_CONFIG[tab]?.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-[#0d47a1]">
          <RotateCcw className="animate-spin mb-4" size={40} />
          <p className="font-bold text-slate-600">Đang tải danh sách...</p>
        </div>
      )}
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm mb-6">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredReturns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <RotateCcw size={48} className="mb-4 opacity-30 text-slate-400" strokeWidth={1} />
              <p className="font-bold text-slate-600">Không có yêu cầu trả hàng nào.</p>
            </div>
          ) : (
            filteredReturns.map((ret) => {
              const statusConfig = STATUS_CONFIG[ret.status] || { label: ret.status, color: "bg-slate-100 text-slate-600 border-slate-200" };
              
              return (
                <div key={ret.returnId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-md border text-xs font-bold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          Ngày tạo: {new Date(ret.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mã đơn hàng</p>
                          <button 
                            onClick={() => navigate(`/seller/orders/${ret.orderId}`)}
                            className="font-black text-[#0d47a1] hover:underline"
                          >
                            #{ret.orderId?.slice(0, 8)}...
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lý do trả hàng</p>
                          <p className="font-medium text-slate-800">{ret.reason}</p>
                        </div>
                      </div>
                    </div>
                    
                    {ret.status === "PENDING" && (
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(ret.returnId, "APPROVED")}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} />
                          Chấp nhận
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(ret.returnId, "REJECTED")}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </AdminLayout>
  );
}
