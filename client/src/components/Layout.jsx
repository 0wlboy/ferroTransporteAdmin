import { useState } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./UI/Sidebar";
import Header from "./UI/Header";
import UserProfileModal from "./modals/UserProfile";

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    // Determine header title based on route path
    const getHeaderTitle = () => {
        if (location.pathname.startsWith("/user-activity")) {
            return "Actividad de Usuario";
        }
        if (location.pathname.startsWith("/car-activity")) {
            return "Actividad de Vehículo";
        }
        if (location.pathname.startsWith("/update-car")) {
            return "Dashboard";
        }
        switch (location.pathname) {
            case "/petitions-view":
                return "Peticiones";
            case "/passenger-view":
                return "Pasajeros";
            case "/driver-view":
                return "Conductores";
            case "/vehicle-view":
                return "Vehículos";
            case "/locations-view":
                return "Localizaciones";
            case "/home-view":
                return "Home";
            case "/add-passenger":
            case "/add-driver":
            case "/add-car":
            case "/update-profile":
                return "Dashboard";
            case "/add-location":
                return "Añadir Localizaciones";

            default:
                return "Panel de Administración";
        }
    };

    return (
        <div className="flex h-screen bg-main-bg overflow-hidden font-sans antialiased text-gray-800">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-[#F3E8EB] transition-all duration-300 shrink-0 ${collapsed ? "w-20" : "w-64"
                    }`}
            >
                <Sidebar
                    collapsed={collapsed}
                    setMobileOpen={setMobileOpen}
                    handleLogout={handleLogout}
                />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-64 bg-white flex flex-col z-10 transition-transform duration-300">
                        <Sidebar
                            collapsed={false}
                            setMobileOpen={setMobileOpen}
                            handleLogout={handleLogout}
                        />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <Header
                    title={getHeaderTitle()}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                    onProfileClick={() => setIsProfileOpen(true)}
                />

                {isProfileOpen && (
                    <UserProfileModal
                        onClose={() => setIsProfileOpen(false)}
                        onLogout={handleLogout}
                    />
                )}

                {/* Page Content View */}
                <main className="flex-1 overflow-y-auto bg-main-bg p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}