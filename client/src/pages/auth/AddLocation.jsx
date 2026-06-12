import { useNavigate } from "react-router-dom";

import { useAddLocation } from "../../hooks/useAddLocation";
import LocationForm from "../../components/forms/LocationForm";
import mapPreview from "../../assets/map_preview.png";

export default function AddLocation() {
    const navigate = useNavigate();
    const { addLocation, loading, error } = useAddLocation();

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
                    />
                </div>

                {/* Map Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <img
                        src={mapPreview}
                        alt="Vista de Mapa Satelital"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
