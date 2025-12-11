import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as authService from "../../services/auth.service";

const Navbar = ({ titulo }) => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("darkMode") === "true");
  const isAuthenticated = authService.isAuthenticated();
  const email = authService.getEmail();

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    const newDarkMode = !dark;
    setDark(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  const logout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold tracking-wide">{titulo}</h1>

      <div className="flex gap-4 items-center">
        {/* Profile Section - Only show when authenticated */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/user/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition font-semibold"
            >
              <span className="text-lg">👤</span>
              <span className="hidden sm:inline">Perfil</span>
            </button>
          </div>
        )}

        {/* Botón Dark Mode */}
        <button
          onClick={toggleDark}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Botón Cerrar Sesión - Only show when authenticated */}
        {isAuthenticated && (
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
