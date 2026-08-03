import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import {
  Package, Eye, Box, Clock, Truck, CheckCircle2, XCircle,
  AlertCircle, Star, Send, Loader2, X, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageForProduct } from "../utils/imageMapper.js";
import { getStoredProfile } from "../services/authStorage.js";

/* ─── constants ─── */
const STATUS_CONFIG = {
  PENDING:   { label: "Chờ xác nhận",  color: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: <Clock size={14} /> },
  CONFIRMED: { label: "Đã xác nhận",   color: "bg-blue-100 text-blue-700 border-blue-200",         icon: <CheckCircle2 size={14} /> },
  PICKING:   { label: "Đang lấy hàng", color: "bg-indigo-100 text-indigo-700 border-indigo-200",   icon: <Box size={14} /> },
  SHIPPING:  { label: "Đang giao",     color: "bg-purple-100 text-purple-700 border-purple-200",    icon: <Truck size={14} /> },
  DELIVERED: { label: "Hoàn tất",      color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  FAILED:    { label: "Giao thất bại", color: "bg-red-100 text-red-700 border-red-200",             icon: <XCircle size={14} /> },
  RETURNING: { label: "Đang hoàn trả", color: "bg-orange-100 text-orange-700 border-orange-200",   icon: <AlertCircle size={14} /> },
  REATTEMPT: { label: "Giao lại",      color: "bg-pink-100 text-pink-700 border-pink-200",          icon: <Truck size={14} /> },
};

const TABS = [
  { id: "ALL",       label: "Tất cả" },
  { id: "PENDING",   label: "Chờ xác nhận" },
  { id: "SHIPPING",  label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
  { id: "FAILED",    label: "Thất bại" },
];

/* ─── StarRating ─── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            size={26}
            fill={(hovered || value) >= s ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= s ? "#f59e0b" : "#d1d5db"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Review Panel (Shopee-style inline) ─── */
function ReviewPanel({ orderId, userId, onClose, onAllReviewed }) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  // per-item form state: { [variantId]: { rating, comment, done, submitting } }
  const [forms, setForms] = useState({});

  useEffect(() => {
    apiRequest(`/api/v1/orders/${orderId}`)
      .then((data) => {
        setItems(data.items || []);
        const initial = {};
        (data.items || []).forEach((item) => {
          initial[item.productVariantId] = { rating: 5, comment: "", done: false, submitting: false };
        });
        setForms(initial);
      })
      .finally(() => setLoadingItems(false));
  }, [orderId]);

  function setField(variantId, key, val) {
    setForms((f) => ({ ...f, [variantId]: { ...f[variantId], [key]: val } }));
  }

  async function submitItem(item) {
    const form = forms[item.productVariantId];
    if (!form.rating) return;
    setField(item.productVariantId, "submitting", true);
    try {
      await apiRequest(`/api/v1/reviews/${userId}`, {
        method: "POST",
        body: JSON.stringify({ productId: item.productId, rating: form.rating, comment: form.comment }),
      });
      setField(item.productVariantId, "done", true);
      // check all done
      const updatedForms = { ...forms, [item.productVariantId]: { ...form, done: true } };
      if (Object.values(updatedForms).every((f) => f.done)) {
        setTimeout(() => onAllReviewed(orderId), 600);
      }
    } catch (ex) {
      alert("Lỗi: " + (ex.message || "Gửi thất bại"));
    } finally {
      setField(item.productVariantId, "submitting", false);
    }
  }

  const allDone = items.length > 0 && Object.values(forms).every((f) => f.done);

  return (
    <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500" fill="#f59e0b" />
          <span className="font-black text-slate-800 text-sm">Đánh giá sản phẩm</span>
          <span className="text-xs font-semibold text-slate-500">· Chia sẻ trải nghiệm của bạn</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-slate-700 transition">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {loadingItems ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : allDone ? (
          <div className="text-center py-6 text-emerald-600 font-black flex flex-col items-center gap-2">
            <CheckCircle2 size={36} />
            <p>Cảm ơn bạn đã đánh giá! 🎉</p>
          </div>
        ) : (
          items.map((item) => {
            const form = forms[item.productVariantId] || {};
            if (form.done) {
              return (
                <div key={item.productVariantId} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img src={getImageForProduct(item.productName)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm flex-1 truncate">{item.productName}</p>
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-black bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Đã đánh giá
                  </span>
                </div>
              );
            }
            return (
              <div key={item.productVariantId} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                {/* Product row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img src={getImageForProduct(item.productName)} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{item.productName}</p>
                    {item.variantName && <p className="text-xs text-slate-500 font-semibold">Loại: {item.variantName}</p>}
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mức độ hài lòng</p>
                  <div className="flex items-center gap-3">
                    <StarRating value={form.rating} onChange={(v) => setField(item.productVariantId, "rating", v)} />
                    <span className="text-sm font-black text-amber-500">
                      {["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"][form.rating || 0]}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <textarea
                  value={form.comment}
                  onChange={(e) => setField(item.productVariantId, "comment", e.target.value)}
                  placeholder="Nhận xét về sản phẩm..."
                  rows={2}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-400 focus:bg-white resize-none transition mb-3"
                />

                {/* Submit */}
                <button
                  onClick={() => submitItem(item)}
                  disabled={form.submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition shadow-sm shadow-amber-200 disabled:opacity-50"
                >
                  {form.submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {form.submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  // which orderId has its review panel open
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  // set of orderIds that have been fully reviewed (hide button)
  const [fullyReviewed, setFullyReviewed] = useState(new Set());
  const navigate = useNavigate();

  // get userId lazily (fetch /me once)
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    apiRequest("/api/v1/users/me").then((data) => setUserId(data.id)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiRequest("/api/v1/orders/my-orders")
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter(
          (order) =>
            order.status === activeTab ||
            (activeTab === "SHIPPING" && ["PICKING", "SHIPPING", "REATTEMPT"].includes(order.status)) ||
            (activeTab === "PENDING" && order.status === "CONFIRMED")
        );

  function toggleReview(orderId) {
    setReviewingOrderId((prev) => (prev === orderId ? null : orderId));
  }

  function handleAllReviewed(orderId) {
    setFullyReviewed((prev) => new Set([...prev, orderId]));
    setReviewingOrderId(null);
  }

  return (
    <StorefrontLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Đơn hàng của tôi</h1>
        <p className="text-slate-500 font-medium">Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 mb-6 pb-[1px]">
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
            const statusConfig = STATUS_CONFIG[order.status] || {
              label: order.status,
              color: "bg-slate-100 text-slate-600 border-slate-200",
              icon: <Box size={14} />,
            };
            const isDelivered = order.status === "DELIVERED";
            const isReviewOpen = reviewingOrderId === order.orderId;
            const isDone = fullyReviewed.has(order.orderId);

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  isReviewOpen
                    ? "border-amber-300 shadow-amber-100"
                    : "border-slate-200 hover:shadow-md hover:border-[#0d47a1]/30"
                }`}
              >
                <div className="p-6">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0d47a1] flex items-center justify-center shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg uppercase">#{order.orderId?.slice(0, 8)}</p>
                        <p className="text-sm font-medium text-slate-500">
                          Đặt ngày {new Date(order.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold self-start sm:self-center ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Footer row */}
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

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* ── Shopee-style Review button ── */}
                      {isDelivered && !isDone && (
                        <button
                          onClick={() => toggleReview(order.orderId)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-black transition-all shadow-sm ${
                            isReviewOpen
                              ? "bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600"
                              : "bg-amber-50 text-amber-600 border border-amber-300 hover:bg-amber-100"
                          }`}
                        >
                          <Star size={15} fill={isReviewOpen ? "white" : "#f59e0b"} stroke={isReviewOpen ? "white" : "#f59e0b"} />
                          {isReviewOpen ? "Đóng đánh giá" : "Đánh giá"}
                        </button>
                      )}

                      {isDone && (
                        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-200">
                          <CheckCircle2 size={15} /> Đã đánh giá
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-[#f8f9fc] hover:border-[#0d47a1] hover:text-[#0d47a1] transition"
                      >
                        <Eye size={16} /> Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Inline Review Panel ── */}
                {isReviewOpen && userId && (
                  <div className="px-6 pb-6">
                    <ReviewPanel
                      orderId={order.orderId}
                      userId={userId}
                      onClose={() => setReviewingOrderId(null)}
                      onAllReviewed={handleAllReviewed}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StorefrontLayout>
  );
}
