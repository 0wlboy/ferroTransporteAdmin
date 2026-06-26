import { useState } from "react";
import { supabase } from "../../utils/supabase";
import useUploadImage from "./useUploadImage";

/**
 * Reusable hook to update vehicle information.
 */
export function useUpdateCar() {
    const { uploadImage } = useUploadImage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const updateCar = async (vehicleId, { placa, marca, modelo, year, numPuestos, maletero, ci_driver, estado }, carImageFile) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Fetch current vehicle data to get existing image URL
            const { data: dbVehicle, error: fetchError } = await supabase
                .from("vehiculos")
                .select("foto_url, placa")
                .eq("id", vehicleId)
                .single();

            if (fetchError || !dbVehicle) {
                throw new Error("No se pudo obtener la información actual del vehículo.");
            }

            let fotoUrl = dbVehicle.foto_url;
            const vehiclePlaca = placa || dbVehicle.placa || "UNKNOWN";

            // 2. Upload new vehicle image if provided
            if (carImageFile) {
                fotoUrl = await uploadImage(carImageFile, {
                    bucket: "fotosVehiculos",
                    placa: vehiclePlaca,
                    upsert: false
                });
                if (!fotoUrl) {
                    throw new Error("No se pudo cargar la imagen del vehículo.");
                }
            }

            // 3. Update vehicle row in database
            const updatePayload = {
                placa: placa ? placa.toUpperCase() : undefined,
                marca: marca || undefined,
                modelo: modelo || undefined,
                año: year ? parseInt(year, 10) : undefined,
                num_asientos: numPuestos ? parseInt(numPuestos, 10) : undefined,
                maletero_amplio: maletero ? (maletero === "Si") : undefined,
                foto_url: fotoUrl,
                ci_driver: ci_driver === "" ? null : ci_driver, // allow unassigning
                estado: estado || undefined
            };

            // Clean undefined fields so we only update active values
            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] === undefined) {
                    delete updatePayload[key];
                }
            });

            const { error: updateError } = await supabase
                .from("vehiculos")
                .update(updatePayload)
                .eq("id", vehicleId);

            if (updateError) {
                throw new Error("Error al actualizar el vehículo en la base de datos: " + updateError.message);
            }

            setSuccess(true);
            return { success: true };
        } catch (err) {
            console.error("Error in useUpdateCar hook:", err);
            setError(err.message || "Ocurrió un error inesperado al actualizar el vehículo.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Marca un vehículo como eliminado (soft delete) poniendo deleted = true.
     * @param {string|number} vehicleId — id de la fila en la tabla 'vehiculos'.
     * @returns {{ success: boolean, error?: string }}
     */
    const deleteVehicle = async (vehicleId) => {
        setDeleting(true);
        setDeleteError(null);
        try {
            const { error: updateError } = await supabase
                .from("vehiculos")
                .update({ deleted: true, ci_driver: null })
                .eq("id", vehicleId);

            if (updateError) {
                throw new Error("Error al eliminar el vehículo: " + updateError.message);
            }

            return { success: true };
        } catch (err) {
            console.error("Error in deleteVehicle:", err);
            setDeleteError(err.message || "Ocurrió un error al eliminar el vehículo.");
            return { success: false, error: err.message };
        } finally {
            setDeleting(false);
        }
    };

    return {
        updateCar,
        loading,
        error,
        success,
        deleteVehicle,
        deleting,
        deleteError
    };
}
