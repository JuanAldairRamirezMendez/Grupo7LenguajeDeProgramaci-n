import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="bg-white dark:bg-gray-900 w-64 min-h-screen shadow-xl p-6 border-r dark:border-gray-700 transition-colors">
      <h2 className="text-2xl font-bold mb-10 text-red-600 tracking-wide">
        Rappi Admin
      </h2>

      <nav className="flex flex-col gap-4">
        <Link className="px-4 py-3 rounded-lg hover:bg-red-50 font-medium transition">
          Dashboard
        </Link>
        <Link className="px-4 py-3 rounded-lg hover:bg-red-50 font-medium transition">
          Usuarios
        </Link>
        <Link className="px-4 py-3 rounded-lg hover:bg-red-50 font-medium transition">
          Estadísticas
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

