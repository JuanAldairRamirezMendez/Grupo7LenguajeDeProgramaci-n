import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import { getProductos } from "../../services/productService";

const UserHome = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    getProductos().then(setProductos);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar titulo="Ofertas Disponibles" />

      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {productos.map((p, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition overflow-hidden group"
          >
            <div className="h-44 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {p.tienda}
              </span>
            </div>

            <div className="p-6">
              <h2 className="font-bold text-lg mb-2">{p.nombre}</h2>
              <p className="text-green-600 font-semibold mb-4">
                {p.descuento} de descuento
              </p>

              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Ver oferta
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserHome;

