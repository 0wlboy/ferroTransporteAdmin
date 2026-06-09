import { X, User, Calendar } from "lucide-react";

export default function PetitionDetails({ petition, onClose }) {
    if (!petition) return null;

    // Handle background click to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none transition-opacity duration-300"
        >
            <div className="bg-white rounded-3xl border border-[#F3E8EB] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">

                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-[#F3E8EB]">
                    <h2 className="text-[#8A1538] font-black text-sm tracking-widest uppercase">
                        MAS INFORMACION
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">

                    {/* Top Section: Grid for Passenger/Driver Info and Route */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                        {/* Left Side (8 Cols): Passenger and Driver details */}
                        <div className="md:col-span-7 space-y-6">

                            {/* Passenger Detail */}
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
                                    {petition.foto_pasajero ? (
                                        <img
                                            src={petition.foto_pasajero}
                                            alt={petition.passengerName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Usuario:
                                    </span>
                                    <h3 className="text-xl font-black text-[#8A1538] leading-tight">
                                        {petition.passengerName}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Acompañantes: <span className="font-extrabold text-primary">{petition.num_acompañantes}</span>
                                        {petition.carga && (
                                            <>
                                                <span className="mx-2 text-gray-300">|</span>
                                                Carga: <span className="font-extrabold text-primary">{petition.carga}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Driver Detail */}
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
                                    {/* Fallback image representing the driver avatar */}
                                    <div className="w-full h-full bg-primary-light flex items-center justify-center">
                                        <img src={petition.foto_driver} alt={petition.driverName} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Conductor Asignado:
                                    </span>
                                    <h3 className="text-lg font-black text-gray-800 leading-tight">
                                        {petition.driverName}
                                    </h3>
                                    {petition.ci_driver && (
                                        <p className="text-[10px] text-gray-400 font-bold tracking-wide">
                                            CI: {petition.ci_driver}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Right Side (5 Cols): Route and Vehicle Image */}
                        <div className="md:col-span-5 space-y-6 border-l border-dashed border-gray-100 md:pl-6">

                            {/* Route details */}
                            <div className="flex flex-col relative pl-4">
                                {/* Route Dotted line indicator */}
                                <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 border-l-2 border-dotted border-[#8A1538]/40" />

                                <div className="relative mb-4">
                                    <span className="absolute -left-[19px] top-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-xs" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                        Origen:
                                    </span>
                                    <span className="text-sm font-extrabold text-gray-800">
                                        {petition.origen_nombre || "Ubicación Origen"}
                                    </span>
                                </div>

                                <div className="relative">
                                    <span className="absolute -left-[19px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                                        Destino:
                                    </span>
                                    <span className="text-sm font-extrabold text-gray-800">
                                        {petition.destino_nombre || "Ubicación Destino"}
                                    </span>
                                </div>
                            </div>

                            {/* Vehicle assigned image block */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Vehículo Asignado:
                                </span>
                                {petition.placa_vehiculo ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-150 shadow-xs h-24 bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={petition.foto_vehiculo}
                                            alt="Vehículo asignado"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase">
                                            {petition.placa_vehiculo}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 h-24 flex items-center justify-center bg-gray-50">
                                        <span className="text-xs font-semibold text-gray-450 italic">
                                            Sin vehículo
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Bottom Section: Date, Status, Priority */}
                    <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400">Fecha:</span>
                            <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {petition.fecha}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400">Estado:</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border ${petition.estado === "Completado"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : petition.estado === "Pendiente"
                                        ? "bg-gray-100 text-gray-600 border-gray-200/60"
                                        : petition.estado === "En camino"
                                            ? "bg-blue-50 text-blue-700 border-blue-100"
                                            : "bg-red-50 text-red-700 border-red-100"
                                    }`}>
                                    {petition.estado}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400">Prioridad:</span>
                                <span className={`text-xs font-black uppercase ${petition.prioridad === "Alta"
                                    ? "text-red-600"
                                    : petition.prioridad === "Media"
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    }`}>
                                    {petition.prioridad}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description/Motivo box */}
                    {petition.descripcion && (
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-semibold text-gray-400 block">Motivo:</span>
                            <div className="bg-[#FAF5F6] border border-[#FCE7EB] p-4 rounded-2xl text-xs font-medium text-gray-700 leading-relaxed shadow-inner">
                                {petition.descripcion}
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer (Cerrar Button) */}
                <div className="px-8 py-5 border-t border-[#F3E8EB] bg-[#FCFCFD] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#72102C] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    );
}
