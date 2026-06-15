import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/inputs/Input";

export default function Login() {
    const navigate = useNavigate();
    const { currentUser, login } = useAuth();
    const [email, setEmail] = useState("administrador@ferrotransporte.com");
    const [password, setPassword] = useState("admin123");

    // Validation states
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            navigate("/petitions-view");
        }
    }, [currentUser, navigate]);

    // Validation regex patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{6,}$/;

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

    const handleEmailBlur = () => {
        setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    };

    const handlePasswordBlur = () => {
        setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // Perform final validation check before submission
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);

        if (emailErr || passwordErr) {
            setErrors({ email: emailErr, password: passwordErr });
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            navigate("/petitions-view");
        } catch (err) {
            console.error("Login failed:", err);
            setErrorMsg(err.message || "Credenciales incorrectas o error de conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F9] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-[#F3E8EB]">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#8A1538] flex items-center justify-center shadow-lg shadow-[#8A1538]/20 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#8A1538]">FleetControl</h2>
                    <p className="text-gray-500 text-sm mt-1">Servicio de Transporte - Panel Administrativo</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMsg && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                            {errorMsg}
                        </div>
                    )}

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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/recovery-email")}
                            className="text-xs font-bold text-[#8A1538] hover:text-[#72102C] transition-colors cursor-pointer"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#F3E8EB] text-center">
                    <button
                        onClick={() => navigate("/register")}
                        className="text-xs font-bold text-[#8A1538] hover:text-[#72102C] transition-colors cursor-pointer"
                    >
                        ¿No tienes cuenta? Regístrate aquí
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F3E8EB] text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 CVG Ferrominera Orinoco. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}

