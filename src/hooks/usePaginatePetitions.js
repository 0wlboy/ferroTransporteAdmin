import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const formatFecha = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Hook de paginación simple para la tabla 'peticiones'.
 * Resuelve los nombres de pasajeros y conductores consultando la tabla 'usuarios'.
 */
export function usePaginatePetitions({ initialPageSize = 4 } = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Paginación
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros y Ordenamiento
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("fecha_desc");

    // Debounce — espera 350ms después del último cambio antes de buscar
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Deletion, cancellation and refetch states
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);

    // Estadísticas para las tarjetas
    const [stats, setStats] = useState({
        pendingTotal: 0,
        pendingToday: 0,
        enCaminoTotal: 0,
        enCaminoToday: 0,
        cancelledTotal: 0,
        cancelledToday: 0,
        todayTotal: 0
    });

    useEffect(() => {
        const fetchPetitions = async () => {
            setLoading(true);
            setError(null);
            try {
                // Rango de paginación (0-indexed)
                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;

                // 1. Obtener peticiones filtradas y ordenadas
                let query = supabase.from("peticiones").select("*", { count: "exact" }).neq("deleted", true);

                if (debouncedSearch.trim() !== "") {
                    const term = `%${debouncedSearch.trim()}%`;
                    query = query.or(`ci_pasajero.ilike.${term},ci_driver.ilike.${term},placa_vehiculo.ilike.${term}`);
                }

                if (statusFilter !== "all") {
                    query = query.eq("estado", statusFilter);
                }

                if (sortBy === "fecha_asc") query = query.order("created_at", { ascending: true });
                else if (sortBy === "fecha_desc") query = query.order("created_at", { ascending: false });
                else if (sortBy === "ci_pasajero_asc") query = query.order("ci_pasajero", { ascending: true });
                else if (sortBy === "ci_driver_asc") query = query.order("ci_driver", { ascending: true });
                else if (sortBy === "placa_vehiculo_asc") query = query.order("placa_vehiculo", { ascending: true });
                else if (sortBy === "prioridad_asc") query = query.order("prioridad", { ascending: true });
                else if (sortBy === "prioridad_desc") query = query.order("prioridad", { ascending: false });

                // 2. Obtener estadísticas globales y diarias
                const statsQuery = supabase.from("peticiones").select("estado, created_at").neq("deleted", true);

                // Ejecutamos la paginación y la obtención de estadísticas en paralelo
                const [listResult, statsResult] = await Promise.all([
                    query.range(from, to),
                    statsQuery
                ]);

                if (listResult.error) throw listResult.error;
                if (statsResult.error) throw statsResult.error;

                const petitions = listResult.data || [];
                const count = listResult.count || 0;
                const allPetitionsForStats = statsResult.data || [];

                // Calcular contadores en memoria
                const todayStr = new Date().toDateString();
                let pendingTotal = 0;
                let pendingToday = 0;
                let enCaminoTotal = 0;
                let enCaminoToday = 0;
                let cancelledTotal = 0;
                let cancelledToday = 0;
                let todayTotal = 0;

                allPetitionsForStats.forEach(p => {
                    const statusLower = p.estado?.toLowerCase() || "";
                    const isToday = p.created_at ? new Date(p.created_at).toDateString() === todayStr : false;

                    if (statusLower === "pendiente") {
                        pendingTotal++;
                        if (isToday) pendingToday++;
                    } else if (statusLower === "en camino" || statusLower === "en viaje") {
                        enCaminoTotal++;
                        if (isToday) enCaminoToday++;
                    } else if (statusLower === "cancelado" || statusLower === "cancelada") {
                        cancelledTotal++;
                        if (isToday) cancelledToday++;
                    }

                    if (isToday) {
                        todayTotal++;
                    }
                });

                setStats({
                    pendingTotal,
                    pendingToday,
                    enCaminoTotal,
                    enCaminoToday,
                    cancelledTotal,
                    cancelledToday,
                    todayTotal
                });

                if (petitions.length === 0) {
                    setData([]);
                    setTotalItems(0);
                    return;
                }

                // 3. Obtener nombres de la tabla 'usuarios' a partir de los CI únicos
                const uniqueCis = [...new Set(petitions.flatMap(p => [p.ci_pasajero, p.ci_driver]).filter(Boolean))];

                const { data: users, error: uError } = await supabase
                    .from("usuarios")
                    .select("ci_user, primer_nombre,apellido, foto_url")
                    .in("ci_user", uniqueCis);

                if (uError) throw uError;

                const userMap = {};
                const userFoto = {};
                users?.forEach(u => {
                    userMap[u.ci_user] = u.primer_nombre + " " + u.apellido;
                    userFoto[u.ci_user] = u.foto_url;
                });

                const { data: vehicle, error: vError } = await supabase
                    .from("vehiculos")
                    .select("placa, foto_url")
                    .in("placa", [...new Set(petitions.flatMap(p => [p.placa_vehiculo]).filter(Boolean))]);

                if (vError) throw vError;

                const vehicleMap = {};
                vehicle?.forEach(v => {
                    vehicleMap[v.placa] = v.foto_url;
                });

                const { data: locations, error: lError } = await supabase
                    .from("localizaciones")
                    .select("id, nombre")
                    .in("id", [...new Set(petitions.flatMap(p => [p.origen_id, p.destino_id]).filter(Boolean))]);

                if (lError) throw lError;

                const locationMap = {};
                locations?.forEach(l => {
                    locationMap[l.id] = l.nombre;
                });

                // 4. Mapear datos finales combinando peticiones, nombres y localizaciones
                const formatted = petitions.map(p => ({
                    id: p.id,
                    ci_pasajero: p.ci_pasajero,
                    passengerName: userMap[p.ci_pasajero] || "Usuario Anónimo",
                    foto_pasajero: userFoto[p.ci_pasajero] || null,
                    ci_driver: p.ci_driver || null,
                    driverName: p.ci_driver ? (userMap[p.ci_driver] || p.ci_driver) : "Por Asignar",
                    foto_driver: userFoto[p.ci_driver] || null,
                    num_acompañantes: p.num_acompañantes || 0,
                    placa_vehiculo: p.placa_vehiculo || null,
                    foto_vehiculo: vehicleMap[p.placa_vehiculo] || null,
                    origen_id: p.origen_id,
                    origen_nombre: locationMap[p.origen_id],
                    destino_id: p.destino_id,
                    destino_nombre: locationMap[p.destino_id],
                    carga: p.carga || null,
                    descripcion: p.descripcion || null,
                    prioridad: p.prioridad,
                    estado: p.estado,
                    fecha: formatFecha(p.created_at),
                }));

                setData(formatted);
                setTotalItems(count || 0);
            } catch (err) {
                console.error("Error en usePaginatePetitions:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPetitions();
    }, [page, pageSize, debouncedSearch, statusFilter, sortBy, refetchTrigger]);

    // Reiniciar paginación al cambiar filtros
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const fetchFilteredAll = async () => {
        try {
            let query = supabase.from("peticiones").select("*").neq("deleted", true);

            if (searchTerm.trim() !== "") {
                const term = `%${searchTerm.trim()}%`;
                query = query.or(`ci_pasajero.ilike.${term},ci_driver.ilike.${term},placa_vehiculo.ilike.${term}`);
            }

            if (statusFilter !== "all") {
                query = query.eq("estado", statusFilter);
            }

            if (sortBy === "fecha_asc") query = query.order("created_at", { ascending: true });
            else if (sortBy === "fecha_desc") query = query.order("created_at", { ascending: false });
            else if (sortBy === "ci_pasajero_asc") query = query.order("ci_pasajero", { ascending: true });
            else if (sortBy === "ci_driver_asc") query = query.order("ci_driver", { ascending: true });
            else if (sortBy === "placa_vehiculo_asc") query = query.order("placa_vehiculo", { ascending: true });
            else if (sortBy === "prioridad_asc") query = query.order("prioridad", { ascending: true });
            else if (sortBy === "prioridad_desc") query = query.order("prioridad", { ascending: false });

            const { data: petitions, error: listError } = await query;
            if (listError) throw listError;
            if (!petitions || petitions.length === 0) return [];

            const uniqueCis = [...new Set(petitions.flatMap(p => [p.ci_pasajero, p.ci_driver]).filter(Boolean))];
            const userMap = {};
            if (uniqueCis.length > 0) {
                const { data: users, error: uError } = await supabase
                    .from("usuarios")
                    .select("ci_user, primer_nombre, apellido")
                    .in("ci_user", uniqueCis);
                if (uError) throw uError;
                users?.forEach(u => {
                    userMap[u.ci_user] = `${u.primer_nombre || ""} ${u.apellido || ""}`.trim();
                });
            }

            const { data: locations, error: lError } = await supabase
                .from("localizaciones")
                .select("id, nombre")
                .in("id", [...new Set(petitions.flatMap(p => [p.origen_id, p.destino_id]).filter(Boolean))]);
            if (lError) throw lError;
            const locationMap = {};
            locations?.forEach(l => {
                locationMap[l.id] = l.nombre;
            });

            return petitions.map(p => ({
                id: p.id,
                ci_pasajero: p.ci_pasajero,
                passengerName: userMap[p.ci_pasajero] || "Usuario Anónimo",
                ci_driver: p.ci_driver || null,
                driverName: p.ci_driver ? (userMap[p.ci_driver] || p.ci_driver) : "Por Asignar",
                num_acompañantes: p.num_acompañantes || 0,
                placa_vehiculo: p.placa_vehiculo || null,
                origen_id: p.origen_id,
                origen_nombre: locationMap[p.origen_id] || "N/D",
                destino_id: p.destino_id,
                destino_nombre: locationMap[p.destino_id] || "N/D",
                carga: p.carga || null,
                descripcion: p.descripcion || null,
                prioridad: p.prioridad,
                estado: p.estado,
                fecha: formatFecha(p.created_at)
            }));
        } catch (err) {
            console.error("Error fetching all filtered petitions for export:", err);
            return [];
        }
    };

    const deletePetition = async (petitionId) => {
        setDeleting(true);
        setDeleteError(null);
        try {
            if (!petitionId) {
                throw new Error("Se requiere el ID de la petición para eliminarla.");
            }

            const { error: updateError } = await supabase
                .from("peticiones")
                .update({ deleted: true })
                .eq("id", petitionId);

            if (updateError) {
                throw new Error("Error al eliminar la petición: " + updateError.message);
            }

            setRefetchTrigger(prev => prev + 1);
            return { success: true };
        } catch (err) {
            console.error("Error in deletePetition:", err);
            setDeleteError(err.message || "Ocurrió un error al eliminar la petición.");
            return { success: false, error: err.message };
        } finally {
            setDeleting(false);
        }
    };

    const cancelPetition = async (petitionId) => {
        setCancelling(true);
        setCancelError(null);
        try {
            if (!petitionId) {
                throw new Error("Se requiere el ID de la petición para cancelarla.");
            }

            const { error: updateError } = await supabase
                .from("peticiones")
                .update({ estado: "Cancelado" })
                .eq("id", petitionId);

            if (updateError) {
                throw new Error("Error al cancelar la petición: " + updateError.message);
            }

            setRefetchTrigger(prev => prev + 1);
            return { success: true };
        } catch (err) {
            console.error("Error in cancelPetition:", err);
            setCancelError(err.message || "Ocurrió un error al cancelar la petición.");
            return { success: false, error: err.message };
        } finally {
            setCancelling(false);
        }
    };

    return {
        data,
        loading,
        error,
        page,
        totalPages,
        totalItems,
        pageSize,
        setPageSize,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        nextPage: () => page < totalPages && setPage(p => p + 1),
        prevPage: () => page > 1 && setPage(p => p - 1),
        setPage,
        stats,
        fetchFilteredAll,
        deletePetition,
        deleting,
        deleteError,
        cancelPetition,
        cancelling,
        cancelError
    };
}
