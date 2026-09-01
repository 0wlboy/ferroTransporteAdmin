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
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const updateUser = async (userId, { email, password, fullName, ci, telefono, idGerencia, role }, avatarFile) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Fetch current database record to obtain auth_id, ci_user, and current avatar URL
            const { data: dbUser, error: fetchError } = await supabase
                .from("usuarios")
                .select("auth_id, foto_url, email, role, ci_user")
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

            // 3. If updating current logged in user, update auth credentials; otherwise use RPC for other users
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
                        throw new Error("Error al actualizar tus credenciales: " + authError.message);
                    }
                }
            } else {
                // If updating another user, call the secure database function (RPC)
                const needsAuthUpdate = (email && email.toLowerCase() !== dbUser.email?.toLowerCase()) || password;

                if (needsAuthUpdate) {
                    const { error: rpcError } = await supabase.rpc("admin_update_user_auth", {
                        target_user_id: authId,
                        new_email: email && email.toLowerCase() !== dbUser.email?.toLowerCase() ? email : null,
                        new_password: password || null
                    });

                    if (rpcError) {
                        throw new Error("Error al actualizar credenciales del usuario: " + rpcError.message);
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

            const { error: updateError } = await supabase
                .from("usuarios")
                .update(updatePayload)
                .eq("id", userId);

            if (updateError) {
                throw new Error("Error al actualizar la base de datos: " + updateError.message);
            }

            // 6. If role changed from Conductor to Pasajero, unassign any assigned vehicle in 'vehiculos' table
            const previousRole = dbUser.role;
            const newRole = role || dbUser.role;
            if (previousRole === "Conductor" && newRole === "Pasajero") {
                const driverCi = dbUser.ci_user || ci;
                if (driverCi) {
                    const { error: vehicleError } = await supabase
                        .from("vehiculos")
                        .update({ ci_driver: null })
                        .eq("ci_driver", driverCi);

                    if (vehicleError) {
                        console.error("Error al desasignar vehículo del conductor:", vehicleError.message);
                    }
                }
            }

            // Build return object from in-memory data (avoids RLS issues with .select() on update)
            const finalEmail = email || dbUser.email;
            const finalRole  = role  || dbUser.role;

            setSuccess(true);
            return {
                success: true,
                user: {
                    id: userId,
                    email: finalEmail,
                    name: `${primerNombre} ${apellido}`.trim(),
                    role: finalRole,
                    ci: ci,
                    avatar: fotoUrl,
                    id_gerencia: idGerencia || null
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

    /**
     * Marca un usuario como eliminado (soft delete) poniendo deleted = true.
     * @param {string|number} userId  — id de la fila en la tabla 'usuarios'.
     * @param {string}        userRole — role del usuario ("Pasajero" | "Conductor"), evita una query extra.
     * @returns {{ success: boolean, role?: string, error?: string }}
     */
    const deleteUser = async (userId, userRole) => {
        setDeleting(true);
        setDeleteError(null);
        try {
            if (userRole === "Conductor") {
                const { data: u } = await supabase
                    .from("usuarios")
                    .select("ci_user")
                    .eq("id", userId)
                    .single();
                if (u?.ci_user) {
                    await supabase
                        .from("vehiculos")
                        .update({ ci_driver: null })
                        .eq("ci_driver", u.ci_user);
                }
            }

            const { error: updateError } = await supabase
                .from("usuarios")
                .update({ deleted: true })
                .eq("id", userId);

            if (updateError) {
                throw new Error("Error al eliminar el usuario: " + updateError.message);
            }

            return { success: true, role: userRole };
        } catch (err) {
            console.error("Error in deleteUser:", err);
            setDeleteError(err.message || "Ocurrió un error al eliminar el usuario.");
            return { success: false, error: err.message };
        } finally {
            setDeleting(false);
        }
    };

    return {
        updateUser,
        loading,
        error,
        success,
        deleteUser,
        deleting,
        deleteError
    };
}
