import { X, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserProfileModal({ onClose, onLogout }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Mock details matching the screenshot exactly if user details aren't loaded
    const userProfile = {
        name: currentUser?.name || "Javier Arnaldo",
        email: currentUser?.email || "javier.arnaldo@transadmin.com",
        ci: currentUser?.ci || "22834867",
        avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop"
    };

    return (
        <>
            {/* Click-outside transparent overlay */}
            <div 
                onClick={onClose}
                className="fixed inset-0 z-40 bg-transparent"
            />
            
            {/* Right-aligned popover card below header profile button */}
            <div className="absolute top-16 right-6 z-50 bg-white rounded-3xl border border-[#FCE7EB] shadow-2xl w-80 p-6 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col items-center">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-primary hover:bg-[#FAF5F6] transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Centered Profile Avatar */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-primary-light shadow-md mt-4 shrink-0 bg-gray-50 flex items-center justify-center">
                    <img 
                        src={userProfile.avatar} 
                        alt={userProfile.name} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Profile Name */}
                <h3 className="text-gray-900 font-extrabold text-lg mt-5 tracking-tight text-center">
                    {userProfile.name}
                </h3>

                {/* Separator Line */}
                <div className="w-full border-t border-[#F3E8EB] my-5" />

                {/* Details Section */}
                <div className="w-full space-y-4 px-1 mb-6 text-left">
                    {/* Email Row */}
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-xs font-semibold text-gray-500 truncate select-text">
                            {userProfile.email}
                        </span>
                    </div>

                    {/* CI Row */}
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            {/* SVG matching the portrait icon on mockup badge */}
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <circle cx="12" cy="10" r="3" />
                                <path d="M7 17c0-2 2-3 5-3s5 1 5 3" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 select-text">
                            CI: {userProfile.ci}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                    <button 
                        onClick={() => {
                            onClose();
                            navigate("/update-profile");
                        }}
                        className="w-full py-2.5 bg-[#8a1538] hover:bg-[#72102c] text-white font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
                    >
                        Actualizar Perfil
                    </button>
                    
                    <button 
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="w-full py-2.5 bg-white hover:bg-[#FAF5F6] border border-primary text-primary font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer"
                    >
                        Cerrar Sesion
                    </button>
                </div>

            </div>
        </>
    );
}
