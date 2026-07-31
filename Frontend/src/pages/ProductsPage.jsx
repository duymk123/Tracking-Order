import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/httpClient.js";
import { StorefrontLayout } from "../layouts/StorefrontLayout.jsx";
import { ArrowRight, Box, Package, ShoppingCart, Star } from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/api/v1/products")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StorefrontLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-[#0d47a1] text-white overflow-hidden mb-12 shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 0%, #42a5f5 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1565c0 0%, transparent 50%)" }} />
        <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 lg:w-2/3">
          <span className="inline-block py-1.5 px-3 rounded-full bg-white/20 text-blue-100 text-xs font-black uppercase tracking-wider mb-6">
            LogisticsPro Express
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-6">
            Giao Hàng Siêu Tốc <br className="hidden md:block" />Trong 2 Giờ
          </h1>
          <p className="text-lg text-blue-100 font-medium mb-8 max-w-xl">
            Khám phá danh mục sản phẩm phong phú và đặt hàng ngay. Hệ thống vận hành tự động sẽ đưa hàng đến tay bạn trong thời gian ngắn nhất.
          </p>
          <button className="flex items-center gap-2 bg-white text-[#0d47a1] px-6 py-3.5 rounded-lg font-bold hover:bg-slate-50 transition shadow-lg shadow-white/10">
            Khám phá ngay
            <ArrowRight size={18} />
          </button>
        </div>
        {/* Graphic elements on the right */}
        <div className="hidden lg:block absolute top-1/2 right-0 transform -translate-y-1/2 w-1/3 h-full">
           <div className="absolute inset-0 bg-gradient-to-r from-[#0d47a1] to-transparent z-10" />
           <div className="w-full h-full opacity-30 flex items-center justify-center">
             <Package size={240} strokeWidth={0.5} />
           </div>
        </div>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Sản phẩm nổi bật</h2>
          <p className="text-slate-500 font-medium mt-1">Lựa chọn hàng đầu cho doanh nghiệp của bạn</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Box className="animate-bounce mb-4 text-[#0d47a1]" size={40} />
          <p className="font-bold">Đang tải sản phẩm...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
          <p className="font-bold mb-1">Không thể tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.productId}
              onClick={() => navigate(`/products/${product.productId}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#0d47a1]/30 transition-all duration-300 flex flex-col"
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300 group-hover:bg-blue-50 transition">
                <img src={getImageForProduct(product.productName)} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  <span
                    className={`rounded bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      product.inStock ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {product.categoryName}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-[#0d47a1] transition">
                  {product.productName}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <p className="text-lg font-black text-[#0d47a1]">
                    {Number(product.basePrice).toLocaleString("vi-VN")}₫
                  </p>
                  
                  <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#1565c0] group-hover:text-white transition">
                    <ShoppingCart size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Package size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-bold text-slate-600">Chưa có sản phẩm nào.</p>
              <p className="text-slate-400">Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      )}
    </StorefrontLayout>
  );
}
