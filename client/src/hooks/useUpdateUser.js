import { useState } from "react";
import { supabase } from "../../utils/supabase";

/**
 * Reusable hook to update user information.
 * Works for any user independent of their role.
 */
export function useUpdateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateUser = async (userId, { email, password, fullName, ci, telefono, idGerencia, role }, avatarFile) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Fetch current database record to obtain auth_id and current avatar URL
            const { data: dbUser, error: fetchError } = await supabase
                .from("usuarios")
                .select("auth_id, foto_url, email, role")
                .eq("id", userId)
                .single();

            if (fetchError || !dbUser) {
                throw new Error("No se pudo obtener la información actual del usuario.");
            }

            const authId = dbUser.auth_id;
            let fotoUrl = dbUser.foto_url;

            // 2. Upload new avatar picture if provided
            if (avatarFile) {
                try {
                    const fileExt = avatarFile.name.split(".").pop();
                    const fileName = `avatar_${Date.now()}.${fileExt}`;
                    const filePath = `${authId}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("fotosPerfil")
                        .upload(filePath, avatarFile, {
                            cacheControl: "3600",
                            upsert: true
                        });

                    if (uploadError) {
                        throw new Error("Error al subir el avatar del usuario: " + uploadError.message);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from("fotosPerfil")
                        .getPublicUrl(filePath);
                    fotoUrl = publicUrl;
                } catch (uploadException) {
                    console.error("Excepción durante la subida de avatar:", uploadException);
                    throw new Error("No se pudo cargar la imagen de perfil.");
                }
            }

            // 3. If updating current logged in user, update auth credentials
            const { data: { session } } = await supabase.auth.getSession();
            const isCurrentUser = session?.user && session.user.id === authId;

            if (isCurrentUser) {
                const authUpdate = {};
                // Only update email if it has changed
                if (email && email.toLowerCase() !== session.user.email?.toLowerCase()) {
                    authUpdate.email = email;
                }
                // Only update password if a new one was provided
                if (password) {
                    authUpdate.password = password;
                }

                if (Object.keys(authUpdate).length > 0) {
                    const { error: authError } = await supabase.auth.updateUser(authUpdate);
                    if (authError) {
                        throw new Error("Error al actualizar credenciales: " + authError.message);
                    }
                }
            }

            // 4. Split fullName into primer_nombre and apellido
            const nameParts = fullName.trim().split(/\s+/);
            const primerNombre = nameParts[0] || "";
            const apellido = nameParts.slice(1).join(" ") || "";

            // 5. Update user profile row in database
            const updatePayload = {
                primer_nombre: primerNombre,
                apellido: apellido,
                ci_user: ci,
                telf: telefono,
                foto_url: fotoUrl,
                id_gerencia: idGerencia || null,
            };

            // Only update email and role in db if provided
            if (email) updatePayload.email = email;
            if (role) updatePayload.role = role;

            const { data: updatedUser, error: updateError } = await supabase
                .from("usuarios")
                .update(updatePayload)
                .eq("id", userId)
                .select()
                .single();

            if (updateError) {
                throw new Error("Error al actualizar la base de datos: " + updateError.message);
            }

            setSuccess(true);
            return {
                success: true,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: `${updatedUser.primer_nombre || ""} ${updatedUser.apellido || ""}`.trim(),
                    role: updatedUser.role,
                    ci: updatedUser.ci_user,
                    avatar: updatedUser.foto_url,
                    id_gerencia: updatedUser.id_gerencia
                }
            };
        } catch (err) {
            console.error("Error in useUpdateUser hook:", err);
            setError(err.message || "Ocurrió un error inesperado al actualizar el usuario.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateUser,
        loading,
        error,
        success
    };
}
