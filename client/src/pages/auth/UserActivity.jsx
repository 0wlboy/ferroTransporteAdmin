import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useGetUserActivity from "../../hooks/useGetUserActivity";
import DataList from "../../components/UI/DataList";
import ExportDropdown from "../../components/UI/ExportDropdown";
import { exportToExcel } from "../../../utils/excelExport";
import { exportToPDF } from "../../../utils/pdfExport";
import {
    MoreVertical,
    Car,
    User,
    X,
    ArrowLeft
} from "lucide-react";

export default function UserActivity() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const userId = id || searchParams.get("id");

    const {
        userProfile,
        loadingUser,
        userError,
        loadingPetitions,
        globalStats,
        page,
        setPage,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        totalPages,
        totalItems,
        paginatedPetitions,
        userTotalTrips,
        userCancelledTrips,
        sortedPetitions
    } = useGetUserActivity(userId, 4);

    // PDF Export
    const handlePrintPDF = () => {
        if (!userProfile) return;

        const tableData = sortedPetitions.map(p => [
            p.id,
            p.passengerName || "N/D",
            p.origen_nombre || "N/D",
            p.destino_nombre || "N/D",
            p.fecha || "N/D",
            p.estado || "PENDIENTE"
        ]);

        const tableHeaders = ["ID", "Pasajero", "Origen", "Destino", "Fecha/Hora", "Estado"];

        exportToPDF({
            title: `Reporte de Actividad - ${userProfile.fullName}`,
            subtitles: [
                `CI: ${userProfile.ci_user || "N/D"} | Rol: ${userProfile.role || "N/D"}`
            ],
            headers: tableHeaders,
            data: tableData,
            fileName: `actividad_${userProfile.fullName.replace(/\s+/g, "_")}`
        });
    };

    const handleExportExcel = () => {
        if (!userProfile) return;

        const exportData = sortedPetitions.map(p => ({
            "ID Petición": p.id,
            "CI Pasajero": p.ci_pasajero || "",
            "Pasajero": p.passengerName || "",
            "Pasajeros Totales": (p.num_acompañantes || 0) + 1,
            "CI Conductor": p.ci_driver || "No asignado",
            "Conductor": p.driverName || "No asignado",
            "Origen": p.origen_nombre || "",
            "Destino": p.destino_nombre || "",
            "Carga / Descripción": p.carga || p.descripcion || "Ninguna",
            "Fecha/Hora": p.fecha || "",
            "Estado": p.estado || ""
        }));
        exportToExcel(exportData, `Actividad_${userProfile.fullName.replace(/\s+/g, "_")}`);
    };

    const handleEditUser = () => {
        if (userId) {
            navigate(`/update-user/${userId}`);
        }
    };

    if (loadingUser) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm mt-4">Cargando información del usuario...</p>
            </div>
        );
    }

    if (userError || !userProfile) {
        return (
            <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 text-center max-w-md mx-auto mt-12 shadow-xs">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-950">Error al cargar</h3>
                <p className="text-gray-500 text-sm mt-2">{userError || "Usuario no disponible."}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-primary-hover transition-colors"
                >
                    Volver Atrás
                </button>
            </div>
        );
    }

    // Columns configuration for DataList table
    const headers = [
        {
            label: "PASAJERO",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-150 shrink-0 bg-gray-55 flex items-center justify-center shadow-xs">
                        {item.foto_pasajero ? (
                            <img
                                src={item.foto_pasajero}
                                alt={item.passengerName}
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
                        <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
                            Pasajeros: {item.num_acompañantes + 1}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: "DESTINO",
            render: (item) => (
                <span className="text-xs font-extrabold text-gray-900">
                    {item.destino_nombre}
                </span>
            )
        },
        {
            label: "ORIGEN",
            render: (item) => (
                <span className="text-xs font-extrabold text-gray-900">
                    {item.origen_nombre}
                </span>
            )
        },
        {
            label: "FECHA",
            render: (item) => (
                <div className="text-xs">
                    <p className="font-semibold text-gray-750">
                        {item.fecha ? item.fecha.split(" ")[0] : ""}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {item.fecha ? item.fecha.slice(11) : ""}
                    </p>
                </div>
            )
        },
        {
            label: "ESTADO",
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${item.estado?.toLowerCase() === "completado" || item.estado?.toLowerCase() === "completada"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : item.estado?.toLowerCase() === "pendiente"
                            ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                            : item.estado?.toLowerCase() === "en camino" || item.estado?.toLowerCase() === "en viaje"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                    {item.estado?.toUpperCase()}
                </span>
            )
        },
        /*{
            label: "ACCIONES",
            className: "text-center pr-6",
            render: (item) => (
                <button
                    onClick={() => alert(`Acción sobre petición ID: ${item.id}`)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-655 transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                    <MoreVertical className="w-4.5 h-4.5" />
                </button>
            )
        }*/
    ];

    return (
        <div className="space-y-8 animate-fade-in select-none">
            {/* Top Back Nav & Header Buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>VOLVER</span>
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Actividad del {userProfile.role}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Actividad del Usuario: <span className="font-extrabold text-gray-750">{userProfile.fullName}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportPDF={handlePrintPDF}
                        onExportExcel={handleExportExcel}
                    />
                    <button
                        onClick={handleEditUser}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs"
                    >
                        <span>EDITAR DE USUARIO</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: User Profile Info */}
                <div className="bg-white p-6 rounded-2xl border border-[#F3E8EB] shadow-xs flex justify-between items-center">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider block">
                            INFORMACION DEL USUARIO
                        </span>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">DEPARTAMENTO O GERENCIA:</p>
                            <p className="text-lg font-black text-gray-900 leading-tight mt-1">{userProfile.gerencia}</p>
                        </div>
                        <p className="text-xs text-gray-500 font-bold tracking-wide mt-1 font-mono">
                            CI: {userProfile.ci_user}
                        </p>
                    </div>

                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-155 shrink-0 bg-gray-55 flex items-center justify-center shadow-xs">
                        {userProfile.foto_url ? (
                            <img
                                src={userProfile.foto_url}
                                alt={userProfile.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-gray-300" />
                        )}
                    </div>
                </div>

                {/* Card 2: Total Trips */}
                <div className="bg-white p-6 rounded-2xl border border-[#F3E8EB] shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                            VIAJES DADOS EN TOTAL
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Car className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-4xl font-black text-gray-950 leading-none">{userTotalTrips}</h3>
                        <p className="text-[10px] text-gray-450 font-bold mt-1.5 leading-normal">
                            De {globalStats.totalToday} viajes hechos por todos los vehículos hoy
                        </p>
                    </div>
                </div>

                {/* Card 3: Cancelled Trips */}
                <div className="bg-white p-6 rounded-2xl border border-[#F3E8EB] shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                            SOLICITUDES CANCELADAS
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                            <X className="w-4 h-4 text-red-650" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-4xl font-black text-gray-950 leading-none">{userCancelledTrips}</h3>
                        <p className="text-[10px] text-red-650 font-bold mt-1.5 leading-normal bg-red-50/50 py-0.5 px-1.5 rounded-md border border-red-100/30 inline-block">
                            De {globalStats.cancelledToday} hechas hoy
                        </p>
                    </div>
                </div>
            </div>

            {/* Reusable DataList Component */}
            <DataList
                data={paginatedPetitions}
                loading={loadingPetitions}
                headers={headers}
                noDataMessage="No se encontraron actividades registradas."
                loadingMessage="Cargando peticiones..."
                filters={{
                    search: {
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Buscar por pasajero o destino...",
                    },
                    selects: [
                        {
                            label: "Ordenado por:",
                            value: sortBy,
                            onChange: setSortBy,
                            options: [
                                { value: "fecha_asc", label: "Fecha Ascendente" },
                                { value: "fecha_desc", label: "Fecha Descendente" },
                            ],
                        },
                        {
                            label: "Filtrar por:",
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: "all", label: "Todos los Estados" },
                                { value: "Pendiente", label: "Pendiente" },
                                { value: "En Camino", label: "En Camino" },
                                { value: "En viaje", label: "En Viaje" },
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
                    pageSize: 4,
                    setPage,
                    nextPage: () => setPage(p => Math.min(totalPages, p + 1)),
                    prevPage: () => setPage(p => Math.max(1, p - 1)),
                    itemTypeName: "peticiones hechas",
                }}
            />
        </div>
    );
}
