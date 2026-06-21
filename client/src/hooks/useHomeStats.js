import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const formatTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
};

// Fallback Mock Data matching the mockup perfectly
const fallbackStats = {
    viajesTotalesHoy: 0,
    viajesTotalesHoyTrend: "+0 este día",
    conductoresActivos: 0,
    conductoresRegistrados: 0,
    vehiculosMantenimiento: 0,
    vehiculosTotal: 0,
    solicitudesPendientes: 0,
    solicitudesTotalHoy: 0
};

const fallbackChartData = [
    { name: "08:00", Peticiones: 0 },
    { name: "12:00", Peticiones: 0 },
    { name: "16:00", Peticiones: 0 },
    { name: "20:00", Peticiones: 0 },
    { name: "00:00", Peticiones: 0 }
];

const fallbackUrgentPetitions = [
    {
        id: "urg-1",
        passengerName: "Maria Sánchez",
        destino_nombre: "Gerencia Bancaria",
        prioridad: "Alta",
        estado: "Pendiente"
    }
];

const fallbackRecentPetitions = [
    {
        id: "rec-1",
        passengerName: "Maria Sánchez",
        driverName: "Carlos Ruiz",
        destino_nombre: "Gerencia Bancaria",
        fecha: "12:00 PM",
        estado: "Completado"
    },
    {
        id: "rec-2",
        passengerName: "Maria Sánchez",
        driverName: "Carlos Ruiz",
        destino_nombre: "Gerencia Bancaria",
        fecha: "12:00 PM",
        estado: "En camino"
    },
    {
        id: "rec-3",
        passengerName: "Maria Sánchez",
        driverName: "Carlos Ruiz",
        destino_nombre: "Gerencia Bancaria",
        fecha: "12:00 PM",
        estado: "Pendiente"
    }
];

