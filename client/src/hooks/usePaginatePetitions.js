import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

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
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("fecha_desc");

    useEffect(() => {
        const fetchPetitions = async () => {
            setLoading(true);
            setError(null);
            try {
                // Rango de paginación (0-indexed)
                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;

                // 1. Obtener peticiones filtradas y ordenadas
                let query = supabase.from("peticiones").select("*", { count: "exact" });

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

                const { data: petitions, count, error: qError } = await query.range(from, to);
                if (qError) throw qError;

                if (!petitions || petitions.length === 0) {
                    setData([]);
                    setTotalItems(0);
                    return;
                }

                // 2. Obtener nombres de la tabla 'usuarios' a partir de los CI únicos
                const uniqueCis = [...new Set(petitions.flatMap(p => [p.ci_pasajero, p.ci_driver]).filter(Boolean))];

                const { data: users, error: uError } = await supabase
                    .from("usuarios")
                    .select("ci, nombre")
                    .in("ci", uniqueCis);

                if (uError) throw uError;

                const nameMap = {};
                users?.forEach(u => {
                    nameMap[u.ci] = u.nombre;
                });

                // 3. Mapear datos finales combinando peticiones y nombres
                const formatted = petitions.map(p => ({
                    id: p.id,
                    ci_pasajero: p.ci_pasajero,
                    passengerName: nameMap[p.ci_pasajero] || "Usuario Anónimo",
                    ci_driver: p.ci_driver || null,
                    driverName: p.ci_driver ? (nameMap[p.ci_driver] || p.ci_driver) : "Por Asignar",
                    num_acompañantes: p.num_acompañantes || 0,
                    placa_vehiculo: p.placa_vehiculo || null,
                    origen_id: p.origen_id,
                    destino_id: p.destino_id,
                    carga: p.carga || null,
                    descripcion: p.descripcion || null,
                    prioridad: p.prioridad,
                    estado: p.estado,
                    fecha: p.created_at,
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
    }, [page, pageSize, searchTerm, statusFilter, sortBy]);

    // Reiniciar paginación al cambiar filtros
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

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
        setPage
    };
}
