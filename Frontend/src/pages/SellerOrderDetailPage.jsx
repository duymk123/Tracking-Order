import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { ArrowLeft, Box, CheckCircle2, ChevronRight, Clock, MapPin, Package, Truck, XCircle, AlertCircle, CheckCircle, X } from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

const STATUS_CONFIG = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={16} /> },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={16} /> },
  PICKING:   { label: "Đang lấy hàng", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Box size={16} /> },
  SHIPPING:  { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck size={16} /> },
  DELIVERED: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={16} /> },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={16} /> },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle size={16} /> },
  REATTEMPT: { label: "Giao lại", color: "bg-pink-100 text-pink-700 border-pink-200", icon: <Truck size={16} /> },
};

const STATUS_ACTIONS = {
  PENDING:   [{ label: "Xác nhận đơn hàng", patch: "comfirm", icon: <CheckCircle size={18} />, color: "bg-[#1565c0] hover:bg-[#0d47a1] text-white" }],
  CONFIRMED: [{ label: "Tiến hành lấy hàng", patch: "picking", icon: <Box size={18} />, color: "bg-indigo-600 hover:bg-indigo-700 text-white" }],
  PICKING:   [{ label: "Giao cho Shipper", patch: null, icon: <Truck size={18} />, color: "bg-purple-600 hover:bg-purple-700 text-white", modal: "assign" }],
};

