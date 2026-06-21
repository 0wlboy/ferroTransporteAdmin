import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginateDrivers } from "../../../hooks/usePaginateDrivers";
import StatCard from "../../../components/cards/StatCard";
import DataList from "../../../components/UI/DataList";
import ExportDropdown from "../../../components/UI/ExportDropdown";
import { exportToExcel } from "../../../../utils/excelExport";
import { exportToPDF } from "../../../../utils/pdfExport";
import { MoreVertical, Car, User, Plus, CheckCircle } from "lucide-react";

export default function DriversView() {
  const navigate = useNavigate();
  const {
    data: drivers,
    loading,
    page,
    totalPages,
    totalItems,
    pageSize,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    nextPage,
    prevPage,
    setPage,
    stats,
    fetchFilteredAll,
  } = usePaginateDrivers({ initialPageSize: 4 });

  const handlePrintPDF = async () => {
    const allDrivers = await fetchFilteredAll();
    const tableData = allDrivers.map((p) => [
      p.id,
      `${p.nombre || ""} ${p.apellido || ""}`.trim(),
      p.ci_user || "N/D",
      p.localizacion || "N/D",
      p.correo || "N/D",
      p.telefono || "N/D",
      p.vehiculo_placa || "N/D",
      p.activo ? "Activo" : "Inactivo",
      p.fecha || "N/D",
    ]);

    const tableHeaders = [
      "ID",
      "Nombre Completo",
      "CI",
      "Gerencia",
      "Correo",
      "Teléfono",
      "Vehiculo Placa",
      "Estado",
      "Fecha Registro",
    ];

    exportToPDF({
      title: "Reporte de Conductores",
      headers: tableHeaders,
      data: tableData,
      fileName: "reporte_de_conductores",
    });
  };

  const handleExportExcel = async () => {
    const allDrivers = await fetchFilteredAll();
    const exportData = allDrivers.map((p) => ({
      ID: p.id,
      Nombre: p.nombre || "",
      Apellido: p.apellido || "",
      "Cédula (CI)": p.ci_user || "",
      "Gerencia / Departamento": p.localizacion || "Sin Gerencia",
      Correo: p.correo || "",
      Teléfono: p.telefono || "",
      "Vehículo Placa": p.vehiculo_placa || "Sin vehículo",
      Estado: p.activo ? "Activo" : "Inactivo",
      "Fecha Registro": p.fecha || "",
    }));
    exportToExcel(exportData, "Reporte_Conductores");
  };

  // State for controlling active row action menu and details modal
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Columns configuration for DataList table
  const headers = [
    {
      label: "CONDUCTOR",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-150 shrink-0 bg-gray-55 flex items-center justify-center shadow-xs">
            {item.foto_url ? (
              <img
                src={item.foto_url}
                alt={`${item.nombre} ${item.apellido}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {item.nombre} {item.apellido}
            </p>
            <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
              CI: {item.ci_user}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "GERENCIA O DEPARTAMENTO",
      render: (item) => (
        <span className="text-xs font-bold text-gray-800">
          {item.localizacion || "Sin Gerencia"}
        </span>
      ),
    },
    {
      label: "VEHICULO ASIGNADO",
      render: (item) =>
        item.vehiculo_placa ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-150 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
              {item.vehiculo_foto ? (
                <img
                  src={item.vehiculo_foto}
                  alt={`${item.vehiculo_placa}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                {item.vehiculo_placa}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 font-medium italic text-[11px]">
            Sin vehículo
          </span>
        ),
    },
    {
      label: "ESTADO",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
            item.activo === true
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-gray-50 text-gray-700 border-gray-150"
          }`}
        >
          {item.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      label: "FECHA DE CREACION",
      render: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-gray-770">
            {item.fecha ? item.fecha.split(" ")[0] : ""}
          </p>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {item.fecha ? item.fecha.split(" ")[1] : ""}
          </p>
        </div>
      ),
    },
    {
      label: "ACCIONES",
      className: "text-center pr-6 relative",
      render: (item) => (
        <div className="relative inline-block text-left">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 transition-colors cursor-pointer inline-flex items-center justify-center"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          {activeMenuId === item.id && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setActiveMenuId(null)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in text-left">
                <button
                  onClick={() => {
                    navigate(`/user-activity/${item.id}`);
                    setActiveMenuId(null);
                  }}
                  className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer border-t border-gray-100"
                >
                  Ver Actividad
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Top row: Page title and Print PDF button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Gestion de Conductores
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra los conductores registrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportPDF={handlePrintPDF}
            onExportExcel={handleExportExcel}
          />
          <button
            onClick={() => navigate("/add-user")}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>AÑADIR CONDUCTOR</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Conductores"
          value={stats.totalConductores.toString()}
          subtext={null}
          icon={Car}
        />
        <StatCard
          title="Total Activos"
          value={stats.activosTotal.toString()}
          subtext="Generado una peticion hoy"
          icon={CheckCircle}
          titleColor="text-emerald-700"
          iconBg="bg-emerald-50 border-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Registrados Hoy"
          value={stats.totalToday.toString()}
          subtext={null}
          icon={User}
          titleColor="text-blue-700"
          iconBg="bg-blue-50 border-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      {/* Reusable DataList Component */}
      <DataList
        data={drivers}
        loading={loading}
        headers={headers}
        noDataMessage="No se encontraron conductores que coincidan con los filtros aplicados."
        loadingMessage="Cargando conductores..."
        filters={{
          search: {
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Buscar por nombre o gerencia...",
          },
          selects: [
            {
              label: "Orden por:",
              value: sortBy,
              onChange: setSortBy,
              options: [
                { value: "fecha_desc", label: "Fecha Descendente" },
                { value: "fecha_asc", label: "Fecha Ascendente" },
                { value: "nombre_asc", label: "Nombre (A-Z)" },
                { value: "nombre_desc", label: "Nombre (Z-A)" },
                { value: "apellido_asc", label: "Apellido (A-Z)" },
                { value: "apellido_desc", label: "Apellido (Z-A)" },
              ],
            },
            {
              label: "Filtrar por:",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Todos los Estados" },
                { value: "true", label: "Activos" },
                { value: "false", label: "Inactivos" },
              ],
            },
          ],
        }}
        pagination={{
          page,
          totalPages,
          totalItems,
          pageSize,
          setPage,
          nextPage,
          prevPage,
          itemTypeName: "conductores registrados",
        }}
      />
    </div>
  );
}
