import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = ({ titulo }) => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold tracking-wide">{titulo}</h1>

      <div className="flex gap-4 items-center">
        {/* Botón Dark Mode */}
        <button
          onClick={toggleDark}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
