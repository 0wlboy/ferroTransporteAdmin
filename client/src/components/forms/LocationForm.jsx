import { useState } from "react";
import { Loader2, Crosshair } from "lucide-react";
import Input from "../inputs/Input";

export default function LocationForm({
    onSubmit,
    onCancel,
    isLoading = false,
    errorMsg = "",
    onCoordinatesChange
}) {
    const [name, setName] = useState("");
    const [lng, setLng] = useState("");
    const [lat, setLat] = useState("");

    // Errors state
    const [errors, setErrors] = useState({
        name: "",
        lng: "",
        lat: ""
    });

    // Validation patterns
    const nameRegex = /^[a-zA-Z0-9À-ÿ\s-]{2,60}$/;
    const latRegex = /^(-?\d{1,3}(\.\d+)?)$/;
    const lngRegex = /^(-?\d{1,3}(\.\d+)?)$/;

    // Validators
    const validateName = (val) => {
        if (!val) return "El nombre es requerido.";
        if (!nameRegex.test(val)) return "El nombre debe contener entre 2 y 60 caracteres.";
        return "";
    };

    const validateLat = (val) => {
        if (!val) return "La latitud es requerida.";
        if (!latRegex.test(val)) return "La latitud debe ser un número válido.";
        const num = parseFloat(val);
        if (num < -90 || num > 90) return "La latitud debe estar entre -90 y 90.";
        return "";
    };

    const validateLng = (val) => {
        if (!val) return "La longitud es requerida.";
        if (!lngRegex.test(val)) return "La longitud debe ser un número válido.";
        const num = parseFloat(val);
        if (num < -180 || num > 180) return "La longitud debe estar entre -180 y 180.";
        return "";
    };

    // Form validation check
    const isFormFilled = name && lng && lat;
    const hasAnyError = !!(errors.name || errors.lng || errors.lat);
    const isSubmitDisabled = !isFormFilled || hasAnyError || isLoading;

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();

        // Final checks
        const nameErr = validateName(name);
        const lngErr = validateLng(lng);
        const latErr = validateLat(lat);

        if (nameErr || lngErr || latErr) {
            setErrors({
                name: nameErr,
                lng: lngErr,
                lat: latErr,
            });
            return;
        }

        onSubmit({
            name,
            lng,
            lat
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 select-none">
            {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 animate-fade-in">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-4">
                {/* Location Name Field (No icon) */}
                <Input
                    id="name"
                    label="NOMBRE DE LA LOCALIZACIÓN"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setErrors(prev => ({ ...prev, name: validateName(e.target.value) }));
                    }}
                    onBlur={() => setErrors(prev => ({ ...prev, name: validateName(name) }))}
                    error={errors.name}
                    placeholder="Ej. Terminal Norte Central"
                />

                {/* Latitud and Longitud Grid Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="lat"
                        label="LATITUD"
                        required
                        type="text"
                        value={lat}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLat(val);
                            setErrors(prev => ({ ...prev, lat: validateLat(val) }));
                            if (onCoordinatesChange) {
                                onCoordinatesChange({ lat: val, lng });
                            }
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, lat: validateLat(lat) }))}
                        error={errors.lat}
                        placeholder="0.000000"
                        icon={Crosshair}
                    />

                    <Input
                        id="lng"
                        label="LONGITUD"
                        required
                        type="text"
                        value={lng}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLng(val);
                            setErrors(prev => ({ ...prev, lng: validateLng(val) }));
                            if (onCoordinatesChange) {
                                onCoordinatesChange({ lat, lng: val });
                            }
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, lng: validateLng(lng) }))}
                        error={errors.lng}
                        placeholder="0.000000"
                        icon={Crosshair}
                    />
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="flex-1 py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-bold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        "Guardar"
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-white border border-[#8A1538] text-[#8A1538] hover:bg-[#FAF5F6] font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
