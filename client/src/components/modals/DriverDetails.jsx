import React from "react";
import { X, Mail, Phone, Calendar, User, Landmark, Car } from "lucide-react";

export default function DriverDetails({ driver, onClose }) {
    if (!driver) return null;

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
                        DETALLES DEL CONDUCTOR
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

                    {/* Top Section: Grid for Driver and Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                        {/* Left Side (6 Cols): Driver Profile info */}
                        <div className="md:col-span-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-primary-light shadow-md shrink-0 bg-gray-55 flex items-center justify-center">
                                {driver.foto_url ? (
                                    <img
                                        src={driver.foto_url}
                                        alt={`${driver.nombre} ${driver.apellido}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#8A1538] leading-tight">
                                    {driver.nombre} {driver.apellido}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold tracking-wide">
                                    CI: {driver.ci_user}
                                </p>
                            </div>

                            <div className="w-full border-t border-[#F3E8EB] pt-4 text-left space-y-3.5">
                                {/* Gerencia Row */}
                                <div className="flex items-center gap-3">
                                    <Landmark className="w-5 h-5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Gerencia / Departamento</p>
                                        <span className="text-xs font-bold text-gray-750 leading-tight">
                                            {driver.localizacion || "No asignada"}
                                        </span>
                                    </div>
                                </div>

                                {/* Email Row */}
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Correo Electrónico</p>
                                        <span className="text-xs font-semibold text-gray-500 truncate select-text leading-tight">
                                            {driver.correo || "No disponible"}
                                        </span>
                                    </div>
                                </div>

                                {/* Phone Row */}
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Teléfono</p>
                                        <span className="text-xs font-semibold text-gray-500 select-text leading-tight">
                                            {driver.telefono || "No disponible"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side (6 Cols): Assigned Vehicle details */}
                        <div className="md:col-span-6 space-y-5 border-l border-dashed border-gray-100 md:pl-6 h-full flex flex-col justify-between">
                            
                            {/* Vehicle assigned image block */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Vehículo Asignado:
                                </span>
                                {driver.vehiculo_placa ? (
                                    <div className="space-y-3">
                                        <div className="relative rounded-2xl overflow-hidden border border-gray-150 shadow-xs h-36 bg-gray-50 flex items-center justify-center">
                                            {driver.vehiculo_foto ? (
                                                <img
                                                    src={driver.vehiculo_foto}
                                                    alt="Vehículo asignado"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Car className="w-12 h-12 text-gray-300" />
                                            )}
                                            <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase font-mono">
                                                {driver.vehiculo_placa}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 h-36 flex items-center justify-center bg-gray-50/50">
                                        <span className="text-xs font-semibold text-gray-400 italic">
                                            Sin vehículo asignado
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Registered date */}
                            <div className="bg-[#FCFCFD] border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Fecha de Registro</p>
                                    <span className="text-xs font-bold text-gray-800 leading-tight">
                                        {driver.fecha || "No disponible"}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Status Row */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">Estado:</span>
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                            driver.activo === true
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-gray-50 text-gray-700 border-gray-150"
                        }`}>
                            {driver.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                </div>

                {/* Modal Footer */}
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
