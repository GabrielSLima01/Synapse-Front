import { useLanguage } from '@/contexts/LanguageContext';

interface PageFooterProps {
  variant?: 'main' | 'page';
}

export function PageFooter({ variant = 'page' }: PageFooterProps) {
  const { t } = useLanguage();

  if (variant === 'main') {
    return (
      <footer className="bg-primary text-primary-foreground py-6 px-4 mt-auto safe-area-inset">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-accessible-xl font-bold mb-1">
            {t('footerText')}
          </h2>
          <p className="text-accessible-sm opacity-90">
            {t('allRightsReserved')}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-muted border-t-2 border-primary/10 py-4 px-4 mt-auto safe-area-inset">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-accessible-sm text-muted-foreground font-medium">
          {t('footerText')}
        </p>
      </div>
    </footer>
  );
}
