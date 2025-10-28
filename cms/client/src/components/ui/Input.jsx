// Stilizovani <input> element za forme.
export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none ${className}`}
      {...props}
    />
  );
}
