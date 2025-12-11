import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  // ✅ Al cargar, detectar si ya está en modo oscuro
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const login = () => {
    if (email === "admin@rappi.com" && password === "admin123") {
      localStorage.setItem("rol", "admin");
      navigate("/admin");
    } else {
      localStorage.setItem("rol", "user");
      navigate("/user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-red-400 dark:from-gray-900 dark:to-gray-800 transition-colors">

      {/* ✅ BOTÓN DARK MODE */}
      <button
        onClick={toggleDark}
        className="absolute top-6 right-6 px-4 py-2 rounded bg-white/90 dark:bg-gray-700 dark:text-white shadow"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      <div className="bg-white dark:bg-gray-800 dark:text-white p-10 rounded-2xl shadow-xl w-96 transition-colors">
        <h2 className="text-3xl font-bold text-center mb-8">
          Iniciar Sesión
        </h2>

        <input
          className="w-full mb-4 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
        >
          Entrar
        </button>

        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          ¿No tienes una cuenta?
          <a href="/register" className="text-blue-600 dark:text-blue-400 font-semibold ml-1">
            Regístrate aquí
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;
