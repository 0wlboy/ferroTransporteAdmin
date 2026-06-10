import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useGetUserActivity from "../../hooks/useGetUserActivity";
import { 
    Search, 
    FileDown, 
    MoreVertical, 
    ChevronLeft, 
    ChevronRight, 
    Car, 
    User, 
    X,
    ArrowLeft
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        startIndex,
        endIndex,
        paginatedPetitions,
        userTotalTrips,
        userCancelledTrips,
        sortedPetitions
    } = useGetUserActivity(userId, 4);

    // PDF Export
    const handlePrintPDF = () => {
        if (!userProfile) return;
        
        const doc = new jsPDF();
        doc.text(`Reporte de Actividad - ${userProfile.fullName}`, 60, 10);
        doc.text(`CI: ${userProfile.ci_user || "N/D"} | Rol: ${userProfile.role || "N/D"}`, 65, 15);
        doc.text("Fecha Emisión: " + new Date().toLocaleDateString(), 75, 20);

        const tableData = sortedPetitions.map(p => [
            p.id,
            p.passengerName,
            p.origen_nombre,
            p.destino_nombre,
            p.fecha,
            p.estado
        ]);

        const tableHeaders = ["ID", "Pasajero", "Origen", "Destino", "Fecha/Hora", "Estado"];

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 25,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [138, 21, 56] }
        });
        doc.save(`actividad_${userProfile.fullName.replace(/\s+/g, "_")}.pdf`);
    };

    const handleEditUser = () => {
        alert(`Editar usuario: ${userProfile?.fullName} (ID: ${userProfile?.id})`);
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

    // Page rendering for page buttons [1, 2, 3...]
    const renderPageNumbers = () => {
        const pages = [];
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

        // Ellipsis pagination
        pages.push(
            <button
                key={1}
                onClick={() => setPage(1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === 1
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
            >
                1
            </button>
        );

        if (page > 3) {
            pages.push(<span key="el1" className="text-gray-400 text-xs px-1">...</span>);
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);
        for (let i = start; i <= end; i++) {
            if (i === 1 || i === totalPages) continue;
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === i
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                    }`}
                >
                    {i}
                </button>
            );
        }

        if (page < totalPages - 2) {
            pages.push(<span key="el2" className="text-gray-400 text-xs px-1">...</span>);
        }

        pages.push(
            <button
                key={totalPages}
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === totalPages
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
            >
                {totalPages}
            </button>
        );

        return pages;
    };

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
                    <button
                        onClick={handlePrintPDF}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary hover:bg-primary-light transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs"
                    >
                        <FileDown className="w-4 h-4 text-primary" />
                        <span>EXPORTA A PDF</span>
                    </button>
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
                    
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-150 shrink-0 bg-gray-55 flex items-center justify-center shadow-xs">
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

            {/* Filter and Search Bar Section */}
            <div className="bg-white rounded-2xl border border-[#F3E8EB] p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                
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

                {/* Sorting and Filter dropdowns */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">Ordenado por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all cursor-pointer"
                        >
                            <option value="fecha_asc">Fecha Ascendente</option>
                            <option value="fecha_desc">Fecha Descendente</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">Filtrar por:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all cursor-pointer"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Camino">En Camino</option>
                            <option value="En viaje">En Viaje</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-white rounded-2xl border border-[#F3E8EB] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#FCFCFD] border-b border-[#F3E8EB] select-none">
                                <th className="p-4 pl-6 text-[10px] font-black text-primary tracking-wider uppercase">
                                    PASAJERO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    DESTINO
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    ORIGEN
                                </th>
                                <th className="p-4 text-[10px] font-black text-primary tracking-wider uppercase">
                                    FECHA
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
                            {loadingPetitions ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Cargando peticiones...
                                    </td>
                                </tr>
                            ) : paginatedPetitions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                        No se encontraron actividades registradas.
                                    </td>
                                </tr>
                            ) : (
                                paginatedPetitions.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#FCFCFD]/50 transition-colors">
                                        
                                        {/* Pasajero Column */}
                                        <td className="p-4 pl-6">
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
                                        </td>

                                        {/* Destino Column */}
                                        <td className="p-4 text-xs font-extrabold text-gray-900">
                                            {item.destino_nombre}
                                        </td>

                                        {/* Origen Column */}
                                        <td className="p-4 text-xs font-extrabold text-gray-900">
                                            {item.origen_nombre}
                                        </td>

                                        {/* Fecha Column */}
                                        <td className="p-4 text-xs">
                                            <p className="font-semibold text-gray-750">
                                                {item.fecha ? item.fecha.split(" ")[0] : ""}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                {item.fecha ? item.fecha.slice(11) : ""}
                                            </p>
                                        </td>

                                        {/* Estado Column */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                                                item.estado?.toLowerCase() === "completado" || item.estado?.toLowerCase() === "completada"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : item.estado?.toLowerCase() === "pendiente"
                                                        ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                                                        : item.estado?.toLowerCase() === "en camino" || item.estado?.toLowerCase() === "en viaje"
                                                            ? "bg-blue-50 text-blue-700 border-blue-100"
                                                            : "bg-red-50 text-red-700 border-red-100"
                                            }`}>
                                                {item.estado?.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Acciones Column */}
                                        <td className="p-4 text-center pr-6 relative">
                                            <button
                                                onClick={() => alert(`Acción sobre petición ID: ${item.id}`)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 transition-colors cursor-pointer inline-flex items-center justify-center"
                                            >
                                                <MoreVertical className="w-4.5 h-4.5" />
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer and Pagination Controls */}
                <div className="p-4 border-t border-[#F3E8EB] bg-[#FCFCFD] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[11px] font-semibold text-gray-400">
                        {totalItems > 0 ? (
                            <span>
                                Mostrando {startIndex}–{endIndex} de {totalItems} peticiones hechas
                            </span>
                        ) : (
                            <span>No hay registros disponibles</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {renderPageNumbers()}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
