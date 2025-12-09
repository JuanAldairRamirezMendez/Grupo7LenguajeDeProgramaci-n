export const login = (email, password) => {
  if (email === "admin@rappi.com" && password === "admin123") {
    return {
      rol: "ADMIN",
      nombre: "Administrador"
    };
  }

  if (email && password) {
    return {
      rol: "USER",
      nombre: "Usuario"
    };
  }

  return null;
};
