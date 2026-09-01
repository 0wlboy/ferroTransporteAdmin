import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Users,
  Truck,
  Bus,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/home-view", label: "Home", icon: Home, end: true },
  {
    to: "/petitions-view",
    label: "Peticiones",
    icon: ClipboardList,
    end: false,
  },
  { to: "/passenger-view", label: "Pasajeros", icon: Users, end: false },
  { to: "/drivers-view", label: "Conductores", icon: Truck, end: false },
  { to: "/vehicle-view", label: "Vehículos", icon: Bus, end: false },
  { to: "/locations-view", label: "Localizaciones", icon: MapPin, end: false },
];

export default function Sidebar({ collapsed, setMobileOpen }) {
  return (
    <div className="flex flex-col h-full bg-sidebar-bg border-r border-[#F3E8EB] select-none">
      {/* Logo Header */}
      <div
        className={`flex items-center gap-3 px-5 py-6 border-b border-[#F3E8EB] ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/10">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10"
            />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[#8A1538] text-base font-black tracking-tight leading-tight">
              Administrador
            </span>
            <span className="text-gray-400 text-xs font-semibold leading-tight mt-0.5">
              Servicio de viajes
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-primary-light text-primary border-l-4 border-primary pl-2.5"
                  : "text-gray-600 hover:text-primary hover:bg-[#FAF5F6]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-primary"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 tracking-wide">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
