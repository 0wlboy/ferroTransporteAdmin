import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useGetLocations from "../../hooks/useGetLocations";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { supabase } from "../../../utils/supabase";
import UserForm from "../../components/forms/UserForm";
import DeleteModal from "../../components/modals/DeleteModal";
import { User, Loader2, ArrowLeft, Trash2 } from "lucide-react";

export default function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCurrentUser } = useAuth();
  const { locations } = useGetLocations();
  const {
    updateUser,
    loading: updating,
    error: updateError,
    deleteUser,
    deleting,
  } = useUpdateUser();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop",
  );
  const fileInputRef = useRef(null);

  // Fetch user profile from Supabase by route parameter ID
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setUserProfile(data);
        if (data.foto_url) {
          setAvatarPreview(data.foto_url);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFormSubmit = async (formData) => {
    if (!id) return;

    const result = await updateUser(id, formData, avatarFile);

    if (result.success) {
      // Check if the edited user is the current logged-in user. If so, sync context state.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && session.user.id === userProfile?.auth_id) {
        updateCurrentUser({
          name: result.user.name,
          email: result.user.email,
          ci: result.user.ci,
          avatar: result.user.avatar,
        });
      }
      // Navigate to the appropriate view based on the updated user's role
      const isPassenger = result.user.role === "Pasajero";
      navigate(isPassenger ? "/passenger-view" : "/drivers-view", { replace: true });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const result = await deleteUser(id, userProfile?.role);
    if (result.success) {
      const isPassenger = result.role === "Pasajero";
      navigate(isPassenger ? "/passenger-view" : "/drivers-view", {
        replace: true,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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
          Cargando información del usuario...
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
          Actualización de Usuario
        </h1>
        <p className="text-gray-400 text-xs font-semibold tracking-wide">
          Modifica la información de perfil, departamento y configuración del
          usuario.
        </p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Card (Left) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3E8EB] p-6 shadow-sm">
          <UserForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={updating}
            locations={locations}
            errorMsg={updateError}
            initialData={userProfile}
            isEdit={true}
            hasExternalChanges={!!avatarFile}
          />
        </div>

        {/* Avatar Card (Right) */}
        <div className="bg-white rounded-2xl border border-[#F3E8EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-6 text-center w-full">
            {/* Circle Avatar Wrapper with Bolder Highlighted Border */}
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#8A1538]/20 bg-gray-55 flex items-center justify-center shadow-lg relative group transition-all duration-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Previsualización de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-300" />
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
                Admite imágenes JPG, PNG o WEBP. Tamaño recomendado de
                250x250px.
              </p>
            </div>

            {/* Separator */}
            <div className="w-full border-t border-[#F3E8EB]" />

            {/* Delete User Button */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all w-full justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Usuario</span>
            </button>
            <p className="text-[10px] text-gray-400 font-semibold max-w-[200px] mx-auto leading-normal -mt-3">
              El usuario será marcado como eliminado y no aparecerá en el
              sistema.
            </p>
          </div>
        </div>
      </div>
      {/* Delete User Modal */}
      {showDeleteModal && (
        <DeleteModal
          userName={
            userProfile
              ? `${userProfile.primer_nombre || ""} ${userProfile.apellido || ""}`.trim()
              : ""
          }
          isLoading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
