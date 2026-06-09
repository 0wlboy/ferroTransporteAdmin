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
 * Hook de paginación simple para la tabla 'vehiculos'.
 * Resuelve los nombres de conductores y vehiculos consultando la tabla 'usuarios'.
 */
export function usePaginateVehicles({ initialPageSize = 4 } = {}) {
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

    // Estadísticas para las tarjetas
    const [stats, setStats] = useState({
        operativosTotal: 0,
        operativosToday: 0,
        inoperativosTotal: 0,
        inoperativosToday: 0,
        mantenimientoTotal: 0,
        mantenimientoToday: 0,
        totalToday: 0,
        totalThisMonth: 0,
        totalFlota: 0
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            setError(null);
            try {
                // Rango de paginación (0-indexed)
                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;

                // 1. Obtener vehículos filtrados y ordenados
                let query = supabase.from("vehiculos").select("*", { count: "exact" });

                if (searchTerm.trim() !== "") {
                    const term = `%${searchTerm.trim()}%`;
                    query = query.or(`placa.ilike.${term},marca.ilike.${term},modelo.ilike.${term},ci_driver.ilike.${term}`);
                }

                if (statusFilter !== "all") {
                    query = query.eq("estado", statusFilter);
                }

                if (sortBy === "fecha_asc") query = query.order("created_at", { ascending: true });
                else if (sortBy === "fecha_desc") query = query.order("created_at", { ascending: false });
                else if (sortBy === "placa_asc") query = query.order("placa", { ascending: true });
                else if (sortBy === "placa_desc") query = query.order("placa", { ascending: false });
                else if (sortBy === "estado_asc") query = query.order("estado", { ascending: true });
                else if (sortBy === "estado_desc") query = query.order("estado", { ascending: false });

                // 2. Obtener estadísticas globales y diarias
                const statsQuery = supabase.from("vehiculos").select("estado, created_at");

                // Ejecutamos la paginación y la obtención de estadísticas en paralelo
                const [listResult, statsResult] = await Promise.all([
                    query.range(from, to),
                    statsQuery
                ]);

                if (listResult.error) throw listResult.error;
                if (statsResult.error) throw statsResult.error;

                const vehicles = listResult.data || [];
                const count = listResult.count || 0;
                const allVehiclesForStats = statsResult.data || [];

                // Calcular contadores en memoria
                const todayStr = new Date().toDateString();
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                let operativosTotal = 0;
                let operativosToday = 0;
                let inoperativosTotal = 0;
                let inoperativosToday = 0;
                let mantenimientoTotal = 0;
                let mantenimientoToday = 0;
                let totalToday = 0;
                let totalThisMonth = 0;

                allVehiclesForStats.forEach(v => {
                    const statusLower = v.estado?.toLowerCase() || "";
                    const createdDate = v.created_at ? new Date(v.created_at) : null;
                    const isToday = createdDate ? createdDate.toDateString() === todayStr : false;
                    const isThisMonth = createdDate ? (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) : false;

                    if (statusLower === "operativo") {
                        operativosTotal++;
                        if (isToday) operativosToday++;
                    } else if (statusLower === "inoperativo") {
                        inoperativosTotal++;
                        if (isToday) inoperativosToday++;
                    } else if (statusLower === "mantenimiento") {
                        mantenimientoTotal++;
                        if (isToday) mantenimientoToday++;
                    }

                    if (isToday) {
                        totalToday++;
                    }
                    if (isThisMonth) {
                        totalThisMonth++;
                    }
                });

                const totalFlota = allVehiclesForStats.length;

                setStats({
                    operativosTotal,
                    operativosToday,
                    inoperativosTotal,
                    inoperativosToday,
                    mantenimientoTotal,
                    mantenimientoToday,
                    totalToday,
                    totalThisMonth,
                    totalFlota
                });

                if (vehicles.length === 0) {
                    setData([]);
                    setTotalItems(0);
                    return;
                }

                // 3. Obtener nombres de la tabla 'usuarios' a partir de los CI únicos
                const uniqueCis = [...new Set(vehicles.flatMap(v => [v.ci_driver]).filter(Boolean))];

                const userMap = {};
                const userFoto = {};

                if (uniqueCis.length > 0) {
                    const { data: users, error: uError } = await supabase
                        .from("usuarios")
                        .select("ci_user, primer_nombre,apellido, foto_url")
                        .in("ci_user", uniqueCis);

                    if (uError) throw uError;

                    users?.forEach(u => {
                        userMap[u.ci_user] = `${u.primer_nombre || ""} ${u.apellido || ""}`.trim();
                        userFoto[u.ci_user] = u.foto_url;
                    });
                }

                // 4. Mapear datos finales combinando peticiones, nombres y localizaciones
                const formatted = vehicles.map(v => ({
                    id: v.id,
                    placa: v.placa || null,
                    modelo: v.modelo || null,
                    marca: v.marca || null,
                    num_asientos: v.num_asientos || null,
                    maletero_amplio: v.maletero_amplio || null,
                    año: v.año || null,
                    foto_vehiculo: v.foto_url || null,
                    ci_driver: v.ci_driver || null,
                    driverName: v.ci_driver ? (userMap[v.ci_driver] || v.ci_driver) : "Por Asignar",
                    foto_driver: userFoto[v.ci_driver] || null,
                    estado: v.estado,
                    fecha: formatFecha(v.created_at),
                }));

                setData(formatted);
                setTotalItems(count || 0);
            } catch (err) {
                console.error("Error en usePaginateVehicles:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [page, pageSize, searchTerm, statusFilter, sortBy]);

    // Reiniciar paginación al cambiar filtros
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        setPage,
        stats
    };
}