export function useHomeStats() {
    const [stats, setStats] = useState(fallbackStats);
    const [chartData, setChartData] = useState(fallbackChartData);
    const [urgentPetitions, setUrgentPetitions] = useState(fallbackUrgentPetitions);
    const [recentPetitions, setRecentPetitions] = useState(fallbackRecentPetitions);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch statistics
                // Drivers count
                const { data: drivers, error: driversError } = await supabase
                    .from("usuarios")
                    .select("activo")
                    .eq("role", "Conductor")
                    .neq("deleted", true);

                // Vehicles count
                const { data: vehicles, error: vehiclesError } = await supabase
                    .from("vehiculos")
                    .select("estado");

                // Petitions (Today and Recent)
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);
                const startOfTodayISO = startOfToday.toISOString();

                // Today's petitions for counters
                const { data: todayPetitions, error: todayPetitionsError } = await supabase
                    .from("peticiones")
                    .select("estado, prioridad, created_at")
                    .gte("created_at", startOfTodayISO)
                    .neq("deleted", true);

                // Recent petitions (limit 10)
                const { data: rawRecent, error: recentError } = await supabase
                    .from("peticiones")
                    .select("*")
                    .neq("deleted", true)
                    .order("created_at", { ascending: false })
                    .limit(10);

                if (driversError) throw driversError;
                if (vehiclesError) throw vehiclesError;
                if (todayPetitionsError) throw todayPetitionsError;
                if (recentError) throw recentError;

                // Process drivers stats
                const totalDrivers = drivers?.length || 0;
                const activeDrivers = drivers?.filter(d => d.activo).length || 0;

                // Process vehicles stats
                const totalVehicles = vehicles?.length || 0;
                const maintVehicles = vehicles?.filter(v => v.estado?.toLowerCase() === "mantenimiento").length || 0;

                // Process today's petitions stats
                const totalPetitionsToday = todayPetitions?.length || 0;
                const pendingPetitionsToday = todayPetitions?.filter(p => p.estado?.toLowerCase() === "pendiente").length || 0;
                const completedPetitionsToday = todayPetitions?.filter(p => p.estado?.toLowerCase() === "completado").length || 0;

                // Set dynamic stats
                const dynamicStats = {
                    viajesTotalesHoy: totalPetitionsToday > 0 ? totalPetitionsToday : fallbackStats.viajesTotalesHoy,
                    viajesTotalesHoyTrend: totalPetitionsToday > 0 ? `+${completedPetitionsToday} completados` : fallbackStats.viajesTotalesHoyTrend,
                    conductoresActivos: totalDrivers > 0 ? activeDrivers : fallbackStats.conductoresActivos,
                    conductoresRegistrados: totalDrivers > 0 ? totalDrivers : fallbackStats.conductoresRegistrados,
                    vehiculosMantenimiento: totalVehicles > 0 ? maintVehicles : fallbackStats.vehiculosMantenimiento,
                    vehiculosTotal: totalVehicles > 0 ? totalVehicles : fallbackStats.vehiculosTotal,
                    solicitudesPendientes: totalPetitionsToday > 0 ? pendingPetitionsToday : fallbackStats.solicitudesPendientes,
                    solicitudesTotalHoy: totalPetitionsToday > 0 ? totalPetitionsToday : fallbackStats.solicitudesTotalHoy
                };
                setStats(dynamicStats);

                // Process Hourly chart data
                if (todayPetitions && todayPetitions.length > 0) {
                    const hoursBuckets = {
                        "08:00": 0,
                        "12:00": 0,
                        "16:00": 0,
                        "20:00": 0,
                        "00:00": 0
                    };

                    todayPetitions.forEach(p => {
                        const date = new Date(p.created_at);
                        const hour = date.getHours();

                        if (hour >= 4 && hour < 10) {
                            hoursBuckets["08:00"]++;
                        } else if (hour >= 10 && hour < 14) {
                            hoursBuckets["12:00"]++;
                        } else if (hour >= 14 && hour < 18) {
                            hoursBuckets["16:00"]++;
                        } else if (hour >= 18 && hour < 22) {
                            hoursBuckets["20:00"]++;
                        } else {
                            hoursBuckets["00:00"]++;
                        }
                    });

                    // Convert to Recharts format
                    const formattedChartData = Object.keys(hoursBuckets).map(key => ({
                        name: key,
                        Peticiones: hoursBuckets[key]
                    }));
                    setChartData(formattedChartData);
                } else {
                    setChartData(fallbackChartData);
                }

                // Resolve user/loc names for lists
                const allRecentAndUrgent = [...(rawRecent || [])];

                // Get high-priority active petitions for urgent sidebar (from all fetched or query)
                let rawUrgent = allRecentAndUrgent.filter(
                    p => p.prioridad === "Alta" && p.estado !== "Completado" && p.estado !== "Cancelado"
                );

                // If no urgent petitions from recent, fetch them specifically
                if (rawUrgent.length === 0) {
                    const { data: fetchedUrgent, error: urgError } = await supabase
                        .from("peticiones")
                        .select("*")
                        .eq("prioridad", "Alta")
                        .neq("estado", "Completado")
                        .neq("estado", "Cancelado")
                        .neq("deleted", true)
                        .limit(5);

                    if (!urgError && fetchedUrgent) {
                        rawUrgent = fetchedUrgent;
                        allRecentAndUrgent.push(...fetchedUrgent);
                    }
                }

                if (allRecentAndUrgent.length > 0) {
                    // Resolve user names
                    const uniqueCis = [...new Set(allRecentAndUrgent.flatMap(p => [p.ci_pasajero, p.ci_driver]).filter(Boolean))];
                    const userMap = {};
                    const userFoto = {};

                    if (uniqueCis.length > 0) {
                        const { data: users, error: uError } = await supabase
                            .from("usuarios")
                            .select("ci_user, primer_nombre, apellido, foto_url")
                            .in("ci_user", uniqueCis);

                        if (!uError && users) {
                            users.forEach(u => {
                                userMap[u.ci_user] = `${u.primer_nombre || ""} ${u.apellido || ""}`.trim();
                                userFoto[u.ci_user] = u.foto_url;
                            });
                        }
                    }

                    // Resolve location names
                    const uniqueLocs = [...new Set(allRecentAndUrgent.flatMap(p => [p.origen_id, p.destino_id]).filter(Boolean))];
                    const locationMap = {};

                    if (uniqueLocs.length > 0) {
                        const { data: locations, error: lError } = await supabase
                            .from("localizaciones")
                            .select("id, nombre")
                            .in("id", uniqueLocs);

                        if (!lError && locations) {
                            locations.forEach(l => {
                                locationMap[l.id] = l.nombre;
                            });
                        }
                    }

                    // Format Recent Petitions
                    const formattedRecent = rawRecent.map(p => ({
                        id: p.id,
                        passengerName: userMap[p.ci_pasajero] || "Usuario Anónimo",
                        ci_pasajero: p.ci_pasajero,
                        foto_pasajero: userFoto[p.ci_pasajero] || null,
                        driverName: p.ci_driver ? (userMap[p.ci_driver] || p.ci_driver) : "Por Asignar",
                        ci_driver: p.ci_driver,
                        foto_driver: userFoto[p.ci_driver] || null,
                        destino_nombre: locationMap[p.destino_id] || "N/D",
                        fecha: formatTime(p.created_at),
                        estado: p.estado
                    }));
                    setRecentPetitions(formattedRecent.length > 0 ? formattedRecent.slice(0, 5) : fallbackRecentPetitions);

                    // Format Urgent Petitions
                    const formattedUrgent = rawUrgent.map(p => ({
                        id: p.id,
                        passengerName: userMap[p.ci_pasajero] || "Usuario Anónimo",
                        foto_pasajero: userFoto[p.ci_pasajero] || null,
                        destino_nombre: locationMap[p.destino_id] || "N/D",
                        prioridad: p.prioridad,
                        estado: p.estado
                    }));
                    setUrgentPetitions(formattedUrgent.length > 0 ? formattedUrgent : fallbackUrgentPetitions);
                } else {
                    setRecentPetitions(fallbackRecentPetitions);
                    setUrgentPetitions(fallbackUrgentPetitions);
                }
            } catch (err) {
                console.error("Error fetching home dashboard stats:", err);
                setError(err);
                // Fallbacks are already set in state
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return {
        stats,
        chartData,
        urgentPetitions,
        recentPetitions,
        loading,
        error
    };
}
