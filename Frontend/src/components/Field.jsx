export function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        {...props}
        className={`h-14 w-full rounded-lg border bg-white px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#09389a] focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      />
      {error ? <span className="mt-2 block text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}
