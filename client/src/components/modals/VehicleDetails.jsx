import React from "react";
import { X, Car, Calendar, User, Info } from "lucide-react";

export default function VehicleDetails({ vehicle, onClose }) {
    if (!vehicle) return null;

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
                        DETALLES DEL VEHÍCULO
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

                    {/* Top Section: Grid for Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                        {/* Left Side (6 Cols): Vehicle Photo and Main Info */}
                        <div className="md:col-span-6 space-y-4">
                            <div className="relative rounded-2xl overflow-hidden border border-gray-150 shadow-xs h-40 bg-gray-50 flex items-center justify-center">
                                {vehicle.foto_vehiculo ? (
                                    <img
                                        src={vehicle.foto_vehiculo}
                                        alt={`${vehicle.marca} ${vehicle.modelo}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Car className="w-16 h-16 text-gray-300" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    Vehículo:
                                </span>
                                <h3 className="text-xl font-black text-[#8A1538] leading-tight">
                                    {vehicle.marca} {vehicle.modelo}
                                </h3>
                                <div className="pt-1">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-[#F9FAFB] border border-[#F3E8EB] text-gray-800 tracking-wider">
                                        {vehicle.placa}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side (6 Cols): Technical Specs & Conductor */}
                        <div className="md:col-span-6 space-y-6 border-l border-dashed border-gray-100 md:pl-6">
                            
                            {/* Technical Specs */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Especificaciones Técnicas:
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#FCFCFD] p-3 rounded-xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Año</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{vehicle.año || "N/D"}</p>
                                    </div>
                                    <div className="bg-[#FCFCFD] p-3 rounded-xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Asientos</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{vehicle.num_asientos || "N/D"}</p>
                                    </div>
                                    <div className="bg-[#FCFCFD] p-3 rounded-xl border border-gray-100 col-span-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Maletero Amplio</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">
                                            {vehicle.maletero_amplio === true || vehicle.maletero_amplio === "Sí" || vehicle.maletero_amplio === "si" ? "Sí" : "No"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Detail */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Conductor Asignado:
                                </span>
                                {vehicle.ci_driver ? (
                                    <div className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center shadow-xs">
                                            {vehicle.foto_driver ? (
                                                <img
                                                    src={vehicle.foto_driver}
                                                    alt={vehicle.driverName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-black text-gray-800 leading-tight">
                                                {vehicle.driverName}
                                            </h4>
                                            <p className="text-[10px] text-gray-450 font-bold tracking-wide">
                                                CI: {vehicle.ci_driver}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-3 flex items-center justify-center bg-gray-50/50">
                                        <span className="text-xs font-semibold text-gray-400 italic">
                                            No asignado
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Bottom Section: Date and Status */}
                    <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400">Fecha de Registro:</span>
                            <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {vehicle.fecha || "No disponible"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400">Estado:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                                vehicle.estado === "Operativo"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : vehicle.estado === "Mantenimiento"
                                        ? "bg-amber-50 text-amber-700 border-amber-100"
                                        : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                                {vehicle.estado}
                            </span>
                        </div>
                    </div>

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
