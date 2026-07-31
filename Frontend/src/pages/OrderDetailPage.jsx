import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import { ArrowLeft, Box, CheckCircle2, ChevronRight, MapPin, Package, Truck, XCircle, AlertCircle, HelpCircle, CreditCard, ShoppingCart, FileText } from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

const getLogIcon = (status) => {
  switch (status) {
    case 'PENDING': return <ShoppingCart size={10} />;
    case 'CONFIRMED': return <FileText size={10} />;
    case 'PICKING': return <Package size={10} />;
    case 'SHIPPING': return <Truck size={10} />;
    case 'DELIVERED': return <CheckCircle2 size={10} />;
    case 'FAILED': return <XCircle size={10} />;
    case 'RETURNING': return <AlertCircle size={10} />;
    default: return <CheckCircle2 size={10} />;
  }
};

const STATUS_CONFIG = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-slate-200 text-slate-700" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  PICKING:   { label: "Đang lấy hàng", color: "bg-indigo-100 text-indigo-700" },
  SHIPPING:  { label: "SHIPPING", color: "bg-[#d4e1ff] text-[#0d47a1]" },
  DELIVERED: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700" },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700" },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700" },
  REATTEMPT: { label: "Giao lại", color: "bg-pink-100 text-pink-700" },
};

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/v1/orders/${orderId}`),
      apiRequest(`/api/v1/orders/${orderId}/tracking`),
    ])
      .then(([orderData, trackingData]) => {
        setOrder(orderData);
        // Assuming tracking is ordered by latest first or we sort it here
        setTracking(trackingData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Mock estimated delivery date calculation (+3 days from creation)
  const estDeliveryDate = order ? new Date(new Date(order.createdAt).getTime() + (3 * 24 * 60 * 60 * 1000)) : new Date();
  
  return (
    <StorefrontLayout>
      <div className="mb-6 flex items-center text-sm font-semibold text-slate-500">
        <button onClick={() => navigate("/orders")} className="hover:text-[#0d47a1] transition">Đơn hàng của tôi</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-slate-900">Chi tiết đơn hàng #{orderId?.slice(0, 8).toUpperCase()}</span>
      </div>



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
        <div className="max-w-6xl mx-auto">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center text-slate-500 hover:text-[#153d8a] hover:bg-slate-100 transition w-10 h-10 rounded-full border border-slate-200 shadow-sm bg-white shrink-0 mt-2"
                title="Quay lại"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">TRACKING ID</p>
                <h1 className="text-3xl md:text-4xl font-black text-[#153d8a] tracking-tight leading-none">ORD-{order.orderId?.slice(0, 8).toUpperCase()}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {STATUS_CONFIG[order.status] && (
                <div className={`px-4 py-2 rounded-full font-black text-sm uppercase tracking-wider ${STATUS_CONFIG[order.status].color}`}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {STATUS_CONFIG[order.status].label}
                  </span>
                </div>
              )}
              <button className="flex items-center gap-2 font-bold text-[#153d8a] hover:text-[#0d47a1] transition">
                <HelpCircle size={18} />
                Support
              </button>
            </div>
          </div>

          {/* Blue Hero Card */}
          <div className="bg-[#1e3a8a] text-white rounded-2xl p-5 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-center shadow-lg relative overflow-hidden">
            <div className="z-10 w-full md:w-auto mb-4 md:mb-0">
              <p className="text-blue-200 font-bold text-xs tracking-wider uppercase mb-1.5">ESTIMATED DELIVERY</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                {estDeliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-2 text-blue-100 font-medium text-sm">
                <Truck size={16} />
                <span>Giao hàng tiêu chuẩn (Standard Express Delivery)</span>
              </div>
            </div>
            
            <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-3xl font-black leading-none mb-1">02</span>
              <span className="text-[10px] font-bold text-blue-200 tracking-wider uppercase">DAYS REMAINING</span>
            </div>
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100 h-full">
                <h2 className="text-xl font-black text-[#153d8a] mb-8">Hành trình đơn hàng</h2>
                
                <div className="relative pl-6">
                  {/* Dotted line background */}
                  <div className="absolute left-2 top-2 bottom-2 border-l-2 border-dashed border-slate-300"></div>
                  
                  {tracking.length === 0 ? (
                    <div className="text-slate-500 font-medium italic text-sm">Chưa có thông tin hành trình.</div>
                  ) : (
                    <div className="space-y-8">
                      {tracking.map((log, i) => {
                        const isActive = log.toStatus === order.status;
                        const dateObj = new Date(log.updateAt || log.timestamp || new Date());
                        
                        return (
                          <div key={i} className="relative">
                            {/* Dot */}
                            <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-[#f8fafc] flex items-center justify-center shadow-sm z-10 ${
                              isActive ? "bg-[#153d8a] text-white" : "bg-slate-200 text-white"
                            }`}>
                              {getLogIcon(log.toStatus)}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div className="pr-4">
                                <h3 className={`text-base font-black ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                                  {log.title}
                                </h3>
                                <p className={`text-sm font-medium mt-1 mb-2 leading-relaxed ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                                  {log.note || (log.toStatus === 'PENDING' ? 'Digital order confirmed and payment verified.' : 'All items collected and quality checked for shipment.')}
                                </p>
                                {isActive && (
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/50 text-[9px] font-black text-[#153d8a] tracking-wider uppercase">
                                    &#9827; ACTOR: {log.updatedBy || 'SYSTEM'}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <p className={`font-bold text-xs ${isActive ? "text-slate-700" : "text-slate-400"}`}>
                                  {i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  , {dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Details */}
            <div className="space-y-5">
              
              {/* Purchased Items Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[#eef2ff] px-5 py-3">
                  <h3 className="font-black text-sm text-[#153d8a]">Purchased Items ({order.totalItems})</h3>
                </div>
                
                <div className="p-5">
                  <div className="space-y-5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                            <img src={getImageForProduct(item.productName)} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                          {/* Quantity Badge */}
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#153d8a] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow border-[1.5px] border-white">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{item.productName}</p>
                          <p className="text-[11px] text-slate-500 font-medium mb-1">
                            {item.variantName && `Loại: ${item.variantName} | `}SKU: {item.productId?.slice(0,6) || "N/A"}
                          </p>
                          <p className="font-black text-[#153d8a] text-sm">
                            ${Number(item.unitPrice).toLocaleString("en-US")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-600 text-sm">Total Amount</span>
                  <span className="text-lg font-black text-[#153d8a]">${Number(order.grandTotal).toLocaleString("en-US")}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="font-black text-slate-600 flex items-center gap-2 mb-3 text-[10px] tracking-widest uppercase">
                  <MapPin size={14} className="text-[#153d8a]" />
                  SHIPPING ADDRESS
                </h3>
                <div>
                  <p className="font-bold text-slate-900 text-base mb-1">{order.receiverName}</p>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    {order.detailAddress}<br/>
                    {order.ward}, {order.district}, {order.province}<br/>
                    Vietnam
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="font-black text-slate-600 flex items-center gap-2 mb-3 text-[10px] tracking-widest uppercase">
                  <CreditCard size={14} className="text-[#153d8a]" />
                  PAYMENT METHOD
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 text-base mb-1">{order.paymentType === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Online Banking (Visa)"}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {order.paymentType === "COD" ? "Chưa thanh toán" : "Ending in •••• 4492"}
                    </p>
                  </div>
                  {order.paymentType !== "COD" && (
                    <div className="px-2.5 py-1 bg-emerald-700 text-white text-[9px] font-black tracking-widest rounded shadow-sm">
                      PAID
                    </div>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
                <img src="/images/map_placeholder.png" alt="Map" className="w-full h-40 object-cover opacity-90" />
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-lg p-2.5 shadow-md border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">CURRENT LOCATION</p>
                  <p className="font-bold text-[#153d8a] text-xs">North Hub Distribution Center</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
