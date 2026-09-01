import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Utility to export data to a PDF document with custom branding.
 * 
 * @param {Object} options
 * @param {string} options.title - The title of the report.
 * @param {Array<string>} [options.subtitles] - Additional subtitles to print under the main title.
 * @param {Array<string>} options.headers - Array of header strings.
 * @param {Array<Array<any>>} options.data - Matrix of row cells corresponding to the headers.
 * @param {string} options.fileName - Output filename.
 * @param {Array<number>} [options.themeColor] - Primary branding color RGB (defaults to [#8A1538]).
 */
export const exportToPDF = ({
    title,
    subtitles = [],
    headers,
    data,
    fileName,
    themeColor = [138, 21, 56] // Brand primary color (#8A1538)
}) => {
    if (!data || data.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const doc = new jsPDF();

    // Page title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 30);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 14, { align: "center" });

    // Subtitles
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    
    let currentY = 20;
    
    // Add emission date if not provided
    const allSubtitles = [...subtitles];
    const dateStr = `Fecha Emisión: ${new Date().toLocaleDateString()}`;
    if (!allSubtitles.includes(dateStr) && !allSubtitles.some(s => s.toLowerCase().includes("fecha"))) {
        allSubtitles.push(dateStr);
    }

    allSubtitles.forEach(sub => {
        if (sub) {
            doc.text(sub, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
            currentY += 5;
        }
    });

    // Render table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: currentY + 2,
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { 
            fillColor: themeColor, 
            textColor: [255, 255, 255], 
            fontStyle: "bold" 
        },
        alternateRowStyles: { 
            fillColor: [248, 249, 250] 
        },
        margin: { top: 15, bottom: 15 },
        didDrawPage: (data) => {
            // Footer page numbers
            const str = "Pág " + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(str, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        }
    });

    const fileToSave = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    doc.save(fileToSave);
};
