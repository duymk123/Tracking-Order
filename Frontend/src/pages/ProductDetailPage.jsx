import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import { ArrowLeft, Box, CheckCircle2, ChevronRight, Package, ShoppingCart, Star, StarHalf, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [actionMsg, setActionMsg] = useState("");
  const [activeTab, setActiveTab] = useState("description"); // description or reviews
  const [isBuyNowActive, setIsBuyNowActive] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/v1/products/${productId}`),
      apiRequest(`/api/v1/reviews/product/${productId}`).catch(() => []), // If reviews fail, just empty array
      apiRequest("/api/v1/features/buy-now").catch(() => ({ active: false }))
    ])
      .then(([productData, reviewsData, featureData]) => {
        setProduct(productData);
        setReviews(reviewsData);
        if (productData.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        setIsBuyNowActive(featureData?.active || false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAddToCart() {
    if (!selectedVariant) return;
    try {
      await apiRequest("/api/v1/cart/items", {
        method: "POST",
        body: JSON.stringify({ productVariantId: selectedVariant.id, quantity: 1 }),
      });
      setActionMsg("✅ Đã thêm vào giỏ hàng!");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (e) {
      setActionMsg("❌ " + e.message);
    }
  }

  async function handleBuyNow() {
    if (!selectedVariant) return;
    try {
      await apiRequest("/api/v1/orders/buy-now", {
        method: "POST",
        body: JSON.stringify({ productVariantId: selectedVariant.id, quantity }),
      });
      navigate("/checkout", {
        state: {
          items: [{ productVariantId: selectedVariant.id, quantity }],
          isBuyNow: true,
        },
      });
    } catch (e) {
      setActionMsg("❌ " + e.message);
    }
  }

  const unitPrice = product
    ? Number(product.basePrice) + Number(selectedVariant?.priceModifier || 0)
    : 0;

  return (
    <StorefrontLayout>
      <div className="mb-6 flex items-center text-sm font-semibold text-slate-500">
        <button onClick={() => navigate("/products")} className="hover:text-[#0d47a1] transition">Sản phẩm</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-slate-900 line-clamp-1">{product?.productName || "Chi tiết"}</span>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Box className="animate-bounce mb-4 text-[#0d47a1]" size={40} />
          <p className="font-bold">Đang tải chi tiết sản phẩm...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && product && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            
            {/* Left - Image Gallery */}
            <div className="p-8 lg:border-r border-slate-200 bg-slate-50 flex flex-col">
              <div className="aspect-square bg-white rounded-xl border border-slate-200 flex items-center justify-center relative shadow-sm overflow-hidden">
                <img src={getImageForProduct(product.productName)} alt={product.productName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${
                    product.quantityInStock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                  }`}>
                    {product.quantityInStock > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`aspect-square rounded-lg border-2 flex items-center justify-center bg-white cursor-pointer overflow-hidden ${i === 1 ? "border-[#0d47a1]" : "border-slate-200 opacity-60 hover:opacity-100"}`}>
                    <img src={getImageForProduct(product.productName)} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="p-8 lg:p-10 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0d47a1] mb-2">{product.categoryName}</span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">{product.productName}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <StarHalf size={16} fill="currentColor" />
                </div>
                <span className="text-sm font-semibold text-slate-500">{reviews.length} đánh giá</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-sm font-semibold text-slate-500">Đã bán 1.2k</span>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-black text-[#0d47a1]">
                  {(unitPrice).toLocaleString("vi-VN")}₫
                </p>
                {selectedVariant?.priceModifier > 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    Giá gốc: {Number(product.basePrice).toLocaleString("vi-VN")}₫ + Phụ phí phân loại
                  </p>
                )}
              </div>

              <div className="w-full h-px bg-slate-200 mb-8"></div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-sm font-bold text-slate-900">Phân loại</p>
                    <p className="text-xs font-semibold text-slate-500">Tồn kho: <span className="text-slate-800">{selectedVariant?.quantityInStock || 0}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`relative px-5 py-2.5 rounded-lg text-sm font-bold transition-all overflow-hidden ${
                          selectedVariant?.id === v.id
                            ? "border-2 border-[#0d47a1] bg-blue-50 text-[#0d47a1]"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {v.name}
                        {selectedVariant?.id === v.id && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-[#0d47a1] rounded-bl-lg flex items-center justify-center">
                            <CheckCircle2 size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.quantityInStock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#e8eeff] text-[#0d47a1] rounded-lg font-black hover:bg-[#d4e1ff] transition py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} /> Thêm vào giỏ
                  </button>
                </div>
              </div>

              {actionMsg && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center">
                  {actionMsg}
                </div>
              )}

              {isBuyNowActive && (
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || selectedVariant.quantityInStock === 0}
                  className="w-full py-4 rounded-lg bg-[#1565c0] text-white font-black hover:bg-[#0d47a1] shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Mua ngay
                </button>
              )}

              {/* Trust Badges */}
              <div className="mt-auto pt-8 grid grid-cols-3 gap-4 border-t border-slate-100">
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck size={24} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600">Chính hãng 100%</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw size={24} className="text-blue-500" />
                  <span className="text-xs font-semibold text-slate-600">Đổi trả 7 ngày</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={24} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">Giao nhanh 2h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs section below */}
      {!loading && !error && product && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("description")}
              className={`px-8 py-4 font-bold text-sm transition ${activeTab === "description" ? "text-[#0d47a1] border-b-2 border-[#0d47a1]" : "text-slate-500 hover:text-slate-900"}`}
            >
              Mô tả sản phẩm
            </button>
            <button 
              onClick={() => setActiveTab("reviews")}
              className={`px-8 py-4 font-bold text-sm transition flex items-center gap-2 ${activeTab === "reviews" ? "text-[#0d47a1] border-b-2 border-[#0d47a1]" : "text-slate-500 hover:text-slate-900"}`}
            >
              Đánh giá <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{reviews.length}</span>
            </button>
          </div>
          <div className="p-8">
            {activeTab === "description" ? (
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">
                  {product.description || "Chưa có mô tả cho sản phẩm này."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-semibold">Chưa có đánh giá nào.</div>
                ) : (
                  reviews.map((review, i) => (
                    <div key={i} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                            {review.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{review.username}</p>
                            <div className="flex text-amber-400 mt-0.5">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} size={12} fill={idx < review.rating ? "currentColor" : "none"} stroke={idx < review.rating ? "none" : "currentColor"} className={idx >= review.rating ? "text-slate-300" : ""} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">2 ngày trước</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed pl-13">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
