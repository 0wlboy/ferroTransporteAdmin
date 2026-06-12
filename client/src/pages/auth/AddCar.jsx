import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { Car } from "lucide-react"
import { useAddCar } from "../../hooks/useAddCar";
import CarForm from "../../components/forms/CarForm";
import ImagePicker from "../../components/inputs/ImgPicker";

export default function AddCar() {
    const navigate = useNavigate();
    const { addCar, loading, error } = useAddCar();
    const [avatarFile, setAvatarFile] = useState(null);
    const [drivers, setDrivers] = useState([]);

    // Fetch drivers on mount to assign to the vehicle
    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const { data, error: driversError } = await supabase
                    .from("usuarios")
                    .select("ci_user, primer_nombre, apellido")
                    .eq("role", "Conductor")
                    .eq("activo", true)
                    .order("primer_nombre", { ascending: true });

                if (driversError) {
                    console.error("Error loading drivers:", driversError.message);
                } else if (data) {
                    setDrivers(data);
                }
            } catch (err) {
                console.error("Exception fetching drivers:", err);
            }
        };

        fetchDrivers();
    }, []);

    const handleFormSubmit = async (formData) => {
        const result = await addCar(formData, avatarFile);

        if (result.success) {
            // Navigate back to the vehicle view on successful creation
            navigate("/vehicle-view");
        }
    };

    const handleCancel = () => {
        navigate("/vehicle-view");
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto select-none">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    Añadir Nuevo Vehículo
                </h1>
                <p className="text-gray-400 text-xs font-semibold tracking-wide">
                    Administra la información de tu vehículo.
                </p>
            </div>

            {/* Layout Grid matching the mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Form Card (Left) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-6 shadow-sm">
                    <CarForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        isLoading={loading}
                        drivers={drivers}
                        errorMsg={error}
                    />
                </div>

                {/* Avatar Picker Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <ImagePicker
                            shape="rounded-xl"
                            icon={Car}
                            bucketName="fotosVehiculos"
                            placeholderType="car"
                            onFileSelect={setAvatarFile}
                        />
                        <div className="mt-2 space-y-1">
                            <p className="text-xs font-black text-gray-800 uppercase tracking-wider">
                                Foto del Vehículo
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold max-w-[180px] mx-auto">
                                Selecciona una imagen desde tu equipo haciendo clic sobre el círculo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
