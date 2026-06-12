import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetLocations from "../../hooks/useGetLocations";
import { useAddUser } from "../../hooks/useAddUser";
import UserForm from "../../components/forms/UserForm";
import ImagePicker from "../../components/inputs/ImgPicker";
import { User } from "lucide-react"

export default function AddDriver() {
    const navigate = useNavigate();
    const { locations } = useGetLocations();
    const { addUser, loading, error } = useAddUser();
    const [avatarFile, setAvatarFile] = useState(null);

    const handleFormSubmit = async (formData) => {
        const result = await addUser(
            {
                ...formData,
                role: "Conductor"
            },
            avatarFile
        );

        if (result.success) {
            navigate("/driver-view");
        }
    };

    const handleCancel = () => {
        navigate("/driver-view");
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto select-none">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    Añadir Nuevo Conductor
                </h1>
                <p className="text-gray-400 text-xs font-semibold tracking-wide">
                    Administra la información personal de tus conductores.
                </p>
            </div>

            {/* Layout Grid matching the mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Form Card (Left) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-6 shadow-sm">
                    <UserForm
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        isLoading={loading}
                        locations={locations}
                        errorMsg={error}
                    />
                </div>

                {/* Avatar Picker Card (Right) */}
                <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <ImagePicker
                            icon={User}
                            bucketName="fotosPerfil"
                            placeholderType="user"
                            onFileSelect={setAvatarFile}
                        />
                        <div className="mt-2 space-y-1">
                            <p className="text-xs font-black text-gray-800 uppercase tracking-wider">
                                Foto de Perfil
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
