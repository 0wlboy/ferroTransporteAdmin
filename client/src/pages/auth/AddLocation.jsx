import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useAddLocation } from "../../hooks/useAddLocation";
import LocationForm from "../../components/forms/LocationForm";

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

export default function AddLocation() {
    const navigate = useNavigate();
    const { addLocation, loading, error } = useAddLocation();

    // Default coordinates center (Caracas)
    const [mapCenter, setMapCenter] = useState([10.4806, -66.9036]);
    const [hasMarker, setHasMarker] = useState(false);

    const handleFormSubmit = async (formData) => {
        const result = await addLocation(formData);

        if (result.success) {
            // Navigate back to the locations view on successful creation
            navigate("/locations-view");
        }
    };

    const handleCancel = () => {
        navigate("/locations-view");
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

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto select-none">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    Añadir Localizaciones
                </h1>
                <p className="text-gray-400 text-xs font-semibold tracking-wide">
                    Administra los conductores registrados
                </p>
            </div>

            {/* Layout Grid matching the mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Form Card (Left) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm">
                    <LocationForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        isLoading={loading}
                        errorMsg={error}
                        onCoordinatesChange={handleCoordinatesChange}
                    />
                </div>

                {/* Map Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] overflow-hidden shadow-sm flex flex-col min-h-[400px] relative z-0">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%", minHeight: "400px" }}
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
            </div>
        </div>
    );
}

