import { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, Building, Loader2 } from "lucide-react";
import Input from "../inputs/Input";
import Select from "../inputs/Select";

export default function UserForm({
    onSubmit,
    onCancel,
    isLoading = false,
    locations = [],
    errorMsg = "",
    initialData = null,
    isEdit = false,
    hasExternalChanges = false
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [ci, setCi] = useState("");
    const [telefono, setTelefono] = useState("");
    const [idGerencia, setIdGerencia] = useState("");
    const [role, setRole] = useState("");

    // Load initial data for editing
    useEffect(() => {
        if (initialData) {
            setEmail(initialData.email || initialData.correo || "");
            setFullName(
                initialData.fullName ||
                (initialData.primer_nombre ? `${initialData.primer_nombre} ${initialData.apellido || ""}`.trim() : "") ||
                ""
            );
            setCi(initialData.ci || initialData.ci_user || "");
            setTelefono(initialData.telefono || initialData.telf || "");
            setIdGerencia(initialData.idGerencia || initialData.id_gerencia || "");
        }
    }, [initialData]);

    // Errors state
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        fullName: "",
        ci: "",
        telefono: "",
        idGerencia: ""
    });

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{6,}$/;
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{4,60}$/;
    const ciRegex = /^\d{6,9}$/;

    // Validators
    const validateEmail = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El correo electrónico es requerido.";
        if (!emailRegex.test(val)) return "El formato del correo electrónico no es válido.";
        return "";
    };

    const validatePassword = (val) => {
        if (isEdit && !val) return ""; // Password is optional when editing
        if (!val) return "La contraseña es requerida.";
        if (!passwordRegex.test(val)) return "La contraseña debe tener al menos 6 caracteres.";
        return "";
    };

    const validateFullName = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El nombre completo es requerido.";
        const trimmed = val.trim();
        if (trimmed.split(/\s+/).length < 2) return "Ingrese el nombre completo (mínimo nombre y apellido).";
        if (!nameRegex.test(trimmed)) return "El nombre debe contener entre 4 y 60 caracteres alfabéticos.";
        return "";
    };

    const validateCi = (val) => {
        if (isEdit) return "";
        if (!val) return "La cédula de identidad es requerida.";
        if (!ciRegex.test(val)) return "La cédula debe contener entre 6 y 9 dígitos.";
        return "";
    };

    const validateTelefono = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "El número telefónico es requerido.";
        const stripped = val.replace(/[\s\-+]/g, "");
        if (!/^\d{10,15}$/.test(stripped)) return "El teléfono debe contener entre 10 y 15 dígitos numéricos.";
        return "";
    };

    const validateGerencia = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "Debe seleccionar una gerencia o departamento.";
        return "";
    };

    const validateRole = (val) => {
        if (isEdit && !val) return "";
        if (!val) return "Debe seleccionar un rol.";
        return "";
    };

    // Form validation check
    const isFormFilled = isEdit || (email && password && fullName && ci && telefono && idGerencia);
    const isDirty = !isEdit || (
        email !== (initialData?.email || initialData?.correo || "") ||
        password !== "" ||
        fullName !== (
            initialData?.fullName ||
            (initialData?.primer_nombre ? `${initialData.primer_nombre} ${initialData.apellido || ""}`.trim() : "") ||
            ""
        ) ||
        telefono !== (initialData?.telefono || initialData?.telf || "") ||
        idGerencia !== (initialData?.idGerencia || initialData?.id_gerencia || "") ||
        hasExternalChanges
    );
    const hasAnyError = !!(errors.email || errors.password || errors.fullName || errors.ci || errors.telefono || errors.idGerencia);
    const isSubmitDisabled = !isFormFilled || !isDirty || hasAnyError || isLoading;

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();

        // Final checks
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        const nameErr = validateFullName(fullName);
        const ciErr = validateCi(ci);
        const telErr = validateTelefono(telefono);
        const gerErr = validateGerencia(idGerencia);

        if (emailErr || passErr || nameErr || ciErr || telErr || gerErr) {
            setErrors({
                email: emailErr,
                password: passErr,
                fullName: nameErr,
                ci: ciErr,
                telefono: telErr,
                idGerencia: gerErr
            });
            return;
        }

        onSubmit({
            email,
            password,
            fullName,
            ci,
            telefono,
            idGerencia
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
                <User className="w-5 h-5 text-[#8A1538]" />
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Información Personal
                </h3>
            </div>

            <div className="space-y-4">
                {/* Email input */}
                <Input
                    id="email"
                    label="CORREO ELECTRONICO"
                    required={!isEdit}
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                    error={errors.email}
                    placeholder="correo@correo.com"
                    icon={Mail}
                />

                {/* Password input */}
                <div className="relative">
                    <Input
                        id="password"
                        label="CONTRASEÑA"
                        required={!isEdit}
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, password: validatePassword(password) }))}
                        error={errors.password}
                        placeholder={isEdit ? "Escriba una nueva contraseña (opcional)" : "Contraseña"}
                        icon={Lock}
                    />
                </div>

                <Select
                    id="role"
                    label="ROLE DE USUARIO"
                    required={!isEdit}
                    value={role}
                    onChange={(val) => {
                        setRole(val);
                        setErrors(prev => ({ ...prev, role: validateRole(val) }));
                    }}
                    onBlur={() => setErrors(prev => ({ ...prev, role: validateRole(role) }))}
                    error={errors.role}
                    icon={Building}
                    placeholder="Seleccione una opción"
                    options={[{ value: "Pasajero", label: "Pasajero" }, { value: "Conductor", label: "Conductor" }]}
                />

                {/* Name and CI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="fullName"
                        label="NOMBRE COMPLETO"
                        required={!isEdit}
                        value={fullName}
                        onChange={(e) => {
                            setFullName(e.target.value);
                            setErrors(prev => ({ ...prev, fullName: validateFullName(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, fullName: validateFullName(fullName) }))}
                        error={errors.fullName}
                        placeholder="Alejandro Garcia"
                        icon={User}
                    />
                    <Input
                        id="ci"
                        label="CEDULA DE IDENTIDAD"
                        required={!isEdit}
                        disabled={isEdit}
                        value={ci}
                        onChange={(e) => {
                            setCi(e.target.value);
                            setErrors(prev => ({ ...prev, ci: validateCi(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, ci: validateCi(ci) }))}
                        error={errors.ci}
                        placeholder="20345678"
                        icon={User}
                    />
                </div>

                {/* Phone and Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="telefono"
                        label="NUMERO TELEFONICO"
                        required={!isEdit}
                        value={telefono}
                        onChange={(e) => {
                            setTelefono(e.target.value);
                            setErrors(prev => ({ ...prev, telefono: validateTelefono(e.target.value) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, telefono: validateTelefono(telefono) }))}
                        error={errors.telefono}
                        placeholder="+58 412-230413"
                        icon={Phone}
                    />

                    <Select
                        id="idGerencia"
                        label="GERENCIA O DEPARTAMENTO"
                        required={!isEdit}
                        value={idGerencia}
                        onChange={(val) => {
                            setIdGerencia(val);
                            setErrors(prev => ({ ...prev, idGerencia: validateGerencia(val) }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, idGerencia: validateGerencia(idGerencia) }))}
                        error={errors.idGerencia}
                        icon={Building}
                        placeholder="Seleccione una opción"
                        options={locations.map(loc => ({ value: loc.id, label: loc.nombre }))}
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
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
