import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
    // Mock user for testing the dashboard layout and profile details
    const [currentUser, setCurrentUser] = useState({
        email: "administrador@ferrotransporte.com",
        name: "Administrador",
        role: "Administrador"
    });

    const logout = async () => {
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
