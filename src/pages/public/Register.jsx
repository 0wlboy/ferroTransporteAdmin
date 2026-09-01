import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/inputs/Input";
import ImagePicker from "../../components/inputs/ImgPicker";
import { User } from "lucide-react"

export default function Register() {
    const navigate = useNavigate();
    const { currentUser, register } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [primerNombre, setPrimerNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [ci, setCi] = useState("");
    const [telefono, setTelefono] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    // Validation states
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        primerNombre: "",
        apellido: "",
        ci: "",
        telefono: ""
    });
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            navigate("/petitions-view");
        }
    }, [currentUser, navigate]);

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{6,}$/;
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,30}$/;
    const ciRegex = /^\d{6,9}$/;
    const phoneRegex = /^\d{11}$/;

    const validateEmail = (val) => {
        if (!val) return "El correo electrónico es requerido.";
        if (!emailRegex.test(val)) return "El formato del correo electrónico no es válido.";
        return "";
    };

    const validatePassword = (val) => {
        if (!val) return "La contraseña es requerida.";
        if (!passwordRegex.test(val)) return "La contraseña debe tener al menos 6 caracteres.";
        return "";
    };

    const validatePrimerNombre = (val) => {
        if (!val) return "El nombre es requerido.";
        if (!nameRegex.test(val)) return "El nombre debe contener solo letras (2-30 caracteres).";
        return "";
    };

    const validateApellido = (val) => {
        if (!val) return "El apellido es requerido.";
        if (!nameRegex.test(val)) return "El apellido debe contener solo letras (2-30 caracteres).";
        return "";
    };

    const validateCi = (val) => {
        if (!val) return "La cédula es requerida.";
        if (!ciRegex.test(val)) return "La cédula debe ser numérica (entre 6 y 9 dígitos).";
        return "";
    };

    const validateTelefono = (val) => {
        if (!val) return "El teléfono es requerido.";
        if (!phoneRegex.test(val)) return "El teléfono debe contener solo números (11 dígitos).";
        return "";
    };

    // Change handlers with automatic validation clearing/updating
    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        setErrors(prev => ({ ...prev, email: validateEmail(val) }));
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    };

    const handlePrimerNombreChange = (e) => {
        const val = e.target.value;
        setPrimerNombre(val);
        setErrors(prev => ({ ...prev, primerNombre: validatePrimerNombre(val) }));
    };

    const handleApellidoChange = (e) => {
        const val = e.target.value;
        setApellido(val);
        setErrors(prev => ({ ...prev, apellido: validateApellido(val) }));
    };

    const handleCiChange = (e) => {
        const val = e.target.value;
        setCi(val);
        setErrors(prev => ({ ...prev, ci: validateCi(val) }));
    };

    const handleTelefonoChange = (e) => {
        const val = e.target.value;
        setTelefono(val);
        setErrors(prev => ({ ...prev, telefono: validateTelefono(val) }));
    };

    // Blur handlers
    const handleEmailBlur = () => setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    const handlePasswordBlur = () => setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    const handlePrimerNombreBlur = () => setErrors(prev => ({ ...prev, primerNombre: validatePrimerNombre(primerNombre) }));
    const handleApellidoBlur = () => setErrors(prev => ({ ...prev, apellido: validateApellido(apellido) }));
    const handleCiBlur = () => setErrors(prev => ({ ...prev, ci: validateCi(ci) }));
    const handleTelefonoBlur = () => setErrors(prev => ({ ...prev, telefono: validateTelefono(telefono) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // Perform final check on all fields
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        const firstNameErr = validatePrimerNombre(primerNombre);
        const lastNameErr = validateApellido(apellido);
        const ciErr = validateCi(ci);
        const phoneErr = validateTelefono(telefono);

        if (emailErr || passwordErr || firstNameErr || lastNameErr || ciErr || phoneErr) {
            setErrors({
                email: emailErr,
                password: passwordErr,
                primerNombre: firstNameErr,
                apellido: lastNameErr,
                ci: ciErr,
                telefono: phoneErr
            });
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password, {
                primerNombre,
                apellido,
                ci,
                telefono,
                avatarFile,
                role: "Administrador"
            });
            navigate("/petitions-view");
        } catch (err) {
            console.error("Registration failed:", err);
            setErrorMsg(err.message || "Error al registrar la cuenta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F9] flex items-center justify-center p-4 select-none">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-[#F3E8EB]">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#8A1538] flex items-center justify-center shadow-lg shadow-[#8A1538]/20 mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#8A1538]">Crear Cuenta de Admin</h2>
                    <p className="text-gray-500 text-sm mt-1 mb-4">Regístrate como administrador en la plataforma</p>

                    <ImagePicker
                        shape="rounded-full"
                        icon={User}
                        bucketName="fotosPerfil"
                        placeholderType="user"
                        onFileSelect={setAvatarFile}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="primerNombre"
                            label="Nombre"
                            required
                            value={primerNombre}
                            onChange={handlePrimerNombreChange}
                            onBlur={handlePrimerNombreBlur}
                            error={errors.primerNombre}
                            placeholder="Nombre"
                        />
                        <Input
                            id="apellido"
                            label="Apellido"
                            required
                            value={apellido}
                            onChange={handleApellidoChange}
                            onBlur={handleApellidoBlur}
                            error={errors.apellido}
                            placeholder="Apellido"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="ci"
                            label="Cédula (CI)"
                            required
                            value={ci}
                            onChange={handleCiChange}
                            onBlur={handleCiBlur}
                            error={errors.ci}
                            placeholder="Cédula"
                        />
                        <Input
                            id="telefono"
                            label="Teléfono"
                            required
                            value={telefono}
                            onChange={handleTelefonoChange}
                            onBlur={handleTelefonoBlur}
                            error={errors.telefono}
                            placeholder="Teléfono"
                        />
                    </div>

                    <Input
                        id="email"
                        label="Correo Electrónico"
                        type="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        error={errors.email}
                        placeholder="correo@ejemplo.com"
                    />

                    <Input
                        id="password"
                        label="Contraseña"
                        type="password"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        error={errors.password}
                        placeholder="••••••••"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Registrando cuenta...</span>
                            </>
                        ) : (
                            "Registrar Cuenta"
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#F3E8EB] text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-xs font-bold text-[#8A1538] hover:text-[#72102C] transition-colors cursor-pointer"
                    >
                        ¿Ya tienes cuenta? Inicia sesión aquí
                    </button>
                </div>
            </div>
        </div>
    );
}

