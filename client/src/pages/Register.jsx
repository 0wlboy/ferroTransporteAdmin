import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F9] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-[#F3E8EB] text-center">
                <h2 className="text-2xl font-bold text-[#8A1538] mb-4">Registro de Administradores</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    El registro de nuevas cuentas de administrador está deshabilitado temporalmente. Por favor, contacte con el soporte técnico para obtener credenciales.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#72102C] text-white font-semibold rounded-xl transition-all cursor-pointer text-sm"
                >
                    Volver al Inicio de Sesión
                </button>
            </div>
        </div>
    );
}
