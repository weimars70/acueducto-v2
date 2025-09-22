import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title: string;
  columns: ExportColumn[];
  data: any[];
}

export const exportService = {
  /**
   * Exporta datos a Excel
   */
  exportToExcel(options: ExportOptions): void {
    try {
      // Preparar los datos para Excel
      const excelData = options.data.map(row => {
        const excelRow: any = {};
        options.columns.forEach(col => {
          excelRow[col.label] = this.formatCellValue(row[col.key]);
        });
        return excelRow;
      });

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Configurar anchos de columna
      const colWidths = options.columns.map(col => ({
        wch: col.width || 15
      }));
      ws['!cols'] = colWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, options.title);

      // Descargar archivo
      const filename = `${options.filename}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al exportar a Excel');
    }
  },

  /**
   * Exporta datos a PDF
   */
  exportToPDF(options: ExportOptions): void {
    try {
      // Crear documento PDF
      const doc = new jsPDF();

      // Configurar título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, 14, 22);

      // Configurar fecha
      const currentDate = new Date().toLocaleDateString('es-ES');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de generación: ${currentDate}`, 14, 32);

      // Preparar datos para la tabla
      const tableColumns = options.columns.map(col => col.label);
      const tableRows = options.data.map(row => 
        options.columns.map(col => this.formatCellValue(row[col.key]))
      );

      // Crear tabla
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
        didDrawPage: (data) => {
          // Agregar número de página
          const pageCount = doc.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        }
      });

      // Descargar archivo
      const filename = `${options.filename}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw new Error('Error al exportar a PDF');
    }
  },

  /**
   * Formatea el valor de una celda para exportación
   */
  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Si es un número, formatearlo
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }

    // Si es una fecha, formatearla
    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES');
    }

    // Si es un string que parece una fecha
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES');
      }
    }

    return String(value);
  },

  /**
   * Genera nombre de archivo con timestamp
   */
  generateFilename(baseName: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    return `${baseName}_${timestamp}`;
  }
};