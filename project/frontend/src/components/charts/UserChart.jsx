import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Lun", usuarios: 20 },
  { name: "Mar", usuarios: 35 },
  { name: "Mie", usuarios: 50 },
  { name: "Jue", usuarios: 40 },
  { name: "Vie", usuarios: 60 },
];

const UserChart = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6 text-gray-800 dark:text-gray-100 transition-colors">
    <h3 className="font-bold mb-4">Usuarios Semanales</h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
        />
        <YAxis
          stroke="#9CA3AF"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "none",
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="usuarios"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default UserChart;