export function SellerOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Assign Modal States
  const [showModal, setShowModal] = useState(false);
  const [carriers, setCarriers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [selectedShipper, setSelectedShipper] = useState("");

  function fetchOrder() {
    setLoading(true);
    Promise.all([
      apiRequest(`/api/v1/orders/seller/${orderId}`),
      apiRequest(`/api/v1/orders/${orderId}/tracking`).catch(() => []),
    ])
      .then(([orderData, trackingData]) => {
        setOrder(orderData);
        setTracking(trackingData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchOrder(); }, [orderId]);

  async function handleAction(patch, modal) {
    if (modal === "assign") {
      setShowModal(true);
      fetchCarriers();
      return;
    }
    
    if (!patch) return;
    setActionLoading(true);
    setActionMsg("");
    try {
      await apiRequest(`/api/v1/orders/${orderId}/${patch}`, { method: "PATCH" });
      setActionMsg("✅ Cập nhật trạng thái thành công!");
      fetchOrder();
    } catch (e) {
      setActionMsg("❌ Lỗi: " + e.message);
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  // --- Assign Modal Logic ---
  async function fetchCarriers() {
    try {
      const data = await apiRequest("/api/v1/carriers");
      setCarriers(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCarrierSelect(carrierId) {
    setSelectedCarrier(carrierId);
    setSelectedShipper("");
    try {
      const data = await apiRequest(`/api/v1/carriers/${carrierId}/shippers`);
      setShippers(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function submitAssign() {
    if (!selectedCarrier || !selectedShipper) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/v1/orders/${orderId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ carrierId: selectedCarrier, shipperId: selectedShipper })
      });
      setActionMsg("✅ Đã phân công Shipper thành công!");
      setShowModal(false);
      fetchOrder();
    } catch (e) {
      alert("❌ Lỗi: " + e.message);
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  const actions = STATUS_ACTIONS[order?.status] || [];
  const statusConfig = STATUS_CONFIG[order?.status] || { label: order?.status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Box size={16} /> };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center text-sm font-semibold text-slate-500">
        <button onClick={() => navigate("/seller/orders")} className="hover:text-[#0d47a1] transition">Quản lý Đơn hàng</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-slate-900">Chi tiết đơn hàng #{orderId?.slice(0, 8)}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0d47a1] transition bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm w-fit"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((a) => (
              <button
                key={a.patch || a.modal}
                onClick={() => handleAction(a.patch, a.modal)}
                disabled={actionLoading}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-50 ${a.color}`}
              >
                {a.icon}
                {actionLoading && !a.modal ? "Đang xử lý..." : a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {actionMsg && (
        <div className={`mb-6 p-4 rounded-xl border font-bold text-sm flex items-center shadow-sm ${actionMsg.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {actionMsg}
        </div>
      )}

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-[#0d47a1]">
          <Box className="animate-bounce mb-4" size={40} />
          <p className="font-bold text-slate-600">Đang tải chi tiết đơn hàng...</p>
        </div>
      )}
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && order && (
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase">Đơn hàng #{order.orderId?.slice(0, 8)}</h1>
                  <p className="text-sm font-semibold text-slate-500">
                    Người mua: <span className="text-slate-800">{order.buyerUsername}</span>
                  </p>
                  <p className="text-sm font-medium text-slate-400 mt-1">
                    Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                
                <div className={`flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 font-bold ${statusConfig.color} w-full md:w-auto`}>
                  {statusConfig.icon}
                  <span className="text-sm">{statusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Address Card */}
            {order.recipientName && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-black text-slate-800 flex items-center gap-2">
                    <MapPin size={18} className="text-[#0d47a1]" /> 
                    Thông tin giao hàng
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Người nhận</p>
                      <p className="font-bold text-slate-900">{order.recipientName}</p>
                      <p className="font-semibold text-slate-600 mt-1">{order.recipientPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ</p>
                      <p className="font-medium text-slate-700 leading-relaxed">
                        {order.detailAddress}<br/>
                        {order.district}, {order.city && `${order.city}, `}{order.province}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-black text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-[#0d47a1]" /> 
                  Chi tiết sản phẩm ({order.totalItems})
                </h2>
              </div>
              
              <div className="divide-y divide-slate-100">
                {order.items?.map((item, i) => (
                  <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                      <img src={getImageForProduct(item.productName)} alt={item.productName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-1">{item.productName}</p>
                      <p className="text-xs font-semibold text-slate-500 uppercase">{item.variantName}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Đơn giá</p>
                        <p className="font-bold text-slate-700">{Number(item.unitPrice).toLocaleString("vi-VN")}₫</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">SL</p>
                        <p className="font-bold text-slate-700">x{item.quantity}</p>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Thành tiền</p>
                        <p className="font-black text-[#0d47a1]">
                          {Number(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Summary & Tracking */}
          <div className="space-y-6">
            
            {/* Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Thanh toán</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Tạm tính</span>
                  <span className="font-bold text-slate-900">{Number(order.subtotal || 0).toLocaleString("vi-VN")}₫</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-emerald-600">Giảm giá</span>
                    <span className="font-bold text-emerald-600">-{Number(order.discountAmount || 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Phí vận chuyển</span>
                  <span className="font-bold text-slate-900">{Number(order.shippingFee || 0).toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-[#0d47a1]">{Number(order.grandTotal).toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>

            {/* Tracking Card */}
            {tracking.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-black text-slate-800 flex items-center gap-2">
                    <Truck size={18} className="text-[#0d47a1]" /> 
                    Lịch sử trạng thái
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="relative pl-6 border-l-2 border-[#e8eeff] space-y-8">
                    {tracking.map((log, i) => {
                      const isActive = log.toStatus === order.status;
                      const dateObj = new Date(log.updateAt || log.timestamp || new Date());
                      return (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                            isActive ? "bg-[#0d47a1]" : "bg-slate-300"
                          }`} />
                          
                          <div>
                            <p className={`font-bold ${isActive ? "text-[#0d47a1]" : "text-slate-600"}`}>{log.title}</p>
                            <p className={`text-sm font-medium mt-1 ${isActive ? "text-slate-600" : "text-slate-400"}`}>{log.note}</p>
                            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${isActive ? "text-[#0d47a1]/70" : "text-slate-400"}`}>
                              <Clock size={12} />
                              {dateObj.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
          
        </div>
      )}

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Phân công Giao hàng</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Carrier Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Đơn vị vận chuyển</label>
                <select 
                  value={selectedCarrier}
                  onChange={(e) => handleCarrierSelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]/20 focus:border-[#0d47a1]"
                >
                  <option value="">-- Chọn đơn vị vận chuyển --</option>
                  {carriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Shipper Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nhân viên giao hàng (Shipper)</label>
                <select 
                  value={selectedShipper}
                  onChange={(e) => setSelectedShipper(e.target.value)}
                  disabled={!selectedCarrier || shippers.length === 0}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]/20 focus:border-[#0d47a1] disabled:opacity-50"
                >
                  <option value="">
                    {!selectedCarrier ? "-- Chọn đơn vị vận chuyển trước --" : 
                     shippers.length === 0 ? "-- Không có shipper nào --" : "-- Chọn Shipper --"}
                  </option>
                  {shippers.map(s => (
                    <option key={s.id} value={s.id}>{s.username} ({s.phone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button 
                onClick={submitAssign}
                disabled={!selectedCarrier || !selectedShipper || actionLoading}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0d47a1] hover:bg-[#09389a] transition disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận Phân công"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}


