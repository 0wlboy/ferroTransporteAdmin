import { useState } from "react";
import { supabase } from "../../utils/supabase";
import useUploadImage from "./useUploadImage";

export function useAddCar() {
    const { uploadImage } = useUploadImage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const addCar = async ({ placa, marca, modelo, year, numPuestos, maletero, ci_driver }, carImageFile) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Upload car image if provided
            let fotoUrl = null;
            if (carImageFile) {
                fotoUrl = await uploadImage(carImageFile, {
                    bucket: "fotosVehiculos",
                    placa: placa,
                    upsert: false
                });
                if (!fotoUrl) {
                    throw new Error("No se pudo cargar la imagen del vehículo.");
                }
            }

            // 2. Insert vehicle data into the database
            const { error: insertError } = await supabase
                .from("vehiculos")
                .insert({
                    placa: placa.toUpperCase(),
                    marca,
                    modelo,
                    año: parseInt(year, 10) || null,
                    num_asientos: parseInt(numPuestos, 10) || null,
                    maletero_amplio: maletero === "Si",
                    foto_url: fotoUrl,
                    ci_driver: ci_driver || null,
                    estado: "Operativo"
                });

            if (insertError) {
                throw new Error("Error al guardar el vehículo: " + insertError.message);
            }

            setSuccess(true);
            return { success: true };
        } catch (err) {
            console.error("Error in useAddCar hook:", err);
            setError(err.message || "Ocurrió un error inesperado al registrar el vehículo.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        addCar,
        loading,
        error,
        success
    };
}
