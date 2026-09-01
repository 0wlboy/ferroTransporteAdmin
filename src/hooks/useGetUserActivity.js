import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const formatFecha = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = hours.toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
};

export default function useGetUserActivity(userId, initialPageSize = 4) {
    const [userProfile, setUserProfile] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [userError, setUserError] = useState(null);

    const [petitions, setPetitions] = useState([]);
    const [loadingPetitions, setLoadingPetitions] = useState(true);
    
    // Global stats for total/cancelled today
    const [globalStats, setGlobalStats] = useState({
        totalToday: 0,
        cancelledToday: 0
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Filters and Sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("fecha_asc");

    // Fetch user profile and stats
    useEffect(() => {
        if (!userId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingUser(false);
            setUserError("No se proporcionó un ID de usuario válido.");
            return;
        }

        const fetchUserProfile = async () => {
            setLoadingUser(true);
            setUserError(null);
            try {
                // Fetch user info
                const { data: user, error: uError } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (uError) throw uError;
                if (!user) throw new Error("Usuario no encontrado.");

                // Resolve gerencia name if present
                let gerenciaNombre = "Sin Gerencia";
                if (user.id_gerencia) {
                    const { data: gerenciaData } = await supabase
                        .from("localizaciones")
                        .select("nombre")
                        .eq("id", user.id_gerencia)
                        .single();
                    if (gerenciaData) {
                        gerenciaNombre = gerenciaData.nombre;
                    }
                }

                setUserProfile({
                    ...user,
                    gerencia: gerenciaNombre,
                    fullName: `${user.primer_nombre || ""} ${user.apellido || ""}`.trim() || "Usuario"
                });

                // Fetch global stats for today
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const { data: todayData, error: todayError } = await supabase
                    .from("peticiones")
                    .select("estado, created_at")
                    .gte("created_at", todayStart.toISOString());

                if (!todayError && todayData) {
                    const totalToday = todayData.length;
                    const cancelledToday = todayData.filter(p => 
                        p.estado?.toLowerCase() === "cancelado" || p.estado?.toLowerCase() === "cancelada"
                    ).length;

                    setGlobalStats({
                        totalToday,
                        cancelledToday
                    });
                }

            } catch (err) {
                console.error("Error fetching user profile:", err);
                setUserError(err.message || "Error al cargar la información del usuario.");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Fetch user petitions once profile is loaded
    useEffect(() => {
        if (!userProfile) return;

        const fetchUserPetitions = async () => {
            setLoadingPetitions(true);
            try {
                // Determine query based on user role
                let query = supabase.from("peticiones").select("*");
                if (userProfile.role === "Conductor") {
                    query = query.eq("ci_driver", userProfile.ci_user);
                } else {
                    query = query.eq("ci_pasajero", userProfile.ci_user);
                }

                const { data: petitionsData, error: pError } = await query;
                if (pError) throw pError;

                if (!petitionsData || petitionsData.length === 0) {
                    setPetitions([]);
                    return;
                }

                // Resolve passenger and driver names, vehicle details, and locations
                const uniqueCis = [...new Set(petitionsData.flatMap(p => [p.ci_pasajero, p.ci_driver]).filter(Boolean))];
                
                const { data: users, error: uError } = await supabase
                    .from("usuarios")
                    .select("ci_user, primer_nombre, apellido, foto_url")
                    .in("ci_user", uniqueCis);

                if (uError) throw uError;

                const userMap = {};
                const userFoto = {};
                users?.forEach(u => {
                    userMap[u.ci_user] = `${u.primer_nombre || ""} ${u.apellido || ""}`.trim();
                    userFoto[u.ci_user] = u.foto_url;
                });

                const { data: locations, error: lError } = await supabase
                    .from("localizaciones")
                    .select("id, nombre")
                    .in("id", [...new Set(petitionsData.flatMap(p => [p.origen_id, p.destino_id]).filter(Boolean))]);

                if (lError) throw lError;

                const locationMap = {};
                locations?.forEach(l => {
                    locationMap[l.id] = l.nombre;
                });

                const formatted = petitionsData.map(p => ({
                    id: p.id,
                    ci_pasajero: p.ci_pasajero,
                    passengerName: userMap[p.ci_pasajero] || "Usuario Anónimo",
                    foto_pasajero: userFoto[p.ci_pasajero] || null,
                    ci_driver: p.ci_driver || null,
                    driverName: p.ci_driver ? (userMap[p.ci_driver] || p.ci_driver) : "Por Asignar",
                    foto_driver: userFoto[p.ci_driver] || null,
                    num_acompañantes: p.num_acompañantes || 0,
                    placa_vehiculo: p.placa_vehiculo || null,
                    origen_id: p.origen_id,
                    origen_nombre: locationMap[p.origen_id] || "N/D",
                    destino_id: p.destino_id,
                    destino_nombre: locationMap[p.destino_id] || "N/D",
                    estado: p.estado || "PENDIENTE",
                    created_at: p.created_at,
                    fecha: formatFecha(p.created_at)
                }));

                setPetitions(formatted);

            } catch (err) {
                console.error("Error fetching petitions:", err);
            } finally {
                setLoadingPetitions(false);
            }
        };

        fetchUserPetitions();
    }, [userProfile]);

    // Handle pagination reset when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [searchTerm, statusFilter, sortBy]);

    // Client-side filtering & sorting
    const filteredPetitions = petitions.filter(p => {
        // Search filter
        const matchSearch = searchTerm.trim() === "" || 
            p.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.origen_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.destino_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.placa_vehiculo && p.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Status filter
        const matchStatus = statusFilter === "all" || p.estado?.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchStatus;
    });

    // Sorting
    const sortedPetitions = [...filteredPetitions].sort((a, b) => {
        if (sortBy === "fecha_asc") {
            return new Date(a.created_at) - new Date(b.created_at);
        } else if (sortBy === "fecha_desc") {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
    });

    // Pagination calculations
    const totalItems = sortedPetitions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
    const endIndex = Math.min(page * pageSize, totalItems);

    const paginatedPetitions = sortedPetitions.slice((page - 1) * pageSize, page * pageSize);

    // Derived user specific stats
    const userTotalTrips = petitions.length;
    const userCancelledTrips = petitions.filter(p => 
        p.estado?.toLowerCase() === "cancelado" || p.estado?.toLowerCase() === "cancelada"
    ).length;

    return {
        userProfile,
        loadingUser,
        userError,
        petitions,
        loadingPetitions,
        globalStats,
        page,
        setPage,
        pageSize,
        setPageSize,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        paginatedPetitions,
        userTotalTrips,
        userCancelledTrips,
        sortedPetitions
    };
}
