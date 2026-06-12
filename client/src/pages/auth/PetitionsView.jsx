import { useState } from "react";
import { usePaginatePetitions } from "../../hooks/usePaginatePetitions";
import StatCard from "../../components/cards/StatCard";
import PetitionDetails from "../../components/modals/PetitionDetails";
import DataList from "../../components/UI/DataList";
import {
    FileDown,
    MoreVertical,
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

    // State for controlling active row action menu and details modal
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [selectedPetition, setSelectedPetition] = useState(null);

    // Columns configuration for DataList table
    const headers = [
        {
            label: "Pasajero",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-55 flex items-center justify-center">
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
                        <p className="text-[10px] text-gray-405 font-semibold mt-0.5">
                            Ci: {item.ci_pasajero}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: "Conductor",
            render: (item) => (
                item.driverName ? (
                    <div>
                        <p className="font-semibold text-gray-700">
                            {item.driverName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold text-gray-450 mt-0.5">
                            Ci: {item.ci_driver}
                        </p>
                        {item.placa_vehiculo && (
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                Placa: <span className="font-semibold text-gray-505">{item.placa_vehiculo}</span>
                            </p>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400 font-medium italic text-[11px]">
                        No asignado
                    </span>
                )
            )
        },
        {
            label: "Fecha",
            render: (item) => (
                <span className="text-xs font-semibold text-gray-500">
                    {item.fecha}
                </span>
            )
        },
        {
            label: "Estado",
            render: (item) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                        item.estado === "Completado"
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
            )
        },
        {
            label: "Prioridad",
            render: (item) => (
                <span
                    className={`text-[10px] font-extrabold tracking-wider ${
                        item.prioridad === "Alta"
                            ? "text-red-600"
                            : item.prioridad === "Media"
                            ? "text-blue-600"
                            : "text-gray-505"
                    }`}
                >
                    {item.prioridad}
                </span>
            )
        },
        {
            label: "Acciones",
            className: "text-center pr-6 relative",
            render: (item) => (
                <div className="relative inline-block text-left">
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

                    {activeMenuId === item.id && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in text-left">
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
                                    className="block w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer border-t border-gray-100"
                                >
                                    Asignar Conductor
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Cancelar petición ${item.id}`);
                                        setActiveMenuId(null);
                                    }}
                                    className="block w-full px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 transition-colors cursor-pointer border-t border-gray-100"
                                >
                                    Cancelar Viaje
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

            {/* Reusable DataList Component */}
            <DataList
                data={petitions}
                loading={loading}
                headers={headers}
                noDataMessage="No se encontraron peticiones que coincidan con los filtros aplicados."
                loadingMessage="Cargando peticiones..."
                filters={{
                    search: {
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Buscar por cedula o placa...",
                    },
                    selects: [
                        {
                            label: "Ordenado por:",
                            value: sortBy,
                            onChange: setSortBy,
                            options: [
                                { value: "fecha_desc", label: "Fecha Descendente" },
                                { value: "fecha_asc", label: "Fecha Ascendente" },
                                { value: "pasajero_asc", label: "Pasajero (A-Z)" },
                            ],
                        },
                        {
                            label: "Filtrar por:",
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: "all", label: "Todos los Estados" },
                                { value: "En Camino", label: "En Camino" },
                                { value: "Pendiente", label: "Pendiente" },
                                { value: "Completado", label: "Completado" },
                                { value: "Cancelado", label: "Cancelado" },
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
                    itemTypeName: "peticiones hechas",
                }}
            />

            {selectedPetition && (
                <PetitionDetails
                    petition={selectedPetition}
                    onClose={() => setSelectedPetition(null)}
                />
            )}
        </div>
    );
}