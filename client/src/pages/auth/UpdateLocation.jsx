import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";

import { supabase } from "../../../utils/supabase";
import { useUpdateLocation } from "../../hooks/useUpdateLocation";
import LocationForm from "../../components/forms/LocationForm";
import DeleteModal from "../../components/modals/DeleteModal";

// Fix for default marker icon issues under bundlers like Vite
const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to dynamically recenter the map on coordinate updates
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
}

export default function UpdateLocation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateLocation, loading: updating, error: updateError, deleteLocation, deleting } = useUpdateLocation();

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [locationProfile, setLocationProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState(null);

    // Default coordinates center
    const [mapCenter, setMapCenter] = useState([10.4806, -66.9036]);
    const [hasMarker, setHasMarker] = useState(false);

    // Fetch location details
    useEffect(() => {
        if (!id) {
            setLoadingProfile(false);
            return;
        }

        const loadLocation = async () => {
            setLoadingProfile(true);
            setErrorProfile(null);
            try {
                const { data, error } = await supabase
                    .from("localizaciones")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                if (data) {
                    setLocationProfile(data);
                    if (data.lat !== undefined && data.lng !== undefined) {
                        const parsedLat = parseFloat(data.lat);
                        const parsedLng = parseFloat(data.lng);
                        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                            setMapCenter([parsedLat, parsedLng]);
                            setHasMarker(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching location data:", err);
                setErrorProfile("Error al cargar la localización: " + err.message);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadLocation();
    }, [id]);

    const handleFormSubmit = async (formData) => {
        if (!id) return;

        const result = await updateLocation({
            locationId: id,
            name: formData.name,
            lat: formData.lat,
            lng: formData.lng,
            activo: formData.activo
        });

        if (result.success) {
            navigate("/locations-view", { replace: true });
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleCoordinatesChange = ({ lat, lng }) => {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (
            !isNaN(latNum) &&
            !isNaN(lngNum) &&
            latNum >= -90 &&
            latNum <= 90 &&
            lngNum >= -180 &&
            lngNum <= 180
        ) {
            setMapCenter([latNum, lngNum]);
            setHasMarker(true);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;
        const result = await deleteLocation(id);
        if (result.success) {
            navigate("/locations-view", { replace: true });
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    if (loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#8A1538] animate-spin" />
                <p className="text-gray-500 text-sm mt-4 font-semibold">Cargando información de la localización...</p>
            </div>
        );
    }

    if (errorProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] select-none text-center">
                <p className="text-red-600 font-bold mb-4">{errorProfile}</p>
                <button
                    onClick={() => navigate("/locations-view")}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#8A1538] hover:bg-[#72102C] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a localizaciones</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto select-none">
            {/* Header / Title Section */}
            <div className="flex flex-col gap-1.5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#8A1538] transition-colors cursor-pointer mb-2 w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>VOLVER</span>
                </button>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    Editar Localización
                </h1>
                <p className="text-gray-400 text-xs font-semibold tracking-wide">
                    Modifica el nombre, coordenadas y estado de disponibilidad para esta localización.
                </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Form Card (Left) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm">
                    <LocationForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        isLoading={updating}
                        errorMsg={updateError}
                        onCoordinatesChange={handleCoordinatesChange}
                        isEdit={true}
                        initialData={locationProfile}
                    />
                </div>

                {/* Map & Actions Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] overflow-hidden shadow-sm flex flex-col justify-between min-h-[450px]">
                    <div className="relative z-0 flex-1 min-h-[300px]">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: "100%", width: "100%", minHeight: "300px" }}
                            zoomControl={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {hasMarker && <Marker position={mapCenter} icon={customIcon} />}
                            <RecenterMap center={mapCenter} />
                        </MapContainer>
                    </div>

                    {/* Action Panel at Bottom of Card */}
                    <div className="p-6 border-t border-[#F3E8EB] bg-[#FAF5F6]/30 flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all w-full justify-center"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Localización</span>
                        </button>
                        <p className="text-[10px] text-gray-400 font-semibold max-w-[240px] text-center leading-normal">
                            La localización será marcada como eliminada y no aparecerá en las rutas del sistema.
                        </p>
                    </div>
                </div>
            </div>

            {/* Delete Location Modal */}
            {showDeleteModal && (
                <DeleteModal
                    userName={locationProfile?.nombre || "esta localización"}
                    isLoading={deleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}
        </div>
    );
}
