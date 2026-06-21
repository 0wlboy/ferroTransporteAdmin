import { useNavigate } from "react-router-dom";
import { Car, MoreVertical, User, Wrench, Clock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useHomeStats } from "../../../hooks/useHomeStats";
import StatCard from "../../../components/cards/StatCard";
import DataList from "../../../components/UI/DataList";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const getInitials = (name) => {
  if (!name) return "MS";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { stats, chartData, urgentPetitions, recentPetitions, loading } =
    useHomeStats();

  const firstName = currentUser?.name
    ? currentUser.name.split(" ")[0]
    : "Javier";

  // Headers for Urgent Petitions (Sidebar)
  const urgentHeaders = [
    {
      label: "PASAJERO",
      headerClassName:
        "text-white/80 font-bold text-[10px] tracking-wider py-3 px-4",
      className: "py-3.5 px-4 align-middle",
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white text-[#FF5555] font-black flex items-center justify-center text-xs shrink-0 select-none shadow-sm">
            {getInitials(item.passengerName)}
          </div>
          <span className="text-xs font-bold text-white tracking-wide leading-tight">
            {item.passengerName}
          </span>
        </div>
      ),
    },
    {
      label: "DESTINO",
      headerClassName:
        "text-white/80 font-bold text-[10px] tracking-wider py-3 px-4",
      className: "py-3.5 px-4 align-middle",
      render: (item) => (
        <span className="text-xs font-bold text-white tracking-wide">
          {item.destino_nombre}
        </span>
      ),
    },
    {
      label: "",
      headerClassName: "py-3 px-2 w-8",
      className: "py-3.5 px-2 text-center align-middle",
      render: () => (
        <button
          onClick={() => navigate(`/petitions-view`)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  // Headers for Recent Petitions (Footer)
  const recentHeaders = [
    {
      label: "PASAJERO",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-150 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
            {item.foto_pasajero ? (
              <img
                src={item.foto_pasajero}
                alt={`${item.passengerName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {item.passengerName}
            </p>
            <p className="text-[10px] text-gray-455 font-semibold mt-0.5">
              CI: {item.ci_pasajero}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "CONDUCTOR",
      headerClassName:
        "text-[10px] font-black text-[#8A1538] tracking-wider py-4 px-4",
      className: "py-4 px-4 align-middle",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-150 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
            {item.foto_driver ? (
              <img
                src={item.foto_driver}
                alt={`${item.driverName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {item.driverName}
            </p>
            <p className="text-[10px] text-gray-455 font-semibold mt-0.5">
              CI: {item.ci_driver}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "DESTINO",
      headerClassName:
        "text-[10px] font-black text-[#8A1538] tracking-wider py-4 px-4",
      className: "py-4 px-4 align-middle",
      render: (item) => (
        <span className="text-xs font-semibold text-gray-600 tracking-wide">
          {item.destino_nombre}
        </span>
      ),
    },
    {
      label: "HORA",
      headerClassName:
        "text-[10px] font-black text-[#8A1538] tracking-wider py-4 px-4",
      className: "py-4 px-4 align-middle",
      render: (item) => (
        <span className="text-xs font-semibold text-gray-500 tracking-wide">
          {item.fecha}
        </span>
      ),
    },
    {
      label: "ESTADO",
      headerClassName:
        "text-[10px] font-black text-[#8A1538] tracking-wider py-4 px-4",
      className: "py-4 px-4 align-middle",
      render: (item) => {
        const status = item.estado;
        const badgeClass =
          status === "Completado"
            ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
            : status === "En camino" || status === "En curso"
              ? "bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]"
              : "bg-[#F1F3F4] text-[#5F6368] border border-[#E8EAED]";
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${badgeClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      label: "",
      headerClassName: "py-4 px-6 w-8 text-center",
      className: "py-4 px-6 text-center align-middle",
      render: () => (
        <button
          onClick={() => navigate(`/petitions-view`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4.5 h-4.5" />
        </button>
      ),
    },
  ];

  // Calculate total requests formatted text
  const formattedTotalCount =
    stats.solicitudesTotalHoy >= 1000
      ? `${(stats.solicitudesTotalHoy / 1000).toFixed(1)}k`
      : stats.solicitudesTotalHoy;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Custom overrides for urgent petitions DataList component */}
      <style>{`
                .urgent-petitions-container .bg-white {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .urgent-petitions-container thead tr {
                    background-color: rgba(0, 0, 0, 0.08) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
                }
                .urgent-petitions-container tbody tr {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .urgent-petitions-container tbody tr:hover {
                    background-color: rgba(255, 255, 255, 0.04) !important;
                }
                .urgent-petitions-container tbody tr:last-child {
                    border-bottom: none !important;
                }
                .recent-petitions-container thead tr {
                    background-color: #FAF6F7 !important;
                    border-bottom: 1px solid #F3E8EB !important;
                }
            `}</style>

      {/* Welcome Section */}
      <div className="flex flex-col gap-1 select-none">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Bienvenido, {firstName}
        </h1>
        <p className="text-gray-400 text-sm font-semibold tracking-wide mt-0.5">
          Aquí tienes un resumen de lo ocurrido hoy
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Viajes Totales Hoy"
          titleColor="text-[#8A1538]"
          value={stats.viajesTotalesHoy}
          subtext={stats.viajesTotalesHoyTrend}
          trend={{ type: "up" }}
          icon={Car}
          iconBg="bg-primary-light border-primary-light-border"
          iconColor="text-primary"
        />
        <StatCard
          title="Conductores Activos"
          titleColor="text-[#8A1538]"
          value={stats.conductoresActivos}
          subtext={`de ${stats.conductoresRegistrados} de los registrados`}
          icon={User}
          iconBg="bg-primary-light border-primary-light-border"
          iconColor="text-primary"
        />
        <StatCard
          title="Vehículos en Mantenimiento"
          titleColor="text-[#8A1538]"
          value={stats.vehiculosMantenimiento}
          subtext={`de ${stats.vehiculosTotal} hoy`}
          icon={Wrench}
          iconBg="bg-primary-light border-primary-light-border"
          iconColor="text-primary"
        />
        <StatCard
          title="Solicitudes Pendientes"
          titleColor="text-[#8A1538]"
          value={stats.solicitudesPendientes}
          subtext={`de ${stats.solicitudesTotalHoy} hoy`}
          icon={Clock}
          iconBg="bg-primary-light border-primary-light-border"
          iconColor="text-primary"
        />
      </div>

      {/* Mid Section: Chart and Urgent Petitions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Flow of Petitions Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] shadow-xs p-6 flex flex-col justify-between select-none">
          <div className="mb-4">
            <h3 className="text-gray-800 font-black text-sm uppercase tracking-wider">
              Flujo de Peticiones (Hoy)
            </h3>
          </div>

          <div className="flex-1 min-h-[260px] flex items-center justify-center relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs flex items-center justify-center z-10">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorPeticiones"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8A1538" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8A1538" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F3E8EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: "bold" }}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 100, 200]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #F3E8EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#374151" }}
                />
                <Area
                  type="monotone"
                  dataKey="Peticiones"
                  stroke="#8A1538"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPeticiones)"
                  dot={{
                    r: 4,
                    stroke: "#8A1538",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#8A1538",
                    strokeWidth: 2,
                    fill: "#8A1538",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 mt-4 px-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A1538]" />
            <span className="text-gray-400 font-semibold tracking-wide">
              Peticiones
            </span>
            <span className="text-gray-800 font-black tracking-wide pl-1">
              {formattedTotalCount} total
            </span>
          </div>
        </div>

        {/* Urgent Petitions Sidebar Widget */}
        <div className="bg-[#FF5555] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between text-white">
          {/* Header bar */}
          <div className="p-6 flex items-center justify-between border-b border-white/15">
            <h3 className="font-black text-sm uppercase tracking-wider">
              Peticiones Urgentes
            </h3>
            <button
              onClick={() => navigate("/petitions-view")}
              className="px-3.5 py-1.5 bg-[#8A1538] hover:bg-[#72102C] text-[10px] font-black tracking-wider rounded-xl transition-all shadow-md shadow-black/10 cursor-pointer uppercase"
            >
              Ver todo
            </button>
          </div>

          {/* Table Body (using DataList styled transparently) */}
          <div className="flex-1 urgent-petitions-container overflow-y-auto min-h-[260px]">
            <DataList
              data={urgentPetitions}
              headers={urgentHeaders}
              cardWrapper={false}
              loading={loading}
              noDataMessage="No hay peticiones urgentes hoy"
              loadingMessage="Cargando urgencias..."
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Petitions Table */}
      <div className="recent-petitions-container">
        <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F3E8EB] flex items-center justify-between select-none">
            <h3 className="text-gray-800 font-black text-sm uppercase tracking-wider">
              Peticiones Recientes
            </h3>
            <button
              onClick={() => navigate("/petitions-view")}
              className="text-[#8A1538] hover:text-[#72102C] text-xs font-black tracking-wider transition-colors cursor-pointer"
            >
              Ver todo
            </button>
          </div>
          <DataList
            data={recentPetitions}
            headers={recentHeaders}
            cardWrapper={false}
            loading={loading}
            noDataMessage="No hay peticiones registradas"
          />
        </div>
      </div>
    </div>
  );
}
