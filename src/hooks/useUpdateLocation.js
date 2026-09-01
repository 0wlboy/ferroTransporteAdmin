import { useState } from "react";
import { supabase } from "../../utils/supabase";

/**
 * Hook para actualizar una localización existente en la tabla 'localizaciones'.
 *
 * Expone:
 *  - updateLocation({ locationId, name, lat, lng, activo }) → { success, error? }
 *  - loading   {boolean} — true mientras la operación está en curso.
 *  - error     {string|null} — mensaje de error si la operación falló.
 *  - success   {boolean} — true si la última operación fue exitosa.
 */
export function useUpdateLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    /**
     * Actualiza los campos de una localización.
     * Solo se actualizan los campos que son proporcionados (no undefined).
     *
     * @param {object} params
     * @param {string|number} params.locationId — id de la fila en la tabla 'localizaciones'.
     * @param {string}  [params.name]   — Nuevo nombre de la localización.
     * @param {number}  [params.lat]    — Nueva latitud.
     * @param {number}  [params.lng]    — Nueva longitud.
     * @param {boolean} [params.activo] — Nuevo estado activo/inactivo.
     * @returns {{ success: boolean, error?: string }}
     */
    const updateLocation = async ({ locationId, name, lat, lng, activo }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!locationId) {
                throw new Error("Se requiere el ID de la localización para actualizarla.");
            }

            // Construir payload solo con campos proporcionados
            const updatePayload = {};

            if (name !== undefined && name !== null && name.trim() !== "") {
                updatePayload.nombre = name.trim();
            }
            if (lat !== undefined && lat !== null && lat !== "") {
                const parsedLat = parseFloat(lat);
                if (isNaN(parsedLat)) throw new Error("La latitud no es un número válido.");
                updatePayload.lat = parsedLat;
            }
            if (lng !== undefined && lng !== null && lng !== "") {
                const parsedLng = parseFloat(lng);
                if (isNaN(parsedLng)) throw new Error("La longitud no es un número válido.");
                updatePayload.lng = parsedLng;
            }
            if (activo !== undefined && activo !== null) {
                updatePayload.activo = Boolean(activo);
            }

            if (Object.keys(updatePayload).length === 0) {
                throw new Error("No se proporcionaron campos para actualizar.");
            }

            const { error: updateError } = await supabase
                .from("localizaciones")
                .update(updatePayload)
                .eq("id", locationId);

            if (updateError) {
                throw new Error("Error al actualizar la localización: " + updateError.message);
            }

            setSuccess(true);
            return { success: true };
        } catch (err) {
            console.error("Error in useUpdateLocation hook:", err);
            setError(err.message || "Ocurrió un error inesperado al actualizar la localización.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Marca una localización como eliminada (soft delete) poniendo deleted = true.
     * @param {string|number} locationId — id de la fila en la tabla 'localizaciones'.
     * @returns {{ success: boolean, error?: string }}
     */
    const deleteLocation = async (locationId) => {
        setDeleting(true);
        setDeleteError(null);
        try {
            if (!locationId) {
                throw new Error("Se requiere el ID de la localización para eliminarla.");
            }

            const { error: updateError } = await supabase
                .from("localizaciones")
                .update({ deleted: true })
                .eq("id", locationId);

            if (updateError) {
                throw new Error("Error al eliminar la localización: " + updateError.message);
            }

            return { success: true };
        } catch (err) {
            console.error("Error in deleteLocation:", err);
            setDeleteError(err.message || "Ocurrió un error al eliminar la localización.");
            return { success: false, error: err.message };
        } finally {
            setDeleting(false);
        }
    };

    return {
        updateLocation,
        loading,
        error,
        success,
        deleteLocation,
        deleting,
        deleteError
    };
}
