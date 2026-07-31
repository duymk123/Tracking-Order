import { LoaderCircle } from "lucide-react";

export function LoadingButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#09389a] px-5 text-base font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0f43b3] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
    >
      {loading ? <LoaderCircle className="animate-spin" size={20} strokeWidth={2.3} /> : null}
      {children}
    </button>
  );
}
