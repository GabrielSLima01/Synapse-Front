import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
}

export function PageHeader({ title, showBack = true, showHome = true }: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-primary/20 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors p-2 -ml-2 rounded-lg"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            <span className="sr-only md:not-sr-only text-accessible-base font-semibold">{t('back')}</span>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <h1 className="text-accessible-lg font-bold text-foreground text-center flex-1 px-2">
          {title}
        </h1>

        {showHome ? (
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors p-2 -mr-2 rounded-lg"
            aria-label={t('home')}
          >
            <Home className="w-6 h-6" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
