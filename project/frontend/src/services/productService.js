export const getProductos = () => {
  return Promise.resolve([
    {
      nombre: "Pizza Familiar",
      descuento: "30%",
      tienda: "Pizza Hut",
      url: "https://www.pizzahut.com",
    },
    {
      nombre: "Combo Hamburguesa",
      descuento: "25%",
      tienda: "Burger King",
      url: "https://www.burgerking.com",
    },
    {
      nombre: "Pollo Broaster",
      descuento: "20%",
      tienda: "KFC",
      url: "https://www.kfc.com",
    },
  ]);
};
