import { useState } from "react";
import { supabase } from "../../utils/supabase";

export function useAddCar() {
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
                try {
                    const fileExt = carImageFile.name.split(".").pop();
                    const fileName = `car_${placa.toUpperCase()}_${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from("fotosVehiculos")
                        .upload(fileName, carImageFile, {
                            cacheControl: "3600",
                            upsert: true
                        });

                    if (uploadError) {
                        console.error("Error uploading car image:", uploadError.message);
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from("fotosVehiculos")
                            .getPublicUrl(fileName);
                        fotoUrl = publicUrl;
                    }
                } catch (uploadException) {
                    console.error("Exception during car image upload:", uploadException);
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
