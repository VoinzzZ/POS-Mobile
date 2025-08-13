export default function Button({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-violet-700 text-white py-2 rounded-lg hover:bg-violet-800 transition cursor-pointer"
    >
      {children}
    </button>
  );
}