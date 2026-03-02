import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Index() {
  const navigate = useNavigate();
  const { isLanguageSelected } = useLanguage();

  useEffect(() => {
    // Always redirect to language selection first as per requirements
    navigate('/language');
  }, [navigate]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-pulse-soft">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-accessible-lg text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
