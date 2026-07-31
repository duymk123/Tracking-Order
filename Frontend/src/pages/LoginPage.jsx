import { ArrowRight, Eye, EyeOff, Facebook, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InlineAlert } from "../components/InlineAlert.jsx";
import { LoadingButton } from "../components/LoadingButton.jsx";
import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { getRoleHomePath, signIn } from "../services/authService.js";

const TABS = [
  { id: "BUYER", label: "Khách hàng" },
  { id: "SHIPPER", label: "Shipper" },
  { id: "SELLER", label: "Admin" }, // SELLER maps to Admin in UI
];

export function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("BUYER");
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = "Vui lòng nhập tên đăng nhập.";
    if (!form.password) nextErrors.password = "Vui lòng nhập mật khẩu.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const signedInProfile = await signIn(form);
      navigate(getRoleHomePath(signedInProfile.role), { replace: true });
    } catch (requestError) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Chào mừng trở lại</h2>
        <p className="text-slate-500 mb-8">Vui lòng chọn vai trò và đăng nhập vào hệ thống</p>

        {/* Role Tabs */}
        <div className="flex p-1 bg-[#f1f5f9] rounded-lg mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#0d47a1] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                name="username"
                autoComplete="off"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={updateField}
                className={`w-full pl-10 pr-4 py-3 bg-[#f8f9fc] border ${fieldErrors.username ? "border-red-500" : "border-transparent"} focus:border-[#0d47a1] focus:bg-white rounded-lg outline-none transition`}
              />
            </div>
            {fieldErrors.username && <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={updateField}
                className={`w-full pl-10 pr-12 py-3 bg-[#f8f9fc] border ${fieldErrors.password ? "border-red-500" : "border-transparent"} focus:border-[#0d47a1] focus:bg-white rounded-lg outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.password}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0d47a1] focus:ring-[#0d47a1]" />
              <span className="text-sm font-semibold text-slate-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm font-bold text-[#0d47a1] hover:underline">Quên mật khẩu?</a>
          </div>

          {error && <div className="pt-2"><InlineAlert title="Lỗi" message={error} /></div>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1565c0] hover:bg-[#0d47a1] text-white py-3.5 rounded-lg font-bold transition disabled:opacity-70"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập vào hệ thống"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Hoặc tiếp tục với</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.369 -21.424 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.424 53.529 C -21.684 52.769 -21.824 51.969 -21.824 51.139 C -21.824 50.309 -21.684 49.509 -21.424 48.749 L -21.424 45.659 L -25.464 45.659 C -26.284 47.309 -26.754 49.169 -26.754 51.139 C -26.754 53.109 -26.284 54.969 -25.464 56.619 L -21.424 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.789 C -12.984 43.789 -11.404 44.389 -10.154 45.539 L -6.744 42.129 C -8.804 40.159 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.659 L -21.424 48.749 C -20.534 45.909 -17.884 43.789 -14.754 43.789 Z"/></g></svg>
            Google
          </button>
          <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition">
            <Facebook size={18} className="text-[#1877F2]" />
            Facebook
          </button>
        </div>

        <p className="mt-10 text-center text-sm font-semibold text-slate-500">
          Chưa có tài khoản? <Link to="/register" className="font-bold text-[#0d47a1] hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

