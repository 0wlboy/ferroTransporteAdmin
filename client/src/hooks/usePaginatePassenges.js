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
export function usePaginatePassengers({ initialPageSize = 4 } = {}) {
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

  // Estadísticas para las tarjetas
  const [stats, setStats] = useState({
    activosTotal: 0,
    activosToday: 0,
    inactivosTotal: 0,
    inactivosToday: 0,
    totalToday: 0,
    totalThisMonth: 0,
    totalPasajeros: 0,
  });

  useEffect(() => {
    const fetchPassengers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Rango de paginación (0-indexed)
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Obtener usuarios filtrados y ordenados
        let query = supabase
          .from("usuarios")
          .select("*", { count: "exact" })
          .eq("role", "Pasajero")
          .neq("deleted", true);

        if (debouncedSearch.trim() !== "") {
          const term = `%${debouncedSearch.trim()}%`;
          query = query.or(
            `ci_user.ilike.${term},primer_nombre.ilike.${term},apellido.ilike.${term}`,
          );
        }

        if (statusFilter !== "all") {
          query = query.eq("activo", statusFilter);
        }

        if (sortBy === "fecha_asc")
          query = query.order("created_at", { ascending: true });
        else if (sortBy === "fecha_desc")
          query = query.order("created_at", { ascending: false });
        else if (sortBy === "nombre_asc")
          query = query.order("primer_nombre", { ascending: true });
        else if (sortBy === "nombre_desc")
          query = query.order("primer_nombre", { ascending: false });
        else if (sortBy === "apellido_asc")
          query = query.order("apellido", { ascending: true });
        else if (sortBy === "apellido_desc")
          query = query.order("apellido", { ascending: false });

        // 2. Obtener estadísticas globales y diarias
        const statsQuery = supabase
          .from("usuarios")
          .select("activo, created_at")
          .eq("role", "Pasajero")
          .neq("deleted", true);

        // Ejecutamos la paginación y la obtención de estadísticas en paralelo
        const [listResult, statsResult] = await Promise.all([
          query.range(from, to),
          statsQuery,
        ]);

        if (listResult.error) throw listResult.error;
        if (statsResult.error) throw statsResult.error;

        const users = listResult.data || [];
        const count = listResult.count || 0;
        const allUsersForStats = statsResult.data || [];

        // Calcular contadores en memoria
        const todayStr = new Date().toDateString();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let activosTotal = 0;
        let activosToday = 0;
        let inactivosTotal = 0;
        let inactivosToday = 0;
        let totalToday = 0;
        let totalThisMonth = 0;

        allUsersForStats.forEach((v) => {
          const statusLower = v.activo;
          const createdDate = v.created_at ? new Date(v.created_at) : null;
          const isToday = createdDate
            ? createdDate.toDateString() === todayStr
            : false;
          const isThisMonth = createdDate
            ? createdDate.getMonth() === currentMonth &&
              createdDate.getFullYear() === currentYear
            : false;

          if (statusLower === true) {
            activosTotal++;
            if (isToday) activosToday++;
          } else if (statusLower === false) {
            inactivosTotal++;
            if (isToday) inactivosToday++;
          }

          if (isToday) {
            totalToday++;
          }
          if (isThisMonth) {
            totalThisMonth++;
          }
        });

        const totalPasajeros = allUsersForStats.length;

        setStats({
          activosTotal,
          activosToday,
          inactivosTotal,
          inactivosToday,
          totalToday,
          totalThisMonth,
          totalPasajeros,
        });

        if (users.length === 0) {
          setData([]);
          setTotalItems(0);
          return;
        }

        // 3. Obtener nombre de localizacion de la tabla 'localizacion' a partir de los id_gerencias
        const id_gerencias = [
          ...new Set(users.flatMap((u) => [u.id_gerencia]).filter(Boolean)),
        ];
        const localizacionMap = {};

        if (id_gerencias.length > 0) {
          const { data: localizaciones, error: lError } = await supabase
            .from("localizaciones")
            .select("id, nombre")
            .in("id", id_gerencias);

          if (lError) throw lError;

          localizaciones?.forEach((loc) => {
            localizacionMap[loc.id] = loc.nombre;
          });
        }

        // 4. Mapear datos finales combinando usuarios y localizaciones
        const formatted = users.map((u) => ({
          id: u.id,
          nombre: u.primer_nombre || u.nombre || null,
          apellido: u.apellido || null,
          correo: u.email || null,
          telefono: u.telf || null,
          foto_url: u.foto_url || null,
          ci_user: u.ci_user || null,
          id_gerencia: u.id_gerencia || null,
          activo: u.activo || null,
          fecha: formatFecha(u.created_at),
          localizacion: localizacionMap[u.id_gerencia] || null,
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

    fetchPassengers();
  }, [page, pageSize, debouncedSearch, statusFilter, sortBy]);

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const fetchFilteredAll = async () => {
    try {
      let query = supabase
        .from("usuarios")
        .select("*")
        .eq("role", "Pasajero")
        .neq("deleted", true);

      if (searchTerm.trim() !== "") {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(
          `ci_user.ilike.${term},primer_nombre.ilike.${term},apellido.ilike.${term}`,
        );
      }

      if (statusFilter !== "all") {
        query = query.eq("activo", statusFilter);
      }

      if (sortBy === "fecha_asc")
        query = query.order("created_at", { ascending: true });
      else if (sortBy === "fecha_desc")
        query = query.order("created_at", { ascending: false });
      else if (sortBy === "nombre_asc")
        query = query.order("primer_nombre", { ascending: true });
      else if (sortBy === "nombre_desc")
        query = query.order("primer_nombre", { ascending: false });
      else if (sortBy === "apellido_asc")
        query = query.order("apellido", { ascending: true });
      else if (sortBy === "apellido_desc")
        query = query.order("apellido", { ascending: false });

      const { data: users, error: listError } = await query;
      if (listError) throw listError;
      if (!users || users.length === 0) return [];

      const id_gerencias = [
        ...new Set(users.flatMap((u) => [u.id_gerencia]).filter(Boolean)),
      ];
      const localizacionMap = {};
      if (id_gerencias.length > 0) {
        const { data: localizaciones, error: lError } = await supabase
          .from("localizaciones")
          .select("id, nombre")
          .in("id", id_gerencias);
        if (lError) throw lError;
        localizaciones?.forEach((loc) => {
          localizacionMap[loc.id] = loc.nombre;
        });
      }

      return users.map((u) => ({
        id: u.id,
        nombre: u.primer_nombre || u.nombre || null,
        apellido: u.apellido || null,
        correo: u.email || null,
        telefono: u.telf || null,
        ci_user: u.ci_user || null,
        activo: u.activo || null,
        fecha: formatFecha(u.created_at),
        localizacion: localizacionMap[u.id_gerencia] || null,
      }));
    } catch (err) {
      console.error("Error fetching all filtered passengers for export:", err);
      return [];
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
    nextPage: () => page < totalPages && setPage((p) => p + 1),
    prevPage: () => page > 1 && setPage((p) => p - 1),
    setPage,
    stats,
    fetchFilteredAll,
  };
}
