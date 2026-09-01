import { LogOut } from "lucide-react";

/**
 * Modal de confirmación de cierre de sesión.
 *
 * Props:
 *  - onConfirm  {function} — Ejecuta el logout.
 *  - onCancel   {function} — Cierra el modal sin hacer nada.
 */
export default function LogoutConfirmModal({ onConfirm, onCancel }) {
    return (
        <>
            {/* Overlay oscuro con blur */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Tarjeta central */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-2xl w-full max-w-sm p-8 pointer-events-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-5">

                    {/* Icono */}
                    <div className="w-16 h-16 rounded-full bg-[#FDF0F3] border border-[#FCE7EB] flex items-center justify-center shrink-0">
                        <LogOut className="w-7 h-7 text-primary" />
                    </div>

                    {/* Texto */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">
                            ¿Cerrar sesión?
                        </h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                            Serás redirigido a la pantalla de inicio de sesión y tendrás que volver a autenticarte.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">

                        {/* Cancelar — relleno con color de acento */}
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 bg-primary hover:bg-[#72102c] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                        >
                            Cancelar
                        </button>

                        {/* Cerrar Sesión — borde coloreado, interior transparente */}
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-transparent hover:bg-[#FDF0F3] border-2 border-primary text-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
