import { useState } from "react";
import { supabase } from "../../utils/supabase";

export function useAddLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const addLocation = async ({ name, lat, lng }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: insertError } = await supabase
                .from("localizaciones")
                .insert({
                    nombre: name,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    activo: true,
                    num_trips: 0
                });

            if (insertError) {
                throw new Error("Error al guardar la localización: " + insertError.message);
            }

            setSuccess(true);
            return { success: true };
        } catch (err) {
            console.error("Error in useAddLocation hook:", err);
            setError(err.message || "Ocurrió un error inesperado al registrar la localización.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        addLocation,
        loading,
        error,
        success
    };
}
