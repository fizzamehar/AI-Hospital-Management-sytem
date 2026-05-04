export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition ${className}`}
    >
      {children}
    </button>
  );
}