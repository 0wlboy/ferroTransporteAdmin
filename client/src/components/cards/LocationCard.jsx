import { MapPin, CornerUpRight, Trash2 } from "lucide-react";

export function LocationCard({ location, onEdit, onDelete }) {
    if (!location) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#F3E8EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative">

            {/* Top Row: Name and Status Badge */}
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                    {location.nombre || "Localización"}
                </h3>
                <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${location.activo
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-gray-200 text-gray-650"
                    }`}>
                    {location.activo ? "Activo" : "Inactivo"}
                </span>
            </div>

            {/* Middle Section: Coordinates and Trips */}
            <div className="mt-5 space-y-3.5">
                {/* Coordinates */}
                <div className="flex items-center gap-2.5 text-gray-500">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-gray-600">
                        {location.lat && location.lng
                            ? `${location.lat}° N, ${location.lng}° W`
                            : "Sin coordenadas"}
                    </span>
                </div>

                {/* Trips */}
                <div className="flex items-center gap-2.5 text-gray-500">
                    <CornerUpRight className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-gray-600">
                        Viajes Realizados: <span className="font-extrabold text-primary">{location.num_trips ?? 0}</span>
                    </span>
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-6 flex items-center justify-between gap-4">
                <button
                    onClick={() => onEdit && onEdit(location)}
                    className="flex-1 py-2 px-4 border border-primary text-primary hover:bg-primary-light transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer text-center shadow-xs"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete && onDelete(location.id)}
                    className="p-2.5 border border-primary text-primary hover:bg-[#FAF5F6] transition-all rounded-xl cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
                >
                    <Trash2 className="w-4.5 h-4.5 text-primary" />
                </button>
            </div>
        </div>
    );
}
