import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check user role and update current user state
    const fetchUserProfile = async (userSession) => {
        if (!userSession?.user) {
            setCurrentUser(null);
            return null;
        }

        const user = userSession.user;

        try {
            // Query usuarios table to fetch role and details
            const { data: dbUser, error: dbError } = await supabase
                .from("usuarios")
                .select("*")
                .eq("auth_id", user.id)
                .single();

            if (dbError || !dbUser) {
                console.error("Error fetching user profile:", dbError);
                return null;
            }

            // Check role
            if (dbUser.role !== "Administrador" && dbUser.role !== "Admin") {
                console.warn("User does not have Admin/Administrador role:", dbUser.role);
                return null;
            }

            const loggedInUser = {
                id: dbUser.id,
                email: user.email,
                name: `${dbUser.primer_nombre || ""} ${dbUser.apellido || ""}`.trim() || "Administrador",
                role: dbUser.role,
                ci: dbUser.ci_user,
                avatar: dbUser.foto_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop"
            };

            setCurrentUser(loggedInUser);
            return loggedInUser;
        } catch (err) {
            console.error("Auth context error:", err);
            return null;
        }
    };

    // Recover session on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedSession = localStorage.getItem("ft_admin_session");
                if (storedSession) {
                    const { user, timestamp } = JSON.parse(storedSession);
                    const now = Date.now();
                    const hours24 = 24 * 60 * 60 * 1000;

                    if (now - timestamp > hours24) {
                        // Expired after 24 hours
                        localStorage.removeItem("ft_admin_session");
                        await supabase.auth.signOut();
                        setCurrentUser(null);
                    } else {
                        // Valid session from localStorage
                        setCurrentUser(user);
                    }
                } else {
                    // Check if supabase auth has a session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const matchedUser = await fetchUserProfile(session);
                        if (!matchedUser) {
                            await supabase.auth.signOut();
                        } else {
                            // Save to local storage
                            const sessionData = {
                                user: matchedUser,
                                timestamp: Date.now()
                            };
                            localStorage.setItem("ft_admin_session", JSON.stringify(sessionData));
                        }
                    }
                }
            } catch (err) {
                console.error("Error initializing auth:", err);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                const storedSession = localStorage.getItem("ft_admin_session");
                if (storedSession) {
                    const { user, timestamp } = JSON.parse(storedSession);
                    const now = Date.now();
                    const hours24 = 24 * 60 * 60 * 1000;
                    if (now - timestamp > hours24) {
                        localStorage.removeItem("ft_admin_session");
                        await supabase.auth.signOut();
                        setCurrentUser(null);
                    } else {
                        setCurrentUser(user);
                    }
                } else {
                    const matchedUser = await fetchUserProfile(session);
                    if (!matchedUser && event === "SIGNED_IN") {
                        await supabase.auth.signOut();
                    } else if (matchedUser) {
                        const sessionData = {
                            user: matchedUser,
                            timestamp: Date.now()
                        };
                        localStorage.setItem("ft_admin_session", JSON.stringify(sessionData));
                    }
                }
            } else {
                localStorage.removeItem("ft_admin_session");
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        const matchedUser = await fetchUserProfile(data);
        if (!matchedUser) {
            await supabase.auth.signOut();
            throw new Error("Acceso denegado. No tiene permisos de Administrador.");
        }

        // Guardar la información en la memoria del dispositivo (localStorage) con timestamp
        const sessionData = {
            user: matchedUser,
            timestamp: Date.now()
        };
        localStorage.setItem("ft_admin_session", JSON.stringify(sessionData));

        return matchedUser;
    };

    const register = async (email, password, userData = {}) => {
        // 1. Check uniqueness of ci_user in the database before calling Auth signUp
        if (userData.ci) {
            const { data: existingCi, error: ciCheckError } = await supabase
                .from("usuarios")
                .select("id")
                .eq("ci_user", userData.ci)
                .maybeSingle();

            if (ciCheckError) {
                throw new Error("Error al verificar la cédula de identidad: " + ciCheckError.message);
            }
            if (existingCi) {
                throw new Error("La cédula de identidad ingresada ya está registrada en el sistema.");
            }
        }

        // 2. Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            throw error;
        }

        const user = data.user;
        if (!user) {
            throw new Error("No se pudo crear el usuario.");
        }

        // 3. Upload avatar file to Supabase Storage if provided
        let fotoUrl = null;
        if (userData.avatarFile) {
            try {
                const fileExt = userData.avatarFile.name.split(".").pop();
                const fileName = `avatar_${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("fotosPerfil")
                    .upload(filePath, userData.avatarFile, {
                        cacheControl: "3600",
                        upsert: true
                    });

                if (uploadError) {
                    console.error("Error uploading avatar in register flow:", uploadError);
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from("fotosPerfil")
                        .getPublicUrl(filePath);
                    fotoUrl = publicUrl;
                }
            } catch (err) {
                console.error("Avatar upload exception:", err);
            }
        }

        // 4. Create the user profile in 'usuarios' table
        const { data: dbUser, error: dbError } = await supabase
            .from("usuarios")
            .insert({
                auth_id: user.id,
                email: user.email,
                primer_nombre: userData.primerNombre || "",
                apellido: userData.apellido || "",
                ci_user: userData.ci || "",
                telf: userData.telf || "",
                foto_url: fotoUrl,
                role: userData.role || "Administrador",
                activo: true
            })
            .select()
            .single();

        if (dbError) {
            throw new Error("Error al guardar el perfil del usuario: " + dbError.message);
        }

        // 5. Handle session auto-login if available, or force sign-in
        let session = data.session;
        if (!session) {
            // If Supabase did not return a session on signUp, try signing in immediately
            const signInRes = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInRes.error) {
                throw new Error("Usuario registrado pero no se pudo iniciar sesión automáticamente: " + signInRes.error.message);
            }
            session = signInRes.data;
        }

        // Check role
        if (dbUser.role !== "Administrador" && dbUser.role !== "Admin") {
            await supabase.auth.signOut();
            throw new Error("Acceso denegado. El usuario registrado no tiene permisos de Administrador.");
        }

        // Construct the loggedInUser object directly from the insert results
        const loggedInUser = {
            id: dbUser.id,
            email: user.email,
            name: `${dbUser.primer_nombre || ""} ${dbUser.apellido || ""}`.trim() || "Administrador",
            role: dbUser.role,
            ci: dbUser.ci_user,
            avatar: dbUser.foto_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop"
        };

        // Set immediate context state
        setCurrentUser(loggedInUser);

        // 6. Store session in localStorage
        const sessionData = {
            user: loggedInUser,
            timestamp: Date.now()
        };
        localStorage.setItem("ft_admin_session", JSON.stringify(sessionData));

        return loggedInUser;
    };

    const logout = async () => {
        localStorage.removeItem("ft_admin_session");
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const updateCurrentUser = (userData) => {
        setCurrentUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...userData };
            
            // Persist the updated user in localStorage session
            const storedSession = localStorage.getItem("ft_admin_session");
            if (storedSession) {
                const sessionData = JSON.parse(storedSession);
                sessionData.user = updated;
                localStorage.setItem("ft_admin_session", JSON.stringify(sessionData));
            }
            return updated;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDF8F9] flex flex-col items-center justify-center p-4 select-none">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm font-bold text-primary tracking-wide">Cargando sesión...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, register, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

