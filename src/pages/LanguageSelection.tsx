import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Check, Globe } from 'lucide-react';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { language, setLanguage, setIsLanguageSelected, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const handleContinue = () => {
    setLanguage(selectedLang);
    setIsLanguageSelected(true);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center animate-scale-in">
              <Globe className="w-10 h-10" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-accessible-2xl font-bold mb-2 animate-fade-in">
            FENEARTE
          </h1>
          <p className="text-accessible-lg opacity-90 animate-fade-in animation-delay-100">
            26ª Edição
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-accessible-xl font-bold text-center text-foreground mb-8 animate-fade-in animation-delay-200">
            {t('selectLanguage')}
          </h2>

          <div className="space-y-4">
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`
                  w-full flex items-center gap-4 p-5 rounded-2xl border-4 transition-all duration-200
                  opacity-0 animate-slide-up
                  ${selectedLang === lang.code
                    ? 'border-primary bg-primary/10 shadow-button'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-card'
                  }
                `}
                style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'forwards' }}
                aria-pressed={selectedLang === lang.code}
              >
                <span className="text-4xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <span className="text-accessible-lg font-semibold text-foreground flex-1 text-left">
                  {lang.name}
                </span>
                {selectedLang === lang.code && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Continue Button */}
      <div className="p-4 bg-background safe-area-inset">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            className="w-full py-5 px-8 bg-primary text-primary-foreground rounded-2xl text-accessible-xl font-bold
                       shadow-button hover:shadow-button-hover hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 animate-fade-in animation-delay-500"
          >
            {t('continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
