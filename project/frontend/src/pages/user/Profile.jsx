import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../../services/auth.service";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        phone: data.phone || "",
      });
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Invalid token") || err.message.includes("not found")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const updated = await authService.updateProfile(
        formData.phone
      );
      setProfile(updated);
      setEditing(false);
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      try {
        setError("");
        await authService.deleteAccount();
        authService.logout();
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Mi Perfil
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Gestiona tu información personal
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Profile Card */}
        {profile && (
          <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {/* Profile Header */}
            <div className={`px-6 py-8 ${isDarkMode ? "bg-gray-700" : "bg-blue-50"} border-b ${isDarkMode ? "border-gray-600" : "border-blue-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-white text-2xl font-bold">
                      {profile.full_name ? profile.full_name[0].toUpperCase() : profile.email[0].toUpperCase()}
                    </span>
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {profile.full_name || "Usuario"}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Miembro desde {new Date(profile.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 py-8">
              {!editing ? (
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Correo Electrónico
                    </label>
                    <p className={`mt-1 text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {profile.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Teléfono
                    </label>
                    <p className={`mt-1 text-lg ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>
                      {profile.phone || "No especificado"}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Rol
                    </label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        profile.role_id === 1
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {profile.role_id === 1 ? "Administrador" : "Usuario"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Phone Input */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                      placeholder="Tu teléfono"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-gray-900 hover:bg-gray-400"}`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Danger Zone */}
            {!editing && (
              <div className={`px-6 py-6 border-t ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-red-400" : "text-red-600"} mb-4`}>
                  Zona de Peligro
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                  Una vez que elimines tu cuenta, no hay vuelta atrás.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar Mi Cuenta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
