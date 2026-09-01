import { AlertTriangle, Loader2, X } from "lucide-react";

/**
 * Modal de confirmación para el borrado lógico de un registro.
 *
 * Props:
 *  - userName   {string}   — Nombre o identificador del elemento a eliminar (usuario, placa del vehículo, etc.).
 *  - isLoading  {boolean}  — Muestra spinner en el botón de confirmar mientras la operación está en curso.
 *  - onConfirm  {function} — Callback ejecutado al presionar "Eliminar".
 *  - onCancel   {function} — Callback ejecutado al presionar "Cancelar" o la X o el overlay.
 */
export default function DeleteModal({ userName, isLoading, onConfirm, onCancel }) {
    return (
        <>
            {/* Overlay oscuro */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Tarjeta central del modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-2xl w-full max-w-md p-8 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">

                    {/* Botón de cierre (X) */}
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icono de advertencia */}
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        {/* Título */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                ¿Eliminar registro?
                            </h2>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                                Estás a punto de eliminar{" "}
                                <span className="font-bold text-gray-800">{userName || "este registro"}</span>.
                                Esta acción lo marcará como eliminado y dejará de aparecer en el sistema.
                            </p>
                        </div>

                        {/* Aviso secundario */}
                        <div className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-left">
                            <p className="text-xs font-semibold text-red-600 leading-snug">
                                Este registro no aparecerá en las listas ni podrá ser utilizado en el sistema.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Eliminando...</span>
                                    </>
                                ) : (
                                    <span>Eliminar</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
