import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("administrador@ferrotransporte.com");
    const [password, setPassword] = useState("admin123");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Since we are mocking auth, we just navigate to petitions-view
        navigate("/petitions-view");
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
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#8A1538]/20 transition-all text-sm"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#8A1538]/20 transition-all text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl shadow-lg shadow-[#8A1538]/15 hover:shadow-xl hover:shadow-[#8A1538]/25 transition-all cursor-pointer text-sm"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#F3E8EB] text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 FleetControl. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
