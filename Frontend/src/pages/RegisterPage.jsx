import { ArrowRight, Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InlineAlert } from "../components/InlineAlert.jsx";
import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { signIn } from "../services/authService.js";
import { apiRequest } from "../api/httpClient.js";
import { getRoleHomePath } from "../services/authService.js";

const TABS = [
  { id: "BUYER", label: "Khách hàng" },
  { id: "SHIPPER", label: "Shipper" },
  { id: "SELLER", label: "Admin" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("BUYER");
  const [form, setForm] = useState({ username: "", phone: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = "Vui lòng nhập tên đăng nhập.";
    if (!form.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!form.password) nextErrors.password = "Vui lòng nhập mật khẩu.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Mật khẩu không khớp.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await apiRequest("/api/v1/users/register", {
        method: "POST",
        body: JSON.stringify({ username: form.username, phone: form.phone, password: form.password, role: activeTab }),
        credentialsOverride: { username: "", password: "" },
      });

      const profile = await signIn({ username: form.username, password: form.password });
      navigate(getRoleHomePath(profile.role), { replace: true });
    } catch (requestError) {
      setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Tạo tài khoản mới</h2>
        <p className="text-slate-500 mb-8">Vui lòng chọn vai trò để tiếp tục</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                name="username"
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={updateField}
                className={`w-full pl-10 pr-4 py-3 bg-[#f8f9fc] border ${fieldErrors.username ? "border-red-500" : "border-transparent"} focus:border-[#0d47a1] focus:bg-white rounded-lg outline-none transition`}
              />
            </div>
            {fieldErrors.username && <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone size={18} />
              </div>
              <input
                name="phone"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={updateField}
                className={`w-full pl-10 pr-4 py-3 bg-[#f8f9fc] border ${fieldErrors.phone ? "border-red-500" : "border-transparent"} focus:border-[#0d47a1] focus:bg-white rounded-lg outline-none transition`}
              />
            </div>
            {fieldErrors.phone && <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Tạo mật khẩu"
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nhập lại Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={updateField}
                className={`w-full pl-10 pr-12 py-3 bg-[#f8f9fc] border ${fieldErrors.confirmPassword ? "border-red-500" : "border-transparent"} focus:border-[#0d47a1] focus:bg-white rounded-lg outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>

          {error && <div className="pt-2"><InlineAlert title="Lỗi" message={error} /></div>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1565c0] hover:bg-[#0d47a1] text-white py-3.5 rounded-lg font-bold transition disabled:opacity-70"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-slate-500">
          Đã có tài khoản? <Link to="/login" className="font-bold text-[#0d47a1] hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

