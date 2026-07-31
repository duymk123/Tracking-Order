import { AlertCircle } from "lucide-react";

export function InlineAlert({ title, message }) {
  return (
    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
      <AlertCircle className="mt-0.5 shrink-0" size={20} strokeWidth={2.2} />
      <div>
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 text-sm font-medium leading-6">{message}</p>
      </div>
    </div>
  );
}
