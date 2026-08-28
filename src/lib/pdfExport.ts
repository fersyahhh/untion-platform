import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface ExportOptions {
  filename: string;
  elementId: string;
  onProgress?: (progress: number) => void;
}

/**
 * Export HTML element to PDF with proper pagination
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { filename, elementId, onProgress } = options;

  try {
    onProgress?.(10);

    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    onProgress?.(20);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 200));

    onProgress?.(30);

    // Convert element to high-quality PNG WITHOUT modifying the DOM
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2.5, // High quality for sharp text
      backgroundColor: '#FEFBF6',
      cacheBust: true,
      skipFonts: false,
      includeQueryParams: false,
      filter: (node) => {
        // Filter out elements we don't want
        if (node instanceof HTMLElement) {
          return !node.classList.contains('toast') && 
                 !node.classList.contains('modal') &&
                 !node.classList.contains('no-export');
        }
        return true;
      },
    });

    onProgress?.(70);

    // Create image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    onProgress?.(80);

    // PDF dimensions (A4)
    const pdfWidth = 210; // mm
    const pdfHeight = 297; // mm
    const margin = 10; // mm
    const contentWidth = pdfWidth - (2 * margin);
    
    // Calculate image dimensions to fit PDF width
    const imgWidthMM = contentWidth;
    const imgHeightMM = (img.height * imgWidthMM) / img.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    onProgress?.(85);

    // If content fits in one page
    if (imgHeightMM <= pdfHeight - (2 * margin)) {
      // Single page - centered
      pdf.addImage(
        dataUrl, 
        'PNG', 
        margin, 
        margin, 
        imgWidthMM, 
        imgHeightMM,
        undefined,
        'FAST'
      );
    } else {
      // Multiple pages needed - proper pagination
      const pageContentHeight = pdfHeight - (2 * margin); // Available height per page in mm
      let srcYPixels = 0; // Track position in source image (pixels)

      while (srcYPixels < img.height) {
        // Calculate how much image height (in mm) we can fit on this page
        const remainingImgHeightMM = ((img.height - srcYPixels) / img.height) * imgHeightMM;
        const sliceHeightMM = Math.min(pageContentHeight, remainingImgHeightMM);
        
        // Convert back to pixels for canvas slicing
        const sliceHeightPixels = Math.round((sliceHeightMM / imgHeightMM) * img.height);

        // Create a canvas for this page slice
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size to match the slice
        canvas.width = img.width;
        canvas.height = sliceHeightPixels;
        
        // Fill background
        ctx.fillStyle = '#FEFBF6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image slice
        ctx.drawImage(
          img,
          0, srcYPixels,           // Source x, y
          img.width, sliceHeightPixels,  // Source width, height
          0, 0,                    // Destination x, y
          canvas.width, canvas.height    // Destination width, height
        );

        // Convert canvas to data URL
        const sliceDataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Add to PDF
        pdf.addImage(
          sliceDataUrl,
          'PNG',
          margin,
          margin,
          imgWidthMM,
          sliceHeightMM,
          undefined,
          'FAST'
        );

        // Move to next slice
        srcYPixels += sliceHeightPixels;

        // Add new page if there's more content
        if (srcYPixels < img.height) {
          pdf.addPage();
        }
      }
    }

    onProgress?.(95);

    // Save PDF
    pdf.save(filename);

    onProgress?.(100);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF Export Error:', error);
    throw new Error(`PDF export failed: ${errorMessage}`);
  }
}

/**
 * Export evaluation result to PDF
 */
export async function exportEvaluationToPDF(
  userName: string,
  sessionType: 'solo' | 'group',
  _date: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Untion_${sessionType}_${sanitizedUserName}_${timestamp}.pdf`;
  
  await exportToPDF({
    filename,
    elementId: 'evaluation-result',
    onProgress,
  });
}
