import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { useUpdateCar } from "../../hooks/useUpdateCar";
import CarForm from "../../components/forms/CarForm";
import { Car, Loader2, ArrowLeft } from "lucide-react";

export default function UpdateCar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateCar, loading: updating, error: updateError } = useUpdateCar();

    // Vehicle and drivers state
    const [vehicleProfile, setVehicleProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [drivers, setDrivers] = useState([]);

    // Avatar / Photo upload state
    const [carImageFile, setCarImageFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=250&auto=format&fit=crop"
    );
    const fileInputRef = useRef(null);

    // Fetch vehicle profile and drivers list
    useEffect(() => {
        if (!id) {
            setLoadingProfile(false);
            return;
        }

        const loadData = async () => {
            setLoadingProfile(true);
            try {
                // 1. Fetch vehicle profile
                const { data: vehicle, error: vError } = await supabase
                    .from("vehiculos")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (vError) throw vError;
                if (vehicle) {
                    setVehicleProfile(vehicle);
                    if (vehicle.foto_url) {
                        setAvatarPreview(vehicle.foto_url);
                    }
                }

                // 2. Fetch active drivers for dropdown assignment
                const { data: driversData, error: dError } = await supabase
                    .from("usuarios")
                    .select("ci_user, primer_nombre, apellido")
                    .eq("role", "Conductor")
                    .eq("activo", true)
                    .order("primer_nombre", { ascending: true });

                if (dError) {
                    console.error("Error loading drivers:", dError.message);
                } else if (driversData) {
                    setDrivers(driversData);
                }
            } catch (err) {
                console.error("Error fetching vehicle edit data:", err);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadData();
    }, [id]);

    const handleFormSubmit = async (formData) => {
        if (!id) return;

        const result = await updateCar(
            id,
            formData,
            carImageFile
        );

        if (result.success) {
            // Navigate back to the vehicle activity view
            navigate(`/car-activity/${id}`);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCarImageFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    if (loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#8A1538] animate-spin" />
                <p className="text-gray-500 text-sm mt-4">Cargando información del vehículo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto select-none">
            {/* Header / Title Section */}
            <div className="flex flex-col gap-1.5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#8A1538] transition-colors cursor-pointer mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>VOLVER</span>
                </button>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    Editar Vehículo
                </h1>
                <p className="text-gray-400 text-xs font-semibold tracking-wide">
                    Modifica los detalles técnicos y conductor asignado para este vehículo.
                </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Form Card (Left) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-6 shadow-sm">
                    <CarForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        isLoading={updating}
                        drivers={drivers}
                        errorMsg={updateError}
                        initialData={vehicleProfile}
                        isEdit={true}
                        hasExternalChanges={!!carImageFile}
                    />
                </div>

                {/* Photo Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-6 text-center w-full">
                        {/* Circle/Box Photo Wrapper */}
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-[#8A1538]/20 bg-gray-50 flex items-center justify-center shadow-lg relative group transition-all duration-300">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Foto del vehículo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Car className="w-16 h-16 text-gray-300" />
                            )}
                        </div>

                        {/* Hidden input to upload file */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Styled Button and Helpers */}
                        <div className="space-y-3 w-full">
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#72102C] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-[#8A1538]/10 hover:shadow-lg transition-all"
                            >
                                Cargar Foto
                            </button>
                            <p className="text-[10px] text-gray-400 font-semibold max-w-[200px] mx-auto leading-normal">
                                Admite imágenes JPG, PNG o WEBP. Se recomienda una vista clara del vehículo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
