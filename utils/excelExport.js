import * as XLSX from "xlsx";

/**
 * Utility to export an array of JSON objects to an Excel spreadsheet (.xlsx).
 * Calculates auto-fit column widths for a clean look.
 * 
 * @param {Array<Object>} data - Array of objects containing row data.
 * @param {string} fileNamePrefix - Prefix for the output filename.
 */
export const exportToExcel = (data, fileNamePrefix) => {
    if (!data || data.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    // Auto-fit column widths
    const maxLens = {};
    const keys = Object.keys(data[0]);
    
    // Initial lengths from header titles
    keys.forEach(key => {
        maxLens[key] = key.toString().length;
    });

    // Find maximum length of content per column
    data.forEach(row => {
        keys.forEach(key => {
            const val = row[key];
            if (val !== undefined && val !== null) {
                maxLens[key] = Math.max(maxLens[key], val.toString().length);
            }
        });
    });

    // Apply column widths to worksheet
    ws["!cols"] = keys.map(key => ({
        wch: Math.min(Math.max(maxLens[key] + 3, 10), 50) // Min 10, Max 50 characters wide
    }));

    // Generate filename and save file
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${fileNamePrefix}_${dateStr}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
};
