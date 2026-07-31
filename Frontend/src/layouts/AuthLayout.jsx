import { Truck } from "lucide-react";

export function AuthLayout({ children }) {
  return (
    <main className="min-h-[100dvh] flex flex-col lg:flex-row bg-[#f8f9fc] text-slate-900 font-sans">
      {/* Left Banner - LogisticsPro Branding */}
      <section className="relative hidden lg:flex flex-col justify-between w-[480px] xl:w-[560px] bg-[#0d47a1] text-white p-12 overflow-hidden shrink-0">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 0%, #42a5f5 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1565c0 0%, transparent 50%)" }} />
        
        <div className="relative z-10 flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="bg-white text-[#0d47a1] p-1.5 rounded-md">
            <Truck size={24} strokeWidth={2.5} />
          </div>
          LogisticsPro
        </div>

        <div className="relative z-10 my-auto py-12">
          <h1 className="text-[42px] leading-[1.1] font-black tracking-tight mb-6">
            Chuyên nghiệp hóa mọi điểm chạm giao vận.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-12 max-w-[90%]">
            Hệ thống quản lý chuỗi cung ứng tối ưu, kết nối liền mạch giữa Khách hàng, Shipper và Đội ngũ Admin.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-3xl font-black mb-1">1.2M+</p>
              <p className="text-xs font-bold text-blue-200 tracking-wider uppercase">Đơn hàng/tháng</p>
            </div>
            <div>
              <p className="text-3xl font-black mb-1">99.9%</p>
              <p className="text-xs font-bold text-blue-200 tracking-wider uppercase">Tỷ lệ chính xác</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-blue-200 font-medium">
          <span>© 2024 LogisticsPro Corp.</span>
          <a href="#" className="hover:text-white transition">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-white transition">Chính sách bảo mật</a>
        </div>
      </section>

      {/* Right Content - Form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[460px]">
          {children}
        </div>
      </section>
    </main>
  );
}
