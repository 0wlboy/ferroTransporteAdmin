import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginateDrivers } from "../hooks/usePaginateDrivers";
import StatCard from "../components/StatCard";
import DriverDetails from "../components/modals/DriverDetails";
import {
    Search,
    FileDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Car,
    User,
    Plus,
    CheckCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DriverView() {
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
    } = usePaginateDrivers({ initialPageSize: 4 });

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Conductores", 80, 10);
        doc.text("Fecha: " + new Date().toLocaleDateString(), 80, 15);

        // Formatear datos para autotable
        const tableData = drivers.map(p => [
            p.id,
            `${p.nombre} ${p.apellido}`,
            p.ci_user,
            p.localizacion || "N/D",
            p.correo || "N/D",
            p.telefono || "N/D",
            p.vehiculo_placa || "N/D",
            p.activo ? "Activo" : "Inactivo",
            p.fecha
        ]);

        const tableHeaders = ["ID", "Nombre Completo", "CI", "Gerencia", "Correo", "Teléfono", "Vehiculo Placa", "Estado", "Fecha Registro"];

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [138, 21, 56] } // Brand primary color (#8A1538)
        });
        doc.save("reporte de conductores.pdf");
    };

    // State for controlling active row action menu (logic only created for UI purposes)
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // Calculate dynamic "Mostrando X-Y de Z" text
    const startIndex = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
    const endIndex = Math.min(page * pageSize, totalItems);

    // Dynamic pagination page list generator matching mockup format: [1, 2, 3, ..., 36]
    const renderPageNumbers = () => {
        const pages = [];

        // If totalPages is small, just show all
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === i
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                            }`}
                    >
                        {i}
                    </button>
                );
            }
            return pages;
        }

        // Otherwise generate with ellipses (e.g. 1 2 3 ... 36)
        // Show first 3
        for (let i = 1; i <= 3; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === i
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Ellipsis
        if (page > 3 && page < totalPages - 1) {
            // If we are on page 4 or 5, show a transition
            pages.push(
                <span key="ell1" className="text-gray-400 text-xs px-1 select-none">
                    ...
                </span>
            );
            pages.push(
                <button
                    key={page}
                    onClick={() => setPage(page)}
                    className="w-8 h-8 rounded-lg text-xs font-bold bg-primary text-white shadow-md shadow-primary/20 cursor-pointer"
                >
                    {page}
                </button>
            );
        }

        pages.push(
            <span key="ell2" className="text-gray-400 text-xs px-1 select-none">
                ...
            </span>
        );

        // Show last page
        pages.push(
            <button
                key={totalPages}
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === totalPages
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                    }`}
            >
                {totalPages}
            </button>
        );

        return pages;
    };

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
                    <button
                        onClick={() => handlePrintPDF()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary hover:bg-primary-light hover:text-primary transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <FileDown className="w-4 h-4 text-primary" />
                        <span>EXPORTA A PDF</span>
                    </button>
                    <button
                        onClick={() => alert("Función para añadir conductor en desarrollo")}
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

            {/* Main Content Card: Search, Filters and Table */}
            <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-xs overflow-hidden">

                {/* Filters Section */}
                <div className="p-5 border-b border-[#F3E8EB] bg-[#FCFCFD] flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Search Input */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o gerencia..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400 bg-[#F9FAFB]"
                        />
                    </div>

                    {/* Filter and Sort Dropdowns */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                Orden por:
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-55"
                            >
                                <option value="fecha_desc">Fecha Descendente</option>
                                <option value="fecha_asc">Fecha Ascendente</option>
                                <option value="nombre_asc">Nombre (A-Z)</option>
                                <option value="nombre_desc">Nombre (Z-A)</option>
                                <option value="apellido_asc">Apellido (A-Z)</option>
                                <option value="apellido_desc">Apellido (Z-A)</option>
                            </select>
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                Filtrar por:
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-55"
                            >
                                <option value="all">Todos los Estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs flex items-center justify-center z-10 transition-opacity">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span className="text-xs font-bold text-primary">Cargando conductores...</span>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#F3E8EB] bg-[#FCFCFD]">
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase pl-6">
                                    CONDUCTOR
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    GERENCIA O DEPARTAMENTO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    VEHICULO ASIGNADO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    ESTADO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    FECHA DE CREACION
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase text-center pr-6">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3E8EB]">
                            {drivers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                        No se encontraron conductores que coincidan con los filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#FCFCFD]/50 transition-colors">
                                        {/* Driver Info Column */}
                                        <td className="p-4 pl-6">
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
                                        </td>

                                        {/* Gerencia Column */}
                                        <td className="p-4 text-xs font-bold text-gray-800">
                                            {item.localizacion || "Sin Gerencia"}
                                        </td>

                                        {/* Vehiculo Info Column */}
                                        <td className="p-4 pl-6">
                                            {item.vehiculo_placa ? (
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
                                            )}
                                        </td>

                                        {/* Estado Column */}
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${item.activo === true
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-gray-50 text-gray-700 border-gray-150"
                                                    }`}
                                            >
                                                {item.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>

                                        {/* Fecha Column (Date & Time Stacked) */}
                                        <td className="p-4 text-xs">
                                            <p className="font-semibold text-gray-700">
                                                {item.fecha ? item.fecha.split(" ")[0] : ""}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                {item.fecha ? item.fecha.split(" ")[1] : ""}
                                            </p>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="p-4 text-center pr-6 relative">
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
                                                    <div className="absolute right-6 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in text-left">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDriver(item);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            Ver Detalle
                                                        </button>
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer and Pagination Controls */}
                <div className="p-4 border-t border-[#F3E8EB] bg-[#FCFCFD] flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Showing index text */}
                    <div className="text-[11px] font-semibold text-gray-400">
                        {totalItems > 0 ? (
                            <span>
                                Mostrando {startIndex}–{endIndex} de {totalItems} conductores registrados
                            </span>
                        ) : (
                            <span>No hay registros disponibles</span>
                        )}
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={prevPage}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {renderPageNumbers()}

                        <button
                            onClick={nextPage}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {selectedDriver && (
                <DriverDetails
                    driver={selectedDriver}
                    onClose={() => setSelectedDriver(null)}
                />
            )}
        </div>
    );
}