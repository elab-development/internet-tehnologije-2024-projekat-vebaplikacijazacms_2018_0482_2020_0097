// Omotač za sekcije – bela kartica sa paddingom i shadowom.
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 ${className}`}>
      {children}
    </div>
  );
}
