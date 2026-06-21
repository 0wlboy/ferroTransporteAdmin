import React from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ title, collapsed, setCollapsed, mobileOpen, setMobileOpen, onProfileClick }) {
    const { currentUser } = useAuth();
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F3E8EB] shrink-0 select-none">
            {/* Left side: Menu toggles & Title */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-500 hover:text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>



                {/* Page Title */}
                <h2 className="text-[#8A1538] font-bold text-sm md:text-base tracking-wide pl-2">
                    {title || "Titulo de Pagina"}
                </h2>
            </div>

            {/* Right side: Profile Pill Button */}
            <div className="flex items-center">
                <button
                    onClick={onProfileClick || (() => alert("Modal de Perfil (Próximamente)"))}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-full shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/15 transition-all cursor-pointer border border-[#9A2247]"
                >
                    {/* Profile Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <img
                            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"}
                            alt="Administrador Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.target.style.display = "none";
                                e.target.parentNode.innerHTML = `<span class="flex items-center justify-center w-full h-full text-[11px] font-bold text-primary bg-primary-light">AD</span>`;
                            }}
                        />
                    </div>
                    {/* Profile Text */}
                    <span className="text-xs font-black tracking-wider leading-none">
                        PERFIL
                    </span>
                </button>
            </div>
        </header>
    );
}
