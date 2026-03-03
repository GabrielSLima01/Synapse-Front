/**
 * ============================================================
 * LOGIN.TSX - PÁGINA DE LOGIN
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Formulário de login para usuários e administradores.
 * Admin é redirecionado diretamente para /admin após login.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. FORMULÁRIO DE LOGIN
 *    - Campo: Numero de WhatsApp
 *    - Botão de submit
 *    
 *    BACKEND NECESSÁRIO:
 *    - POST /api/auth/login
 *    - Body: { whatsapp: string }
 *    - Retorna: { message: string }
 *    - Erros: 404 se usuario nao existe
 *
 * 1.1 CONFIRMACAO
 *    - POST /api/auth/verify
 *    - Body: { whatsapp: string, codigo: string }
 *    - Retorna: { token: string, user: { id, whatsapp, isAdmin } }
 * 
 * 2. REDIRECIONAMENTO PÓS-LOGIN
 *    - Se isAdmin = true → redireciona para /admin
 *    - Se isAdmin = false → redireciona para /home
 *    
 *    BACKEND: Retornar isAdmin no objeto user
 * 
 * 3. LINK PARA CADASTRO
 *    - Navega para /signup
 *    
 *    BACKEND: Não requer
 * 
 * ============================================================
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * LoginRequest:
 * {
 *   whatsapp: string
 * }
 * 
 * LoginResponse:
 * {
 *   message: string
 * }
 * 
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import PhoneInput from '@/components/PhoneInput';
import { LogIn, AlertCircle, ShieldCheck, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const { t } = useLanguage();
  const { requestLoginCode, verifyCode, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // ============================================================
  // ESTADOS DO FORMULÁRIO
  // ============================================================
  
  /** Login do usuário */
  const [whatsapp, setWhatsapp] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /** Mensagem de erro */
  const [error, setError] = useState('');

  /** Rate limit countdown */
  const [lockSeconds, setLockSeconds] = useState(0);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, []);

  const startLockTimer = (seconds: number) => {
    setLockSeconds(seconds);
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    lockTimerRef.current = setInterval(() => {
      setLockSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(lockTimerRef.current!);
          lockTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  /**
   * SUBMIT DO FORMULÁRIO
   * 
  * BACKEND: POST /api/auth/login
  * Body: { whatsapp }
   * 
   * FLUXO:
   * 1. Valida campos não vazios
   * 2. Chama API de login
   * 3. Se sucesso e admin → /admin
   * 4. Se sucesso e não admin → /home
   * 5. Se erro → exibe mensagem
   */
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação básica
    if (!whatsapp.trim()) {
      setError(t('pleaseEnterWhatsapp'));
      return;
    }

    setIsSubmitting(true);
    const { error } = await requestLoginCode(whatsapp.trim());
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStep('verify');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockSeconds > 0) {
      setError(`${t('waitSeconds')} ${lockSeconds}s`);
      return;
    }

    if (!codigo.trim()) {
      setError(t('pleaseEnterCode'));
      return;
    }

    setIsSubmitting(true);
    const { error, user } = await verifyCode(whatsapp.trim(), codigo.trim());
    setIsSubmitting(false);

    if (error || !user) {
      const msg = error?.message || '';
      // Parse "Aguarde Xs" from backend message
      const match = msg.match(/(\d+)s/);
      if (match) {
        startLockTimer(Number(match[1]));
        setError(msg);
      } else {
        setError(t('invalidCode'));
      }
      return;
    }

    if (user.isAdmin || user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('loginTitle')} />

      <main className="flex-1 px-4 py-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <form 
            onSubmit={step === 'request' ? handleRequestCode : handleVerifyCode}
            className="bg-card border-4 border-primary/20 rounded-2xl p-6 shadow-card animate-scale-in"
          >
            {/* ============================================================
                HEADER DO FORMULÁRIO
                ============================================================ */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {step === 'request' ? (
                  <LogIn className="w-10 h-10 text-primary" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-primary" />
                )}
              </div>
              <h2 className="text-accessible-xl font-bold text-foreground">
                {step === 'request' ? t('enterButton') : t('confirmCode')}
              </h2>
            </div>

            {/* ============================================================
                MENSAGEM DE ERRO
                ============================================================ */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-xl animate-fade-in">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-accessible-sm text-destructive">{error}</p>
              </div>
            )}

            {/* ============================================================
                CAMPO: WHATSAPP
                ============================================================ */}
            <div className="mb-4">
              <label htmlFor="whatsapp" className="block text-accessible-base font-semibold text-foreground mb-2">
                {t('whatsappNumber')}
              </label>
              <PhoneInput
                value={whatsapp}
                onChange={setWhatsapp}
                disabled={step === 'verify'}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">{t('selectCountryAndNumber')}</p>
            </div>

            {/* ============================================================
                CAMPO: CODIGO
                ============================================================ */}
            {step === 'verify' && (
              <div className="mb-6">
                <label htmlFor="codigo" className="block text-accessible-base font-semibold text-foreground mb-2">
                  {t('sixDigitCode')}
                </label>
                <input
                  type="text"
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-border rounded-xl text-accessible-base
                             focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>
            )}

            {/* ============================================================
                BOTÃO DE SUBMIT
                ============================================================ */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting || lockSeconds > 0}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl
                         text-accessible-lg font-bold shadow-button hover:shadow-button-hover
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {lockSeconds > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <Timer className="w-5 h-5" />
                  {t('waitSeconds')} {lockSeconds}s
                </span>
              ) : step === 'request'
                ? isSubmitting ? t('sendingCode') : t('sendCode')
                : isSubmitting ? t('confirming') : t('confirmCode')}
            </button>

            {step === 'verify' && (
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full mt-3 py-3 border-2 border-border rounded-xl text-sm font-medium
                           hover:bg-secondary transition-colors"
              >
                {t('changeNumber')}
              </button>
            )}

            {/* ============================================================
                LINK PARA CADASTRO
                ============================================================ */}
            {step === 'request' && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {t('noAccount')}{' '}
                  <Link to="/signup" className="text-primary hover:underline font-semibold">
                    {t('signUpLink')}
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
