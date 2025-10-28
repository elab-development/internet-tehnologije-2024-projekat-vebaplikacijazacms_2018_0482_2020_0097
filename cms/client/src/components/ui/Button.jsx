// Jednostavna stilizovana <button> komponenta.
export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
