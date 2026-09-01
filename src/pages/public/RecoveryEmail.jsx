import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import Input from "../../components/inputs/Input";

export default function RecoveryEmail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ email: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validateEmail = (val) => {
        if (!val) return "El correo electrónico es requerido.";
        if (!emailRegex.test(val)) return "El formato del correo electrónico no es válido.";
        return "";
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        setErrors(prev => ({ ...prev, email: validateEmail(val) }));
    };

    const handleEmailBlur = () => {
        setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccess(false);

        const emailErr = validateEmail(email);
        if (emailErr) {
            setErrors({ email: emailErr });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            console.error("Reset password error:", err);
            setErrorMsg(err.message || "No se pudo enviar el correo de recuperación.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F9] flex items-center justify-center p-4 select-none">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-[#F3E8EB]">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#8A1538] flex items-center justify-center shadow-lg shadow-[#8A1538]/20 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#8A1538]">FleetControl</h2>
                    <p className="text-gray-500 text-sm mt-1">Recuperación de Contraseña</p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-[#FAF5F6] border border-[#8A1538]/20 rounded-xl text-xs font-bold text-[#8A1538] text-center space-y-2 leading-relaxed">
                            <p className="text-sm">¡Correo de recuperación enviado!</p>
                            <p className="font-semibold text-gray-500">
                                Hemos enviado un enlace para restablecer tu contraseña a <span className="font-extrabold text-[#8A1538]">{email}</span>. Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm text-center block"
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-gray-500 text-xs text-center leading-normal">
                            Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Enviando enlace...</span>
                                </>
                            ) : (
                                "Enviar Enlace de Recuperación"
                            )}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="mt-6 pt-4 border-t border-[#F3E8EB] text-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-xs font-bold text-[#8A1538] hover:text-[#72102C] transition-colors cursor-pointer"
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-[#F3E8EB] text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 FleetControl. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
