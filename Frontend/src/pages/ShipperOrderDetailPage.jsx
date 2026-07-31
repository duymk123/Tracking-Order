import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { MobileLayout } from "../layouts/MobileLayout.jsx";
import { ArrowLeft, Truck, Box, CheckCircle2, Clock, XCircle, AlertCircle, MapPin, Package, Navigation, PhoneCall, Check, X, RotateCcw } from "lucide-react";

const STATUS_CONFIG = {
  PENDING:   { label: "Chờ lấy hàng", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={16} /> },
  CONFIRMED: { label: "Đã phân công", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={16} /> },
  PICKING:   { label: "Cần lấy hàng", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Box size={16} /> },
  SHIPPING:  { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck size={16} /> },
  DELIVERED: { label: "Đã giao xong", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={16} /> },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={16} /> },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle size={16} /> },
  REATTEMPT: { label: "Cần giao lại", color: "bg-pink-100 text-pink-700 border-pink-200", icon: <Truck size={16} /> },
};

// Hành động có thể thực hiện theo trạng thái hiện tại
const STATUS_ACTIONS = {
  PICKING:   [{ label: "Bắt đầu giao hàng", patch: "shipping", icon: <Truck size={20} />, color: "bg-purple-600 hover:bg-purple-700 text-white" }],
  REATTEMPT: [{ label: "Bắt đầu giao lại", patch: "shipping", icon: <Truck size={20} />, color: "bg-purple-600 hover:bg-purple-700 text-white" }],
  SHIPPING:  [
    { label: "Đã giao hàng thành công", patch: "deliver", icon: <Check size={20} />, color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { label: "Giao hàng thất bại",    patch: "fail",    icon: <X size={20} />, color: "bg-red-600 hover:bg-red-700 text-white mt-3" },
  ],
  FAILED:    [
    { label: "Thử giao lại",     patch: "reattempt", icon: <RotateCcw size={20} />, color: "bg-yellow-600 hover:bg-yellow-700 text-white" },
    { label: "Chuyển hoàn kho", patch: "return",   icon: <Package size={20} />, color: "bg-orange-600 hover:bg-orange-700 text-white mt-3" },
  ],
};

export function ShipperOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  function fetchOrder() {
    setLoading(true);
    apiRequest(`/api/v1/orders/shipper/${orderId}`)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchOrder(); }, [orderId]);

  async function handleAction(patch) {
    if (!window.confirm("Bạn có chắc chắn muốn thực hiện hành động này?")) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/v1/orders/${orderId}/${patch}`, { method: "PATCH" });
      alert("✅ Cập nhật trạng thái thành công!");
      fetchOrder();
    } catch (e) {
      alert("❌ Lỗi: " + e.message);
    } finally {
      setActionLoading(false);
    }
  }

  const actions = STATUS_ACTIONS[order?.status] || [];
  const statusConfig = STATUS_CONFIG[order?.status] || { label: order?.status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Box size={16} /> };

  return (
    <MobileLayout>
      <div className="bg-[#0d47a1] pt-4 pb-20 px-4 sticky top-0 z-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white transition w-fit mb-4">
          <ArrowLeft size={20} /> Quay lại danh sách
        </button>
        <h1 className="text-xl font-black text-white mb-1">Chi tiết đơn hàng</h1>
        <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">#{orderId?.slice(0, 8)}</p>
      </div>

      <div className="-mt-16 px-4 pb-8 relative z-10 space-y-4">
        
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
            <Truck className="animate-bounce mb-4 text-[#0d47a1]" size={40} />
            <p className="font-bold text-slate-600 text-sm">Đang tải thông tin...</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            <p className="font-bold mb-1">Không thể tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && order && (
          <>
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mã vận đơn</p>
                  <p className="font-black text-slate-900">{order.trackingNumber || order.orderId}</p>
                </div>
                <div className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl border-2 font-bold ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span className="text-xs text-center">{statusConfig.label}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cần thu tiền mặt</p>
                  <p className="text-xl font-black text-[#0d47a1]">{Number(order.grandTotal).toLocaleString("vi-VN")}₫</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="mb-4 font-black text-slate-800 text-sm uppercase tracking-wider">Hành động</h2>
                <div className="flex flex-col">
                  {actions.map((a, i) => (
                    <button
                      key={a.patch}
                      onClick={() => handleAction(a.patch)}
                      disabled={actionLoading}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-black shadow-sm transition active:scale-[0.98] disabled:opacity-50 ${a.color}`}
                    >
                      {a.icon}
                      {actionLoading ? "Đang xử lý..." : a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            {order.recipientName && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="mb-4 font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-[#0d47a1]" /> Thông tin người nhận
                </h2>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                  <p className="font-black text-slate-900 text-lg">{order.recipientName}</p>
                  <p className="font-bold text-[#0d47a1] text-lg mb-2">{order.recipientPhone}</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {order.detailAddress}<br/>
                    {order.district}, {order.city && `${order.city}, `}{order.province}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${order.recipientPhone}`} className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 rounded-xl active:bg-emerald-100">
                    <PhoneCall size={18} /> Gọi điện
                  </a>
                  <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl active:bg-blue-100">
                    <Navigation size={18} /> Bản đồ
                  </button>
                </div>
              </div>
            )}

            {/* Tracking log */}
            {order.trackingLogs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="mb-6 font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Truck size={16} className="text-[#0d47a1]" /> Lịch sử giao hàng
                </h2>
                
                <div className="relative pl-6 border-l-2 border-[#e8eeff] space-y-6">
                  {order.trackingLogs.map((log, i) => {
                    const isActive = log.toStatus === order.status;
                    const dateObj = new Date(log.updateAt || log.timestamp || new Date());
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                          isActive ? "bg-[#0d47a1]" : "bg-slate-300"
                        }`} />
                        
                        <div>
                          <p className={`font-bold text-sm ${isActive ? "text-[#0d47a1]" : "text-slate-600"}`}>{log.title}</p>
                          <p className={`text-xs font-medium mt-1 ${isActive ? "text-slate-600" : "text-slate-400"}`}>{log.note}</p>
                          <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 uppercase tracking-wider ${isActive ? "text-[#0d47a1]/70" : "text-slate-400"}`}>
                            <Clock size={10} />
                            {dateObj.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}

