import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetLocations from "../../hooks/useGetLocations";
import { LocationCard } from "../../components/cards/LocationCard";
import DataList from "../../components/UI/DataList";
import ExportDropdown from "../../components/UI/ExportDropdown";
import { exportToExcel } from "../../../utils/excelExport";
import { exportToPDF } from "../../../utils/pdfExport";
import { Plus } from "lucide-react";

export default function LocationView() {
    const navigate = useNavigate();
    const { locations } = useGetLocations();

    const [searchTerm, setSearchTerm] = useState("");

    const filteredLocations = locations.filter((loc) =>
        loc.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrintPDF = () => {
        // Since locations are loaded fully client-side and filtered client-side, we use filteredLocations directly
        const tableData = filteredLocations.map(loc => [
            loc.id,
            loc.nombre || "N/D",
            loc.latitud && loc.longitud ? `${loc.latitud}° N, ${loc.longitud}° W` : "N/D",
            loc.num_trips ?? 0,
            loc.activo ? "Activo" : "Inactivo"
        ]);

        const tableHeaders = ["ID", "Nombre", "Coordenadas", "Viajes Realizados", "Estado"];

        exportToPDF({
            title: "Reporte de Localizaciones",
            headers: tableHeaders,
            data: tableData,
            fileName: "reporte_de_localizaciones"
        });
    };

    const handleExportExcel = () => {
        const exportData = filteredLocations.map(loc => ({
            "ID": loc.id,
            "Nombre": loc.nombre || "",
            "Latitud": loc.latitud || "",
            "Longitud": loc.longitud || "",
            "Coordenadas": loc.latitud && loc.longitud ? `${loc.latitud}° N, ${loc.longitud}° W` : "N/D",
            "Viajes Realizados": loc.num_trips ?? 0,
            "Estado": loc.activo ? "Activo" : "Inactivo"
        }));
        exportToExcel(exportData, "Reporte_Localizaciones");
    };

    const handleEdit = (location) => {
        navigate(`/update-location/${location.id}`);
    };

    const handleDelete = (id) => {
        alert(`Eliminar localización ID: ${id}`);
    };

    return (
        <div className="space-y-8 animate-fade-in select-none">
            {/* Top row: Page title and Print PDF button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Gestion de Localizaciones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra las localizaciones registradas
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportPDF={handlePrintPDF}
                        onExportExcel={handleExportExcel}
                    />
                    <button
                        onClick={() => navigate("/add-location")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>AÑADIR LOCALIZACIÓN</span>
                    </button>
                </div>
            </div>

            {/* Reusable DataList component in Grid layout mode */}
            <DataList
                data={filteredLocations}
                cardWrapper={false}
                renderItem={(loc) => (
                    <LocationCard
                        location={loc}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
                noDataMessage="No se encontraron localizaciones registradas."
                filters={{
                    search: {
                        value: searchTerm,
                        onChange: setSearchTerm,
                        placeholder: "Buscar localizaciones...",
                    },
                }}
                pagination={{
                    totalItems: filteredLocations.length,
                    itemTypeName: "localizaciones encontradas",
                }}
            />
        </div>
    );
}

