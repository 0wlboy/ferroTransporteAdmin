import { useState, useEffect } from "react";
import { Car, Loader2, User, Building, Mail } from "lucide-react";
import Input from "../inputs/Input";

export default function CarForm({
    onSubmit,
    onCancel,
    isLoading = false,
    drivers = [],
    errorMsg = "",
    isEdit = false,
    initialData = null,
    hasExternalChanges = false
}) {
    const [placa, setPlaca] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [year, setYear] = useState("");
    const [numPuestos, setNumPuestos] = useState("");
    const [maletero, setMaletero] = useState("Si");
    const [ciDriver, setCiDriver] = useState("");

    // Load initial data for editing
    useEffect(() => {
        if (initialData) {
            setPlaca(initialData.placa || "");
            setMarca(initialData.marca || "");
            setModelo(initialData.modelo || "");
            setYear(initialData.año?.toString() || initialData.year?.toString() || "");
            setNumPuestos(initialData.num_asientos?.toString() || initialData.numPuestos?.toString() || "");
            setMaletero(initialData.maletero_amplio === true || initialData.maletero === "Si" ? "Si" : "No");
            setCiDriver(initialData.ci_driver || "");
        }
    }, [initialData]);

    // Errors state
    const [errors, setErrors] = useState({
        placa: "",
        marca: "",
        modelo: "",
        year: "",
        numPuestos: "",
        maletero: ""
    });

    // Validation patterns
    const placaRegex = /^[a-zA-Z0-9]{5,7}$/; // Standard license plates can be 5 to 7 characters
    const nameRegex = /^[a-zA-Z0-9À-ÿ\s-]{2,60}$/;
    const yearRegex = /^\d{4}$/;

    // Validators
    const validatePlaca = (val) => {
        if (isEdit) return "";
        if (!val) return "La placa es requerida.";
        if (!placaRegex.test(val)) return "La placa debe contener entre 5 y 7 caracteres alfanuméricos.";
        return "";
    };

    const validateMarca = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "La marca es requerida.";
        if (!nameRegex.test(val)) return "La marca debe contener entre 2 y 60 caracteres.";
        return "";
    };

    const validateModelo = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El modelo es requerido.";
        if (!nameRegex.test(val)) return "El modelo debe contener entre 2 y 60 caracteres.";
        return "";
    };

    const validateYear = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El año es requerido.";
        if (!yearRegex.test(val)) return "El año debe contener 4 dígitos.";
        const y = parseInt(val, 10);
        const currentYear = new Date().getFullYear();
        if (y < 1900 || y > currentYear + 2) return `El año debe ser realista (entre 1900 y ${currentYear + 1}).`;
        return "";
    };

    const validateNumPuestos = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El número de puestos es requerido.";
        const num = parseInt(val, 10);
        if (isNaN(num) || num <= 0 || num > 100) return "El número de puestos debe ser un número válido (entre 1 y 100).";
        return "";
    };

    const validateMaletero = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El maletero es requerido.";
        return "";
    };

    // Form validation check
    const isFormFilled = isEdit || (placa && marca && modelo && year && numPuestos && maletero);
    const isDirty = !isEdit || (
        marca !== (initialData?.marca || "") ||
        modelo !== (initialData?.modelo || "") ||
        year !== (initialData?.año?.toString() || initialData?.year?.toString() || "") ||
        numPuestos !== (initialData?.num_asientos?.toString() || initialData?.numPuestos?.toString() || "") ||
        (maletero === "Si") !== (initialData?.maletero_amplio === true) ||
        ciDriver !== (initialData?.ci_driver || "") ||
        hasExternalChanges
    );
    const hasAnyError = !!(errors.placa || errors.marca || errors.modelo || errors.year || errors.numPuestos || errors.maletero);
    const isSubmitDisabled = !isFormFilled || !isDirty || hasAnyError || isLoading;

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();

        // Final checks
        const placaErr = validatePlaca(placa);
        const marcaErr = validateMarca(marca);
        const modeloErr = validateModelo(modelo);
        const yearErr = validateYear(year);
        const numPuestosErr = validateNumPuestos(numPuestos);
        const maleteroErr = validateMaletero(maletero);

        if (placaErr || marcaErr || modeloErr || yearErr || numPuestosErr || maleteroErr) {
            setErrors({
                placa: placaErr,
                marca: marcaErr,
                modelo: modeloErr,
                year: yearErr,
                numPuestos: numPuestosErr,
                maletero: maleteroErr
            });
            return;
        }

        onSubmit({
            ci_driver: ciDriver || null,
            placa,
            marca,
            modelo,
            year,
            numPuestos,
            maletero
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 select-none">
            {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 animate-fade-in">
                    {errorMsg}
                </div>
            )}

            <div className="flex items-center gap-2 mb-6 border-b border-[#F3E8EB] pb-3">
                <Car className="w-5 h-5 text-[#8A1538]" />
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Información de Vehículo
                </h3>
            </div>

            <div className="space-y-4">
                {/* Placa and Marca Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="placa"
                        label="PLACA"
                        required={!isEdit}
                        disabled={isEdit}
                        type="text"
                        value={placa}
                        onChange={(e) => {
                            setPlaca(e.target.value);
                            setErrors(prev => ({ ...prev, placa: validatePlaca(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, placa: validatePlaca(placa) }))}
                        error={errors.placa}
                        placeholder="ABCD123"
                        icon={Mail}
                    />
                    <Input
                        id="marca"
                        label="MARCA"
                        required={!isEdit}
                        type="text"
                        value={marca}
                        onChange={(e) => {
                            setMarca(e.target.value);
                            setErrors(prev => ({ ...prev, marca: validateMarca(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, marca: validateMarca(marca) }))}
                        error={errors.marca}
                        placeholder="Toyota"
                        icon={Car}
                    />
                </div>

                {/* Modelo and Año Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="modelo"
                        label="MODELO"
                        required={!isEdit}
                        value={modelo}
                        onChange={(e) => {
                            setModelo(e.target.value);
                            setErrors(prev => ({ ...prev, modelo: validateModelo(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, modelo: validateModelo(modelo) }))}
                        error={errors.modelo}
                        placeholder="Corolla"
                        icon={Car}
                    />
                    <Input
                        id="year"
                        label="AÑO"
                        required={!isEdit}
                        value={year}
                        onChange={(e) => {
                            setYear(e.target.value);
                            setErrors(prev => ({ ...prev, year: validateYear(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, year: validateYear(year) }))}
                        error={errors.year}
                        placeholder="2020"
                        icon={Car}
                    />
                </div>

                {/* Puestos and Maletero Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="numPuestos"
                        label="NUMERO DE PUESTOS"
                        required={!isEdit}
                        type="number"
                        min="1"
                        max="100"
                        value={numPuestos}
                        onChange={(e) => {
                            setNumPuestos(e.target.value);
                            setErrors(prev => ({ ...prev, numPuestos: validateNumPuestos(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, numPuestos: validateNumPuestos(numPuestos) }))}
                        error={errors.numPuestos}
                        placeholder="4"
                        icon={Car}
                    />

                    {/* Reusable Select styled exactly as our Input component */}
                    <div className="flex flex-col w-full">
                        <label
                            htmlFor="maletero"
                            className="block text-xs font-semibold text-gray-700 mb-1.5 select-none"
                        >
                            MALETERO {!isEdit && <span className="text-[#8A1538] font-bold">*</span>}
                        </label>

                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                                <Building className="w-4.5 h-4.5 text-gray-400" />
                            </div>
                            <select
                                id="maletero"
                                value={maletero}
                                onChange={(e) => {
                                    setMaletero(e.target.value);
                                    setErrors(prev => ({ ...prev, maletero: validateMaletero(e.target.value) }));
                                }}
                                onBlur={() => setErrors(prev => ({ ...prev, maletero: validateMaletero(maletero) }))}
                                className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-gray-55 disabled:cursor-not-allowed cursor-pointer bg-[#F9FAFB] focus:bg-white text-gray-900 appearance-none ${errors.maletero
                                    ? "border-red-500 focus:border-red-600 focus:ring-red-500/10 text-red-900"
                                    : "border-gray-200 focus:border-[#8A1538] focus:ring-[#8A1538]/10 focus:text-gray-900"
                                    }`}
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="Si">Si</option>
                                <option value="No">No</option>
                            </select>

                            {/* Chevron Down helper for select */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {errors.maletero && (
                            <span className="text-red-600 text-[10px] font-black mt-1 pl-1 leading-none select-none animate-fade-in">
                                {errors.maletero}
                            </span>
                        )}
                    </div>
                </div>

                {/* Driver select dropdown */}
                <div className="flex flex-col w-full">
                    <label
                        htmlFor="ciDriver"
                        className="block text-xs font-semibold text-gray-700 mb-1.5 select-none"
                    >
                        CONDUCTOR ASIGNADO
                    </label>

                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                            <User className="w-4.5 h-4.5 text-gray-400" />
                        </div>
                        <select
                            id="ciDriver"
                            value={ciDriver}
                            onChange={(e) => setCiDriver(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:border-[#8A1538] focus:ring-[#8A1538]/10 bg-[#F9FAFB] focus:bg-white text-gray-900 appearance-none cursor-pointer"
                        >
                            <option value="">Por asignar (sin conductor)</option>
                            {drivers.map((d) => (
                                <option key={d.ci_user} value={d.ci_user}>
                                    {d.primer_nombre} {d.apellido} (CI: {d.ci_user})
                                </option>
                            ))}
                        </select>

                        {/* Chevron Down helper for select */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
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
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
