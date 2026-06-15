import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import Input from "../../components/inputs/Input";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordRegex = /^.{6,}$/;

    const validatePassword = (val) => {
        if (!val) return "La contraseña es requerida.";
        if (!passwordRegex.test(val)) return "La contraseña debe tener al menos 6 caracteres.";
        return "";
    };

    const validateConfirmPassword = (val) => {
        if (!val) return "La confirmación de la contraseña es requerida.";
        if (val !== password) return "Las contraseñas no coinciden.";
        return "";
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        setErrors(prev => ({
            ...prev,
            password: validatePassword(val),
            confirmPassword: confirmPassword ? (val !== confirmPassword ? "Las contraseñas no coinciden." : "") : ""
        }));
    };

    const handleConfirmPasswordChange = (e) => {
        const val = e.target.value;
        setConfirmPassword(val);
        setErrors(prev => ({ ...prev, confirmPassword: val !== password ? "Las contraseñas no coinciden." : "" }));
    };

    const handlePasswordBlur = () => {
        setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    };

    const handleConfirmPasswordBlur = () => {
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccess(false);

        const passwordErr = validatePassword(password);
        const confirmPasswordErr = validateConfirmPassword(confirmPassword);

        if (passwordErr || confirmPasswordErr) {
            setErrors({ password: passwordErr, confirmPassword: confirmPasswordErr });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Log out from the recovery session
            await supabase.auth.signOut();
            setSuccess(true);
        } catch (err) {
            console.error("Reset password error:", err);
            setErrorMsg(err.message || "No se pudo actualizar la contraseña.");
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
                    <p className="text-gray-500 text-sm mt-1">Restablecer Contraseña</p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-[#FAF5F6] border border-[#8A1538]/20 rounded-xl text-xs font-bold text-[#8A1538] text-center space-y-2 leading-relaxed">
                            <p className="text-sm">¡Contraseña restablecida!</p>
                            <p className="font-semibold text-gray-500">
                                Tu contraseña ha sido cambiada con éxito. Ahora puedes volver a iniciar sesión con tu nueva contraseña.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm text-center block"
                        >
                            Ir al Inicio de Sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-gray-500 text-xs text-center leading-normal">
                            Ingresa tu nueva contraseña para acceder a la plataforma. Debe tener al menos 6 caracteres.
                        </p>

                        {errorMsg && (
                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                                {errorMsg}
                            </div>
                        )}

                        <Input
                            id="password"
                            label="Nueva Contraseña"
                            type="password"
                            required
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            error={errors.password}
                            placeholder="••••••••"
                        />

                        <Input
                            id="confirmPassword"
                            label="Confirmar Contraseña"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={handleConfirmPasswordBlur}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Actualizando...</span>
                                </>
                            ) : (
                                "Restablecer Contraseña"
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
                        © 2026 CVG Ferrominera Orinoco. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
