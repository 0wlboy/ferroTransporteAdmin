import React, { useState } from "react";
import { usePaginatePetitions } from "../../hooks/usePaginatePetitions";
import StatCard from "../../components/cards/StatCard";
import PetitionDetails from "../../components/modals/PetitionDetails";
import {
    Search,
    FileDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Car,
    XCircle,
    User,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function PetitionsView() {
    const {
        data: petitions,
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
    } = usePaginatePetitions({ initialPageSize: 4 });

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Peticiones", 80, 10);
        doc.text("Fecha: " + new Date().toLocaleDateString(), 80, 15);

        // Formatear datos para autotable
        const tableData = petitions.map(p => [
            p.id,
            p.ci_pasajero,
            p.ci_driver,
            p.origen_nombre,
            p.destino_nombre,
            p.estado,
            p.fecha,
            p.prioridad,
        ]);

        const tableHeaders = ["ID", "CI Pasajero", "CI Conductor", "Origen", "Destino", "Estado", "Fecha", "Prioridad"];

        autoTable(doc, { head: [tableHeaders], body: tableData, startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [22, 163, 74] } });
        doc.save("peticiones.pdf");
    };

    // State for controlling active row action menu (logic only created for UI purposes)
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [selectedPetition, setSelectedPetition] = useState(null);

    // Calculate dynamic "Mostrando X-Y de Z" text
    const startIndex = (page - 1) * pageSize + 1;
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
                        Gestion de Peticiones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra las Peticiones Generadas por los Usuarios
                    </p>
                </div>

                <div>
                    <button
                        onClick={() => handlePrintPDF()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary hover:bg-primary-light hover:text-primary transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <FileDown className="w-4 h-4 text-primary" />
                        <span>EXPORTA A PDF</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Solicitudes Pendientes"
                    value={stats.pendingTotal.toString()}
                    subtext={`${stats.pendingToday} de ${stats.todayTotal} hechas hoy`}
                    icon={ClipboardList}
                />
                <StatCard
                    title="Viajes en Curso"
                    value={stats.enCaminoTotal.toString()}
                    subtext={`${stats.enCaminoToday} de ${stats.todayTotal} hechas hoy`}
                    icon={Car}
                />
                <StatCard
                    title="Solicitudes Canceladas"
                    value={stats.cancelledTotal.toString()}
                    subtext={`${stats.cancelledToday} de ${stats.todayTotal} hechas hoy`}
                    icon={XCircle}
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
                            placeholder="Buscar por cedula o placa..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400 bg-[#F9FAFB]"
                        />
                    </div>

                    {/* Filter and Sort Dropdowns */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                Ordenado por:
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-55"
                            >
                                <option value="fecha_desc">Fecha Descendente</option>
                                <option value="fecha_asc">Fecha Ascendente</option>
                                <option value="pasajero_asc">Pasajero (A-Z)</option>
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
                                <option value="En Camino">En Camino</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
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
                                <span className="text-xs font-bold text-primary">Cargando peticiones...</span>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#F3E8EB] bg-[#FCFCFD]">
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase pl-6">
                                    Pasajero
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    Conductor
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    Fecha
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    Estado
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    Prioridad
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase text-center pr-6">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3E8EB]">
                            {petitions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                        No se encontraron peticiones que coincidan con los filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                petitions.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#FCFCFD]/50 transition-colors">
                                        {/* Passenger Column */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                                                    {item.foto_pasajero ? (
                                                        <img
                                                            src={item.foto_pasajero}
                                                            alt={item.passengerName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">
                                                        {item.passengerName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                        Ci: {item.ci_pasajero}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Driver Column */}
                                        <td className="p-4 text-xs">
                                            {item.driverName ? (
                                                <div>
                                                    <p className="font-semibold text-gray-700">
                                                        {item.driverName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-semibold text-gray-450 mt-0.5">
                                                        Ci: {item.ci_driver}
                                                    </p>
                                                    {item.placa_vehiculo && (
                                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                            Placa: <span className="font-semibold text-gray-500">{item.placa_vehiculo}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-medium italic text-[11px]">
                                                    No asignado
                                                </span>
                                            )}
                                        </td>

                                        {/* Date Column */}
                                        <td className="p-4 text-xs font-semibold text-gray-500">
                                            {item.fecha}
                                        </td>

                                        {/* Status Column */}
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${item.estado === "Completado"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : item.estado === "Pendiente"
                                                        ? "bg-gray-100 text-gray-600 border border-gray-200/60"
                                                        : item.estado === "En camino"
                                                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                            : "bg-red-50 text-red-700 border border-red-100"
                                                    }`}
                                            >
                                                {item.estado}
                                            </span>
                                        </td>

                                        {/* Priority Column */}
                                        <td className="p-4">
                                            <span
                                                className={`text-[10px] font-extrabold tracking-wider ${item.prioridad === "Alta"
                                                    ? "text-red-600"
                                                    : item.prioridad === "Media"
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {item.prioridad}
                                            </span>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="p-4 text-center pr-6 relative">
                                            <button
                                                onClick={() =>
                                                    setActiveMenuId(
                                                        activeMenuId === item.id ? null : item.id
                                                    )
                                                }
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                                            >
                                                <MoreVertical className="w-4.5 h-4.5" />
                                            </button>

                                            {/* Dropdown Menu (Placeholder layout UI) */}
                                            {activeMenuId === item.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-20"
                                                        onClick={() => setActiveMenuId(null)}
                                                    />
                                                    <div className="absolute right-6 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in text-left">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPetition(item);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                alert(`Asignar conductor para ${item.id}`);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            Asignar Conductor
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                alert(`Cancelar petición ${item.id}`);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            Cancelar Viaje
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
                                Mostrando {startIndex}–{endIndex} de {totalItems} peticiones hechas
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

            {selectedPetition && (
                <PetitionDetails
                    petition={selectedPetition}
                    onClose={() => setSelectedPetition(null)}
                />
            )}
        </div>
    );
}