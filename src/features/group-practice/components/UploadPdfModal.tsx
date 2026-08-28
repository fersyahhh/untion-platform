import { useState } from "react";
import { X, Upload, FileText, AlertCircle, Loader2, Lightbulb } from "lucide-react";
import { pdfjs } from "react-pdf";
import { useLanguage } from "../../../contexts/LanguageContext";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, duration: number, totalSlides: number) => void;
}

export default function UploadPdfModal({
  isOpen,
  onClose,
  onUpload,
}: UploadPdfModalProps) {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Hanya file PDF yang diperbolehkan");
      setIsProcessing(false);
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 50MB");
      setIsProcessing(false);
      return;
    }

    try {
      // Get PDF page count using PDF.js
      const arrayBuffer = await file.arrayBuffer();
      await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      setSelectedFile(file);
      setIsProcessing(false);
    } catch (err) {
      setError("File PDF tidak valid atau rusak");
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Get page count again (we need it for callback)
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalSlides = pdf.numPages;
      
      // Call parent callback with file, duration, and slide count
      onUpload(selectedFile, duration, totalSlides);
      
      // Reset state
      setSelectedFile(null);
      setDuration(5);
      setIsUploading(false);
    } catch (err) {
      setError("Gagal upload PDF. Silakan coba lagi.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-warm-border overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-warm-border px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brown">{t('modal.uploadPDF.title')}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-cream-warm transition-colors text-brown-muted hover:text-brown"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-bold text-brown mb-2">
              {t('modal.uploadPDF.fileLabel')}
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging
                  ? "border-teal bg-teal/5"
                  : "border-warm-border bg-cream-warm/30 hover:bg-cream-warm"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
                disabled={isUploading}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-teal" />
                  <div className="text-left min-w-0">
                    <p className="font-bold text-brown text-sm truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-brown-muted">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-brown-muted hover:text-brown shrink-0"
                    disabled={isUploading || isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 text-teal animate-spin" />
                  <p className="text-xs text-brown-muted">{t('modal.uploadPDF.processing')}</p>
                </div>
              ) : (
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-6 w-6 text-brown-muted" />
                  <p className="font-bold text-brown text-sm">
                    {t('modal.uploadPDF.dragDrop')}
                  </p>
                  <p className="text-xs text-brown-muted">
                    {t('modal.uploadPDF.maxSize')}
                  </p>
                </label>
              )}
            </div>

            {error && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-brown mb-2">
              {t('modal.uploadPDF.durationLabel')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 h-2 bg-warm-border rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1D2A44 0%, #1D2A44 ${(duration / 15) * 100}%, #E2DACD ${(duration / 15) * 100}%, #E2DACD 100%)`
                }}
                disabled={isUploading}
              />
              <div className="w-12 text-center px-2 py-2 bg-cream-warm rounded-lg border border-warm-border font-bold text-sm text-brown">
                {duration}
              </div>
            </div>
            <p className="text-xs text-brown-muted mt-2">
              {t('modal.uploadPDF.durationHelper').replace('{duration}', duration.toString())}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-warm-border" />

          {/* Tips */}
          <div className="bg-cream-warm/30 border border-warm-border rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-teal shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brown text-xs mb-1">{t('modal.uploadPDF.tips')}</p>
                <ul className="space-y-0.5 text-xs text-brown-muted">
                  <li>• {t('modal.uploadPDF.tip1')}</li>
                  <li>• {t('modal.uploadPDF.tip2')}</li>
                  <li>• {t('modal.uploadPDF.tip3')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 rounded-lg border border-warm-border text-brown font-bold hover:bg-cream-warm transition-colors disabled:opacity-50 text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !!error || isUploading || isProcessing}
              className="flex-1 py-2.5 px-4 rounded-lg bg-teal text-white font-bold hover:bg-teal-light transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('modal.uploadPDF.uploading')}
                </>
              ) : (
                t('common.upload')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
