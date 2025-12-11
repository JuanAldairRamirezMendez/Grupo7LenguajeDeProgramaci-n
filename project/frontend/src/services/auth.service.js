const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const register = async (email, password, full_name, phone) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name: full_name || email.split("@")[0],
      phone: phone || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al registrarse");
  }

  return await response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al iniciar sesión");
  }

  return await response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("rol");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getEmail = () => {
  return localStorage.getItem("email");
};

export const getRole = () => {
  return localStorage.getItem("rol") || "user";
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  return getRole() === "admin";
};

export const getProfile = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al obtener perfil");
  }

  return await response.json();
};

export const updateProfile = async (phone) => {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al actualizar perfil");
  }

  return await response.json();
};

export const deleteAccount = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al eliminar cuenta");
  }

  return await response.json();
};
