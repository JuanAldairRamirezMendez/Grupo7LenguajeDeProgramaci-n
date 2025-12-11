import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registro simulado (solo frontend)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Registro
        </h2>

        <input
          type="text"
          placeholder="Nombre"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
          Registrarse
        </button>

        <p className="text-sm text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-red-600 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
