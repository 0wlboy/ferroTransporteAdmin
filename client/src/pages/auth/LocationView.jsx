import { useState } from "react";
import useGetLocations from "../../hooks/useGetLocations";
import { LocationCard } from "../../components/cards/LocationCard";
import { Search, FileDown, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LocationView() {
    const { locations } = useGetLocations();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLocations = locations.filter((loc) =>
        loc.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrintPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Localizaciones", 75, 10);
        doc.text("Fecha: " + new Date().toLocaleDateString(), 80, 15);

        // Formatear datos para autotable
        const tableData = filteredLocations.map(loc => [
            loc.id,
            loc.nombre || "N/D",
            loc.latitud && loc.longitud ? `${loc.latitud}° N, ${loc.longitud}° W` : "N/D",
            loc.num_trips ?? 0,
            loc.activo ? "Activo" : "Inactivo"
        ]);

        const tableHeaders = ["ID", "Nombre", "Coordenadas", "Viajes Realizados", "Estado"];

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 20,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [138, 21, 56] } // Brand primary color (#8A1538)
        });
        doc.save("reporte de localizaciones.pdf");
    };

    const handleEdit = (location) => {
        alert(`Editar localización: ${location.nombre} (ID: ${location.id})`);
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
                    <button
                        onClick={() => handlePrintPDF()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary hover:bg-primary-light hover:text-primary transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <FileDown className="w-4 h-4 text-primary" />
                        <span>EXPORTA A PDF</span>
                    </button>
                    <button
                        onClick={() => alert("Función para añadir localización en desarrollo")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary border border-transparent text-white hover:bg-primary-hover transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>AÑADIR LOCALIZACIÓN</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar Section */}
            <div className="bg-white rounded-2xl border border-[#F3E8EB] p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar localizaciones..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400 bg-[#F9FAFB]"
                    />
                </div>
                <div className="text-xs font-semibold text-gray-400">
                    Total: {filteredLocations.length} localizaciones encontradas
                </div>
            </div>

            {/* Grid for Cards */}
            {filteredLocations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#F3E8EB] p-12 text-center text-gray-400 text-sm">
                    No se encontraron localizaciones registradas.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((loc) => (
                        <LocationCard
                            key={loc.id}
                            location={loc}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
