import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginateVehicles } from "../../hooks/usePaginateVehicles";
import StatCard from "../../components/cards/StatCard";
import DataList from "../../components/UI/DataList";
import ExportDropdown from "../../components/UI/ExportDropdown";
import { exportToExcel } from "../../../utils/excelExport";
import { exportToPDF } from "../../../utils/pdfExport";
import {
    MoreVertical,
    Car,
    User,
    Plus,
    Wrench,
    CheckCircle
} from "lucide-react";

export default function CarView() {
    const navigate = useNavigate();
    const {
        data: vehicles,
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
        fetchFilteredAll
    } = usePaginateVehicles({ initialPageSize: 4 });

    const handlePrintPDF = async () => {
        const allVehicles = await fetchFilteredAll();
        const tableData = allVehicles.map(v => [
            v.id,
            v.marca,
            v.modelo,
            v.año,
            v.placa,
            v.num_asientos,
            v.maletero_amplio ? "Sí" : "No",
            v.driverName,
            v.estado
        ]);

        const tableHeaders = ["ID", "Marca", "Modelo", "Año", "Placa", "Asientos", "Maletero Amplio", "Conductor", "Estado"];

        exportToPDF({
            title: "Reporte de Vehículos",
            headers: tableHeaders,
            data: tableData,
            fileName: "reporte_de_vehiculos"
        });
    };

    const handleExportExcel = async () => {
        const allVehicles = await fetchFilteredAll();
        const exportData = allVehicles.map(v => ({
            "ID": v.id,
            "Marca": v.marca || "",
            "Modelo": v.modelo || "",
            "Año": v.año || "",
            "Placa": v.placa || "",
            "Asientos": v.num_asientos || "",
            "Maletero Amplio": v.maletero_amplio ? "Sí" : "No",
            "Conductor": v.driverName || "",
            "Estado": v.estado || "",
            "Fecha Registro": v.fecha || ""
        }));
        exportToExcel(exportData, "Reporte_Vehiculos");
    };

    // State for controlling active row action menu
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Columns configuration for DataList table
    const headers = [
        {
            label: "VEHICULO",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-150 shrink-0 bg-gray-50 flex items-center justify-center border-[#8A1538]">
                        {item.foto_vehiculo ? (
                            <img
                                src={item.foto_vehiculo}
                                alt={`${item.marca} ${item.modelo}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Car className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                            {item.marca} {item.modelo}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            Año: {item.año}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: "PLACA",
            render: (item) => (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-[#F9FAFB] border border-[#F3E8EB] text-gray-800 tracking-wider">
                    {item.placa}
                </span>
            )
        },
        {
            label: "CONDUCTOR",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                        {item.ci_driver && item.foto_driver ? (
                            <img
                                src={item.foto_driver}
                                alt={item.driverName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-800">
                            {item.ci_driver ? item.driverName : "Por Asignar"}
                        </p>
                        {item.ci_driver && (
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                                CI: {item.ci_driver}
                            </p>
                        )}
                    </div>
                </div>
            )
        },
        {
            label: "ESTADO",
            render: (item) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${item.estado === "Operativo"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : item.estado === "Mantenimiento"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                >
                    {item.estado}
                </span>
            )
        },
        {
            label: "ACCIONES",
            className: "text-center pr-6 relative",
            render: (item) => (
                <div className="relative inline-block text-left">
                    <button
                        onClick={() =>
                            setActiveMenuId(
                                activeMenuId === item.id ? null : item.id
                            )
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
                                        navigate(`/car-activity/${item.id}`);
                                        setActiveMenuId(null);
                                    }}
                                    className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
                                >
                                    Ver Actividad
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in select-none">
            {/* Top row: Page title and Print PDF button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Gestion de Vehiculos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra los vehiculos registrados
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportPDF={handlePrintPDF}
                        onExportExcel={handleExportExcel}
                    />
                    <button
                        onClick={() => navigate("/add-car")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>AÑADIR VEHÍCULO</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Flota"
                    value={stats.totalFlota.toString()}
                    subtext={`+${stats.totalThisMonth} este mes`}
                    icon={Car}
                />
                <StatCard
                    title="Activos"
                    value={stats.operativosTotal.toString()}
                    subtext={`${stats.totalFlota > 0 ? Math.round((stats.operativosTotal / stats.totalFlota) * 100) : 0}% disponibilidad`}
                    icon={CheckCircle}
                    titleColor="text-emerald-700"
                    iconBg="bg-emerald-50 border-emerald-100"
                    iconColor="text-emerald-600"
                />
                <StatCard
                    title="En Taller"
                    value={stats.mantenimientoTotal.toString()}
                    subtext={`${stats.mantenimientoToday} programados hoy`}
                    icon={Wrench}
                    titleColor="text-amber-700"
                    iconBg="bg-amber-50 border-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Unified DataList Component */}
            <DataList
                data={vehicles}
                loading={loading}
                headers={headers}
                noDataMessage="No se encontraron vehículos que coincidan con los filtros aplicados."
                loadingMessage="Cargando vehículos..."
                filters={{
                    search: {
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Buscar por nombre o placa...",
                    },
                    selects: [
                        {
                            label: "Ordenado por:",
                            value: sortBy,
                            onChange: setSortBy,
                            options: [
                                { value: "fecha_desc", label: "Fecha Descendente" },
                                { value: "fecha_asc", label: "Fecha Ascendente" },
                                { value: "placa_asc", label: "Placa (A-Z)" },
                                { value: "placa_desc", label: "Placa (Z-A)" },
                            ],
                        },
                        {
                            label: "Filtrar por:",
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: "all", label: "Todos los Estados" },
                                { value: "Operativo", label: "Operativo" },
                                { value: "Inoperativo", label: "Inoperativo" },
                                { value: "Mantenimiento", label: "Mantenimiento" },
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
                    itemTypeName: "vehículos registrados",
                }}
            />
        </div>
    );
}