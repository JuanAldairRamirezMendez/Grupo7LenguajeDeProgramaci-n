import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import UserChart from "../../components/charts/UserChart";

const AdminDashboard = () => {
  const stats = [
    { titulo: "Usuarios Totales", valor: 120 },
    { titulo: "Usuarios Activos", valor: 85 },
    { titulo: "Nuevos Registros", valor: 20 },
    { titulo: "Crecimiento", valor: "15%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar titulo="Panel de Administración" />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">
            Resumen General
          </h2>

          {/* TARJETAS SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.titulo}
                </p>
                <p className="text-4xl font-bold mt-3">
                  {item.valor}
                </p>
              </div>
            ))}
          </div>

          {/* TARJETAS INFERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

            {/* ACTIVIDAD */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-gray-800 dark:text-gray-100">
              <h2 className="font-bold text-lg mb-4">
                Actividad de Usuarios
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <p>Mensuales: 80%</p>
                <p>Semanales: 60%</p>
                <p>Retención: 75%</p>
              </div>
            </div>

            {/* TABLA */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-gray-800 dark:text-gray-100">
              <h2 className="font-bold text-lg mb-4">
                Registros por Semana
              </h2>

              <table className="w-full text-left text-gray-700 dark:text-gray-200">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="pb-2">Semana</th>
                    <th className="pb-2">Registros</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Semana 1</td>
                    <td>25</td>
                  </tr>
                  <tr>
                    <td className="py-2">Semana 2</td>
                    <td>40</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* GRÁFICO */}
          <UserChart />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

