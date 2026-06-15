import { useState } from "react";
import { supabase } from "../../utils/supabase";

/**
 * Reusable hook to update vehicle information.
 */
export function useUpdateCar() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateCar = async (vehicleId, { placa, marca, modelo, year, numPuestos, maletero, ci_driver }, carImageFile) => {
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
                try {
                    const fileExt = carImageFile.name.split(".").pop();
                    const fileName = `car_${vehiclePlaca.toUpperCase()}_${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from("fotosVehiculos")
                        .upload(fileName, carImageFile, {
                            cacheControl: "3600",
                            upsert: true
                        });

                    if (uploadError) {
                        throw new Error("Error al subir la imagen del vehículo: " + uploadError.message);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from("fotosVehiculos")
                        .getPublicUrl(fileName);
                    fotoUrl = publicUrl;
                } catch (uploadException) {
                    console.error("Excepción durante la subida de foto de vehículo:", uploadException);
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
                ci_driver: ci_driver === "" ? null : ci_driver // allow unassigning
            };

            // Clean undefined fields so we only update active values
            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] === undefined) {
                    delete updatePayload[key];
                }
            });

            const { data: updatedVehicle, error: updateError } = await supabase
                .from("vehiculos")
                .update(updatePayload)
                .eq("id", vehicleId)
                .select()
                .single();

            if (updateError) {
                throw new Error("Error al actualizar el vehículo en la base de datos: " + updateError.message);
            }

            setSuccess(true);
            return {
                success: true,
                vehicle: updatedVehicle
            };
        } catch (err) {
            console.error("Error in useUpdateCar hook:", err);
            setError(err.message || "Ocurrió un error inesperado al actualizar el vehículo.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateCar,
        loading,
        error,
        success
    };
}
