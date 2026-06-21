import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useGetLocations from "../../../hooks/useGetLocations";
import { useUpdateUser } from "../../../hooks/useUpdateUser";
import { supabase } from "../../../../utils/supabase";
import UserForm from "../../../components/forms/UserForm";
import { User, Loader2, ArrowLeft } from "lucide-react";

export default function UpdateAdminProfile() {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAuth();
  const { locations } = useGetLocations();
  const { updateUser, loading: updating, error: updateError } = useUpdateUser();

  // Profile state
  const [adminProfile, setAdminProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser?.avatar ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop",
  );
  const fileInputRef = useRef(null);

  // Fetch full user profile to get id_gerencia
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (error) throw error;

        setAdminProfile(data);
        if (data.foto_url) {
          setAvatarPreview(data.foto_url);
        }
      } catch (err) {
        console.error("Error fetching full admin profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleFormSubmit = async (formData) => {
    if (!currentUser?.id) return;

    const result = await updateUser(currentUser.id, formData, avatarFile);

    if (result.success) {
      // Update auth context state and localstorage
      updateCurrentUser({
        name: result.user.name,
        email: result.user.email,
        ci: result.user.ci,
        avatar: result.user.avatar,
      });
      // Redirect home
      navigate(-1);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
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
        <p className="text-gray-500 text-sm mt-4">
          Cargando información del perfil...
        </p>
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
          Actualizacion de Perfil
        </h1>
        <p className="text-gray-400 text-xs font-semibold tracking-wide">
          Administra tu información personal y preferencias de seguridad.
        </p>
      </div>

      {/* Layout Grid Matching the Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Card (Left) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-6 shadow-sm">
          <UserForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={updating}
            locations={locations}
            errorMsg={updateError}
            initialData={adminProfile}
            isEdit={true}
            hasExternalChanges={!!avatarFile}
          />
        </div>

        {/* Avatar Card (Right) */}
        <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-6 text-center w-full">
            {/* Circle Avatar Wrapper with Bolder Highlighted Border */}
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#8A1538]/20 bg-gray-50 flex items-center justify-center shadow-lg relative group transition-all duration-300">
              <img
                src={avatarPreview}
                alt="Previsualización de perfil"
                className="w-full h-full object-cover"
              />
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
                Admite imágenes JPG, PNG o WEBP. Tamaño recomendado de
                250x250px.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
