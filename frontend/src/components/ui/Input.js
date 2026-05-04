export default function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <input
      type={type}
      className="w-full p-2 mb-2 bg-gray-700 rounded outline-none text-white"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}