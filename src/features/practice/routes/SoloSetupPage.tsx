import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { UploadCloud, FileText, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function SoloSetupPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate PDF only
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error(t('practice.solo.setup.fileErrorPdf'));
      setFile(null);
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error(t('practice.solo.setup.fileErrorSize'));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    toast.success(`${selectedFile.name} uploaded successfully`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description || !duration) return;

    const pdfUrl = URL.createObjectURL(file);

    navigate("/practice/session", {
      state: {
        pdfUrl,
        description,
        duration: parseInt(duration),
        fileName: file.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      {/* Simple Navbar */}
      <nav className="h-20 border-b border-warm-border bg-white/50 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-brown/5 text-brown transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-display text-lg font-bold text-brown">
            {t('practice.solo.setup.title')}
          </span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-teal/5 blur-[80px]" />

        <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] border border-warm-border shadow-xl shadow-brown/5 p-8 sm:p-12">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-brown mb-3">
              {t('practice.solo.setup.title')}
            </h1>
            <p className="text-brown-muted mb-4">
              {t('practice.solo.setup.subtitle')}
            </p>
            
            {/* Info box: How to convert PPT to PDF */}
            <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 text-left max-w-xl mx-auto">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-teal-dark mb-2">
                    {t('practice.solo.setup.convertPpt')}
                  </p>
                  <p className="text-xs text-brown-muted leading-relaxed">
                    {t('practice.solo.setup.convertPptHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-bold text-brown mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal" />
                {t('practice.solo.setup.fileLabel')}
              </label>

              <div
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  file 
                    ? "border-teal bg-teal/5" 
                    : "border-warm-border bg-cream-warm/50 hover:bg-cream-warm hover:border-brown/30"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />

                {file ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 mb-3">
                      <FileText className="h-6 w-6 text-teal-dark" />
                    </div>
                    <p className="text-sm font-bold text-teal-dark">
                      {file.name}
                    </p>
                    <p className="text-xs text-teal mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-warm-border mb-3">
                      <UploadCloud className="h-5 w-5 text-brown-muted" />
                    </div>
                    <p className="text-sm font-bold text-brown">
                      {t('practice.solo.setup.dragDrop')}
                    </p>
                    <p className="text-xs text-brown-muted mt-2">
                      {t('practice.solo.setup.pdfOnly')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-brown mb-3"
              >
                {t('practice.solo.setup.descriptionLabel')}
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('practice.solo.setup.descriptionPlaceholder')}
                className="block w-full rounded-2xl border border-warm-border p-4 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 bg-white transition-all resize-none shadow-sm"
              />
              <p className="mt-2 text-xs text-brown-muted">
                {t('practice.solo.setup.descriptionHint')}
              </p>
            </div>

            {/* Duration Section */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-bold text-brown mb-3"
              >
                {t('practice.solo.setup.durationLabel')}
              </label>
              <div className="relative">
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={t('practice.solo.setup.durationPlaceholder')}
                  className="block w-full rounded-2xl border border-warm-border p-4 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 bg-white transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-muted text-sm font-medium">
                  {t('practice.solo.setup.durationUnit')}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!file || !description || !duration}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-brown px-6 py-4 text-sm sm:text-base font-semibold text-cream shadow-lg transition-all duration-200 hover:bg-brown/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <span className="hidden sm:inline">{t('practice.solo.setup.button')}</span>
                <span className="sm:hidden">Start Practice</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
