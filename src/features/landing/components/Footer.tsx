import { useLanguage } from '../../../contexts/LanguageContext';
import logoUntion from '../../../assets/icon-untion.png';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="footer" className="border-t border-warm-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-1.5">
            <img 
              src={logoUntion} 
              alt="Untion Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-lg font-bold text-brown">
              Untion
            </span>
          </div>

          <p className="text-sm text-brown-muted text-center sm:text-left">
            {t('footer.tagline')}
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-brown-muted transition-colors hover:text-brown">
              GitHub
            </a>
            <a href="#" className="text-sm font-medium text-brown-muted transition-colors hover:text-brown">
              Demo
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-warm-border pt-8 sm:flex-row">
          <p className="text-xs text-brown-muted/60">
            &copy; {new Date().getFullYear()} {t('footer.description')}
          </p>
          <p className="text-xs text-brown-muted/40">
            {t('footer.credit')}
          </p>
        </div>
      </div>
    </footer>
  );
}
