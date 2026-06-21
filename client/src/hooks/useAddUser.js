import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseUrl, supabaseAnonKey } from "../../utils/supabase";

const sendEmailNotification = async (email, password, fullName) => {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Log the mock email contents using stylized console logs for clarity
    console.log(
        `%c[SIMULACIÓN DE ENVÍO DE CORREO]
--------------------------------------------------
Para: ${email}
Asunto: Credenciales de acceso - FerroTransporte
--------------------------------------------------
Hola ${fullName},

Tu cuenta de pasajero ha sido creada por el administrador del sistema.
Aquí tienes tus datos de acceso a la plataforma:

- Usuario (Correo): ${email}
- Contraseña provisional: ${password}

Por favor, inicia sesión en la aplicación para activar tu cuenta.
--------------------------------------------------`,
        "color: #8A1538; font-weight: bold; font-family: monospace; font-size: 13px;"
    );
    return true;
};

export function useAddUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const addUser = async ({ email, password, fullName, ci, telefono, idGerencia, role }, avatarFile) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Check uniqueness of ci_user in the database before touching Auth
            const { data: existingCi, error: ciCheckError } = await supabase
                .from("usuarios")
                .select("id")
                .eq("ci_user", ci)
                .maybeSingle();

            if (ciCheckError) {
                throw new Error("Error al verificar la cédula de identidad: " + ciCheckError.message);
            }
            if (existingCi) {
                throw new Error("La cédula de identidad ingresada ya está registrada en el sistema.");
            }

            // 2. Create a secondary Supabase client instance with persistSession = false.
            // This is CRITICAL to bypass session synchronization, so creating a new user
            // does NOT log out the administrator from their current dashboard session.
            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            // 3. Register user in Supabase Auth (only reached if ci_user is unique)
            const { data: authData, error: signUpError } = await tempClient.auth.signUp({
                email,
                password
            });

            if (signUpError) {
                throw new Error(signUpError.message);
            }

            const authUser = authData.user;
            if (!authUser) {
                throw new Error("No se pudo crear el usuario en el sistema de autenticación.");
            }

            // 4. Upload avatar image if selected
            let fotoUrl = null;
            if (avatarFile) {
                try {
                    const fileExt = avatarFile.name.split(".").pop();
                    const fileName = `avatar_${Date.now()}.${fileExt}`;
                    const filePath = `${authUser.id}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("fotosPerfil")
                        .upload(filePath, avatarFile, {
                            cacheControl: "3600",
                            upsert: true
                        });

                    if (uploadError) {
                        console.error("Error al subir el avatar del usuario:", uploadError.message);
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from("fotosPerfil")
                            .getPublicUrl(filePath);
                        fotoUrl = publicUrl;
                    }
                } catch (uploadException) {
                    console.error("Excepción durante la subida de avatar:", uploadException);
                }
            }

            // 5. Split fullName into primer_nombre and apellido
            const nameParts = fullName.trim().split(/\s+/);
            const primerNombre = nameParts[0] || "";
            const apellido = nameParts.slice(1).join(" ") || "";

            // 6. Insert user profile into public 'usuarios' table
            const { error: insertError } = await supabase
                .from("usuarios")
                .insert({
                    auth_id: authUser.id,
                    email: authUser.email,
                    primer_nombre: primerNombre,
                    apellido: apellido,
                    ci_user: ci,
                    telf: telefono,
                    foto_url: fotoUrl,
                    role: role,
                    id_gerencia: idGerencia || null,
                    activo: true
                });

            if (insertError) {
                throw new Error("Error al guardar el perfil del usuario: " + insertError.message);
            }

            // 7. Simulate sending email with credentials
            await sendEmailNotification(email, password, fullName);

            setSuccess(true);
            return { success: true, user: authUser };
        } catch (err) {
            console.error("Error in useAddUser hook:", err);
            setError(err.message || "Ocurrió un error inesperado al registrar el usuario.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        addUser,
        loading,
        error,
        success
    };
}
