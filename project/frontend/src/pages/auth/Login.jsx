import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al iniciar sesión");
      }

      const data = await response.json();
      const token = data.access_token;

      // Guardar token
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      // Determinar si es admin (por ahora, verificar por email)
      if (email === "admin@gmail.com") {
        localStorage.setItem("rol", "admin");
        navigate("/admin");
      } else {
        localStorage.setItem("rol", "user");
        navigate("/user");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={login}>
          <input
            className="w-full mb-4 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full mb-6 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
