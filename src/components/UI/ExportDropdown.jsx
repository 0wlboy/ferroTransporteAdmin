import { useState, useRef, useEffect } from "react";
import { FileDown, FileText, Table } from "lucide-react";

/**
 * Reusable dropdown component to let users choose between PDF and Excel export.
 * Handles click outside and manages export loading state.
 * 
 * @param {Object} props
 * @param {Function} props.onExportPDF - Callback function for exporting PDF.
 * @param {Function} props.onExportExcel - Callback function for exporting Excel.
 */
export default function ExportDropdown({ onExportPDF, onExportExcel }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePDF = async () => {
        setIsOpen(false);
        setIsExporting(true);
        try {
            await onExportPDF();
        } catch (err) {
            console.error("Error exporting to PDF:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExcel = async () => {
        setIsOpen(false);
        setIsExporting(true);
        try {
            await onExportExcel();
        } catch (err) {
            console.error("Error exporting to Excel:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !isExporting && setIsOpen(!isOpen)}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-primary text-primary transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm hover:bg-primary-light hover:text-primary ${
                    isExporting ? "opacity-75 cursor-not-allowed" : ""
                }`}
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                    <FileDown className="w-4 h-4 text-primary" />
                )}
                <span>{isExporting ? "EXPORTANDO..." : "EXPORTAR"}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in">
                    <button
                        type="button"
                        onClick={handleExcel}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer text-left"
                    >
                        <Table className="w-4.5 h-4.5 text-emerald-600" />
                        <span>Exportar a Excel</span>
                    </button>
                    <button
                        type="button"
                        onClick={handlePDF}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left border-t border-gray-50"
                    >
                        <FileText className="w-4.5 h-4.5 text-rose-600" />
                        <span>Exportar a PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
}
