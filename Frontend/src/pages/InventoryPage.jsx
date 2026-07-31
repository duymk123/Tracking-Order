import { useEffect, useState } from "react";
import { apiRequest } from "../api/httpClient.js";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { Package, Search, Box } from "lucide-react";
import { getImageForProduct } from "../utils/imageMapper.js";

export function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    apiRequest("/api/v1/products/admin")
      .then((data) => setProducts(Array.isArray(data) ? data : (data.content || [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => 
    p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Kho hàng</h1>
          <p className="text-slate-500 font-medium">Xem danh sách các sản phẩm đang có trong hệ thống</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0d47a1] focus:ring-1 focus:ring-[#0d47a1] w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-[#0d47a1]">
          <Box className="animate-bounce mb-4" size={40} />
          <p className="font-bold text-slate-600">Đang tải danh sách sản phẩm...</p>
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
                  <th className="p-4 pl-6">Sản phẩm</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Phân loại & Tồn kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={48} className="mb-4 opacity-30 text-slate-400" strokeWidth={1} />
                        <p className="font-bold text-slate-600">Không tìm thấy sản phẩm nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const totalStock = product.variants?.reduce((sum, v) => sum + v.quantityInStock, 0) || 0;
                    
                    return (
                      <tr key={product.productId} className="hover:bg-slate-50 transition">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                              <img src={getImageForProduct(product.productName)} alt={product.productName} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{product.productName}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200">
                            {product.categoryName || "Khác"}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-black text-[#0d47a1]">
                            {Number(product.basePrice).toLocaleString("vi-VN")}₫
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-slate-800 mb-2">
                              Tổng tồn kho: <span className="text-[#0d47a1]">{totalStock}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.variants?.map(v => (
                                <div key={v.id} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 font-medium">
                                  {v.sku}: <span className="font-bold text-slate-800">{v.quantityInStock}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
