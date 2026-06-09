import React, { useState } from "react";
import { usePaginateVehicles } from "../hooks/usePaginateVehicles";
import StatCard from "../components/StatCard";
import VehicleDetails from "../components/modals/VehicleDetails";
import {
    Search,
    FileDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Car,
    User,
    Plus,
    Wrench,
    CheckCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CarView() {
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
    } = usePaginateVehicles({ initialPageSize: 4 });

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Vehículos", 80, 10);
        doc.text("Fecha: " + new Date().toLocaleDateString(), 80, 15);

        // Formatear datos para autotable
        const tableData = vehicles.map(v => [
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

        autoTable(doc, { 
            head: [tableHeaders], 
            body: tableData, 
            startY: 20, 
            styles: { fontSize: 8 }, 
            headStyles: { fillColor: [138, 21, 56] } // Brand primary color (#8A1538)
        });
        doc.save("vehiculos.pdf");
    };

    // State for controlling active row action menu (logic only created for UI purposes)
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

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
                        Gestion de Vehiculos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra los vehiculos registrados
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
                        onClick={() => alert("Función para añadir localización o vehículo en desarrollo")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>AÑADIR LOCALIZACIÓN</span>
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
                            placeholder="Buscar por nombre o placa..."
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
                                <option value="placa_asc">Placa (A-Z)</option>
                                <option value="placa_desc">Placa (Z-A)</option>
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
                                <option value="Operativo">Operativo</option>
                                <option value="Inoperativo">Inoperativo</option>
                                <option value="Mantenimiento">Mantenimiento</option>
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
                                <span className="text-xs font-bold text-primary">Cargando vehículos...</span>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#F3E8EB] bg-[#FCFCFD]">
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase pl-6">
                                    VEHICULO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    PLACA
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    CONDUCTOR
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    ESTADO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase text-center pr-6">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3E8EB]">
                            {vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                                        No se encontraron vehículos que coincidan con los filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#FCFCFD]/50 transition-colors">
                                        {/* Vehicle Info Column */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-150 shrink-0 bg-gray-50 flex items-center justify-center">
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
                                        </td>

                                        {/* License Plate Badge Column */}
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-[#F9FAFB] border border-[#F3E8EB] text-gray-800 tracking-wider">
                                                {item.placa}
                                            </span>
                                        </td>

                                        {/* Driver Info Column */}
                                        <td className="p-4 text-xs">
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
                                        </td>

                                        {/* Status Badge Column */}
                                        <td className="p-4">
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
                                        </td>

                                        {/* Actions Button & Menu */}
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
                                                                setSelectedVehicle(item);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            Ver Detalle
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
                                Mostrando {startIndex}–{endIndex} de {totalItems} vehículos registrados
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

            {selectedVehicle && (
                <VehicleDetails
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
}