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

export default function useGetCarActivity(vehicleId, initialPageSize = 4) {
    const [vehicleProfile, setVehicleProfile] = useState(null);
    const [loadingVehicle, setLoadingVehicle] = useState(true);
    const [vehicleError, setVehicleError] = useState(null);

    const [petitions, setPetitions] = useState([]);
    const [loadingPetitions, setLoadingPetitions] = useState(true);

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

    // Fetch vehicle profile and today stats
    useEffect(() => {
        if (!vehicleId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingVehicle(false);
            setVehicleError("No se proporcionó un ID de vehículo válido.");
            return;
        }

        const fetchVehicleProfile = async () => {
            setLoadingVehicle(true);
            setVehicleError(null);
            try {
                // Fetch vehicle info
                const { data: vehicle, error: vError } = await supabase
                    .from("vehiculos")
                    .select("*")
                    .eq("id", vehicleId)
                    .single();

                if (vError) throw vError;
                if (!vehicle) throw new Error("Vehículo no encontrado.");

                // Resolve driver name if assigned
                let driverName = "Por Asignar";
                let fotoDriver = null;
                if (vehicle.ci_driver) {
                    const { data: driverData } = await supabase
                        .from("usuarios")
                        .select("primer_nombre, apellido, foto_url")
                        .eq("ci_user", vehicle.ci_driver)
                        .single();
                    if (driverData) {
                        driverName = `${driverData.primer_nombre || ""} ${driverData.apellido || ""}`.trim();
                        fotoDriver = driverData.foto_url;
                    }
                }

                setVehicleProfile({
                    ...vehicle,
                    driverName,
                    foto_driver: fotoDriver,
                    foto_vehiculo: vehicle.foto_url,
                    fullName: `${vehicle.marca || ""} ${vehicle.modelo || ""}`.trim() || "Vehículo"
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
                console.error("Error fetching vehicle profile:", err);
                setVehicleError(err.message || "Error al cargar la información del vehículo.");
            } finally {
                setLoadingVehicle(false);
            }
        };

        fetchVehicleProfile();
    }, [vehicleId]);

    // Fetch vehicle petitions once profile is loaded
    useEffect(() => {
        if (!vehicleProfile || !vehicleProfile.placa) return;

        const fetchVehiclePetitions = async () => {
            setLoadingPetitions(true);
            try {
                // Fetch peticiones matching this vehicle's plate
                const { data: petitionsData, error: pError } = await supabase
                    .from("peticiones")
                    .select("*")
                    .eq("placa_vehiculo", vehicleProfile.placa);

                if (pError) throw pError;

                if (!petitionsData || petitionsData.length === 0) {
                    setPetitions([]);
                    return;
                }

                // Resolve passenger and driver names, and locations
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

        fetchVehiclePetitions();
    }, [vehicleProfile]);

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

    // Derived vehicle specific stats
    const vehicleTotalTrips = petitions.length;
    const vehicleCancelledTrips = petitions.filter(p =>
        p.estado?.toLowerCase() === "cancelado" || p.estado?.toLowerCase() === "cancelada"
    ).length;

    return {
        vehicleProfile,
        loadingVehicle,
        vehicleError,
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
        vehicleTotalTrips,
        vehicleCancelledTrips,
        sortedPetitions
    };
}
