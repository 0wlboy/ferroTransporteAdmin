import { X, Mail, Phone, Calendar, User, Landmark } from "lucide-react";

export default function PassengerDetails({ passenger, onClose }) {
    if (!passenger) return null;

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
            <div className="bg-white rounded-3xl border border-[#F3E8EB] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">

                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-[#F3E8EB]">
                    <h2 className="text-[#8A1538] font-black text-sm tracking-widest uppercase">
                        DETALLES DEL PASAJERO
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-6 flex-1 overflow-y-auto flex flex-col items-center">

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-primary-light shadow-md shrink-0 bg-gray-50 flex items-center justify-center">
                        {passenger.foto_url ? (
                            <img
                                src={passenger.foto_url}
                                alt={`${passenger.nombre} ${passenger.apellido}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                    </div>

                    {/* Name & CI */}
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-black text-[#8A1538] leading-tight">
                            {passenger.nombre} {passenger.apellido}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold tracking-wide">
                            CI: {passenger.ci_user}
                        </p>
                    </div>

                    {/* Separator */}
                    <div className="w-full border-t border-[#F3E8EB] my-2" />

                    {/* Contact Specs */}
                    <div className="w-full space-y-4 px-2">
                        {/* Gerencia Row */}
                        <div className="flex items-center gap-3">
                            <Landmark className="w-5 h-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Gerencia / Departamento</p>
                                <span className="text-xs font-bold text-gray-700 leading-tight">
                                    {passenger.localizacion || "No asignada"}
                                </span>
                            </div>
                        </div>

                        {/* Email Row */}
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Correo Electrónico</p>
                                <span className="text-xs font-semibold text-gray-500 truncate select-text leading-tight">
                                    {passenger.correo || "No disponible"}
                                </span>
                            </div>
                        </div>

                        {/* Phone Row */}
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Teléfono</p>
                                <span className="text-xs font-semibold text-gray-500 select-text leading-tight">
                                    {passenger.telefono || "No disponible"}
                                </span>
                            </div>
                        </div>

                        {/* Registered Date Row */}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary shrink-0" />
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Fecha de Registro</p>
                                <span className="text-xs font-semibold text-gray-500 leading-tight">
                                    {passenger.fecha || "No disponible"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-2 flex justify-center w-full">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                            passenger.activo === true
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-gray-50 text-gray-700 border-gray-150"
                        }`}>
                            {passenger.activo ? "Activo" : "Inactivo"}
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
