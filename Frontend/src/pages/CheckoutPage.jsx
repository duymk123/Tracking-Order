import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import {
  MapPin,
  Plus,
  CheckCircle2,
  CreditCard,
  Truck,
  Tag,
  Package,
  ChevronRight,
  X,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Star,
} from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

/* ─────────────── helpers ─────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

/* ─────────────── Sub-components ─────────────── */
function AddressCard({ addr, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all ${
        selected
          ? "border-[#1565c0] bg-blue-50/60 shadow-md shadow-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 bg-[#1565c0] text-white rounded-full p-0.5">
          <CheckCircle2 size={14} />
        </span>
      )}
      <div className="flex items-start gap-3">
        <MapPin
          size={18}
          className={`mt-0.5 shrink-0 ${selected ? "text-[#1565c0]" : "text-slate-400"}`}
        />
        <div className="min-w-0">
          <p className="font-black text-slate-900 text-sm">
            {addr.name}
            {addr.isDefault && (
              <span className="ml-2 text-[10px] font-black text-[#1565c0] bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mặc định
              </span>
            )}
          </p>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">{addr.phone}</p>
          <p className="text-sm text-slate-600 mt-1 leading-snug">
            {addr.detailAddress}, {addr.district}, {addr.city}, {addr.province}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddressModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detailAddress: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handle = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const saved = await apiRequest("/api/v1/users/me/addresses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onSaved(saved);
    } catch (ex) {
      setErr(ex.message || "Không thể lưu địa chỉ.");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: "name", label: "Họ tên người nhận", placeholder: "Nguyễn Văn A" },
    { key: "phone", label: "Số điện thoại", placeholder: "0901234567" },
    { key: "province", label: "Tỉnh / Thành phố", placeholder: "Hà Nội" },
    { key: "city", label: "Quận / Huyện", placeholder: "Hoàng Mai" },
    { key: "district", label: "Phường / Xã", placeholder: "Linh Đàm" },
    { key: "detailAddress", label: "Địa chỉ chi tiết", placeholder: "Số 12, Ngõ 22, ..." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 pt-6 pb-4 rounded-t-3xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Thêm địa chỉ mới</h3>
            <p className="text-sm text-slate-500 font-semibold mt-0.5">Điền đầy đủ thông tin nhận hàng</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={handle(key)}
                placeholder={placeholder}
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#1565c0] focus:bg-white transition"
              />
            </div>
          ))}

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                form.isDefault ? "bg-[#1565c0] border-[#1565c0]" : "border-slate-300 bg-white"
              }`}
              onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
            >
              {form.isDefault && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className="text-sm font-bold text-slate-700">Đặt làm địa chỉ mặc định</span>
          </label>

          {err && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm font-semibold">
              <AlertCircle size={16} /> {err}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-[#1565c0] text-white font-black hover:bg-[#0d47a1] transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {saving ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State passed from cart or buy-now
  // location.state = { items: [{productVariantId, quantity}], isBuyNow?: boolean, productName?: string }
  const stateItems = location.state?.items || [];
  const isBuyNow = location.state?.isBuyNow || false;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [paymentType, setPaymentType] = useState("COD");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryErr, setSummaryErr] = useState("");
  const [addrLoading, setAddrLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeErr, setPlaceErr] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponErr, setCouponErr] = useState("");

  // Guard: if no items, redirect
  useEffect(() => {
    if (stateItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, []);

  // Load addresses
  useEffect(() => {
    setAddrLoading(true);
    apiRequest("/api/v1/users/me/addresses")
      .then((data) => {
        setAddresses(data || []);
        const def = data?.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (data?.length) setSelectedAddressId(data[0].id);
      })
      .catch((e) => console.error(e))
      .finally(() => setAddrLoading(false));
  }, []);

  // Fetch order summary whenever items or coupon change
  useEffect(() => {
    if (stateItems.length === 0) return;
    setSummaryLoading(true);
    setSummaryErr("");
    apiRequest("/api/v1/orders/summary", {
      method: "POST",
      body: JSON.stringify({
        items: stateItems,
        couponCode: appliedCoupon || undefined,
      }),
    })
      .then(setSummary)
      .catch((e) => setSummaryErr(e.message || "Không thể tính tổng đơn"))
      .finally(() => setSummaryLoading(false));
  }, [appliedCoupon]);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponErr("");
    try {
      await apiRequest("/api/v1/orders/summary", {
        method: "POST",
        body: JSON.stringify({ items: stateItems, couponCode: couponCode.trim() }),
      });
      setAppliedCoupon(couponCode.trim());
    } catch (e) {
      setCouponErr(e.message || "Mã giảm giá không hợp lệ");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setAppliedCoupon("");
    setCouponErr("");
  }

  async function placeOrder() {
    if (!selectedAddressId) {
      setPlaceErr("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }
    setPlacing(true);
    setPlaceErr("");
    try {
      const res = await apiRequest("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify({
          items: stateItems,
          addressId: selectedAddressId,
          couponCode: appliedCoupon || undefined,
          paymentType,
        }),
      });
      navigate(`/orders/${res.orderId}`, {
        replace: true,
        state: { justOrdered: true, trackingNumber: res.trackingNumber },
      });
    } catch (e) {
      setPlaceErr(e.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setPlacing(false);
    }
  }

  function onAddressSaved(saved) {
    setAddresses((prev) => [...prev, saved]);
    setSelectedAddressId(saved.id);
    setShowAddModal(false);
  }

  const paymentOptions = [
    {
      key: "COD",
      icon: <Truck size={22} className="text-amber-500" />,
      label: "Thanh toán khi nhận hàng",
      desc: "Trả tiền mặt khi shipper giao hàng",
    },
    {
      key: "ONLINE",
      icon: <CreditCard size={22} className="text-emerald-500" />,
      label: "Thanh toán online",
      desc: "Chuyển khoản / Ví điện tử",
    },
  ];

  return (
    <StorefrontLayout>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm font-semibold text-slate-500">
        <button
          onClick={() => navigate(isBuyNow ? -1 : "/cart")}
          className="flex items-center gap-1.5 hover:text-[#1565c0] transition"
        >
          <ArrowLeft size={14} /> {isBuyNow ? "Quay lại" : "Giỏ hàng"}
        </button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-slate-900 font-black">Thanh toán</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* ── Section 1: Delivery Address ── */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin size={16} className="text-[#1565c0]" />
                </div>
                <h2 className="text-base font-black text-slate-900">Địa chỉ giao hàng</h2>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 text-xs font-black text-[#1565c0] hover:text-[#0d47a1] bg-blue-50 hover:bg-blue-100 transition px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Thêm địa chỉ
              </button>
            </div>

            <div className="p-6">
              {addrLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10">
                  <MapPin size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-sm">Chưa có địa chỉ nào.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#1565c0] text-white text-sm font-black hover:bg-[#0d47a1] transition"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      addr={addr}
                      selected={selectedAddressId === addr.id}
                      onSelect={() => setSelectedAddressId(addr.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section 2: Payment Method ── */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CreditCard size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-base font-black text-slate-900">Phương thức thanh toán</h2>
            </div>

            <div className="p-6 space-y-3">
              {paymentOptions.map(({ key, icon, label, desc }) => (
                <div
                  key={key}
                  onClick={() => setPaymentType(key)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentType === key
                      ? "border-[#1565c0] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentType === key ? "border-[#1565c0] bg-[#1565c0]" : "border-slate-300"
                    }`}
                  >
                    {paymentType === key && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: Coupon ── */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Tag size={16} className="text-amber-600" />
              </div>
              <h2 className="text-base font-black text-slate-900">Mã giảm giá</h2>
            </div>

            <div className="p-6">
              {appliedCoupon ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-black text-emerald-700 text-sm">
                      Mã <span className="font-black tracking-wider">{appliedCoupon}</span> đã được áp dụng!
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      Giảm: {fmt(summary?.discountAmount || 0)}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-3">
                    <input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponErr(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Nhập mã giảm giá..."
                      className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#1565c0] focus:bg-white transition"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-3 rounded-xl bg-[#1565c0] text-white text-sm font-black hover:bg-[#0d47a1] transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {couponLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                      Áp dụng
                    </button>
                  </div>
                  {couponErr && (
                    <p className="text-red-500 text-xs font-semibold mt-2 flex items-center gap-1.5">
                      <AlertCircle size={12} /> {couponErr}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN: Order Summary ── */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <ShoppingBag size={16} className="text-purple-600" />
              </div>
              <h2 className="text-base font-black text-slate-900">Tóm tắt đơn hàng</h2>
              <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {stateItems.length} sản phẩm
              </span>
            </div>

            {/* Items */}
            <div className="px-6 py-4 space-y-3 max-h-56 overflow-y-auto border-b border-slate-100">
              {stateItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <Package size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate">
                      Variant: {item.productVariantId.slice(0, 8)}...
                    </p>
                    <p className="text-xs font-semibold text-slate-400">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-slate-500">×{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="px-6 py-5 space-y-3">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-4 text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : summaryErr ? (
                <div className="text-red-500 text-sm font-semibold text-center py-2">
                  <AlertCircle size={16} className="inline mr-1" />
                  {summaryErr}
                </div>
              ) : summary ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-500">Tạm tính</span>
                    <span className="font-black text-slate-900">{fmt(summary.subtotal)}</span>
                  </div>
                  {Number(summary.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-emerald-600">Giảm giá</span>
                      <span className="font-black text-emerald-600">-{fmt(summary.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-500">Phí vận chuyển</span>
                    <span className="font-black text-slate-900">{fmt(summary.shippingFee)}</span>
                  </div>

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-[#1565c0]">{fmt(summary.grandTotal)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Place order */}
            <div className="px-6 pb-6">
              {placeErr && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm font-semibold mb-4">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {placeErr}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={placing || !selectedAddressId || addrLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1565c0] to-[#1a75d1] text-white font-black text-base hover:from-[#0d47a1] hover:to-[#1565c0] shadow-lg shadow-blue-900/25 transition disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
              >
                {placing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang đặt hàng...
                  </>
                ) : (
                  <>
                    <Star size={18} className="group-hover:rotate-12 transition-transform" />
                    Đặt hàng ngay
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 font-semibold mt-3">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <span className="text-[#1565c0] cursor-pointer hover:underline">Điều khoản dịch vụ</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddModal && <AddressModal onClose={() => setShowAddModal(false)} onSaved={onAddressSaved} />}
    </StorefrontLayout>
  );
}
