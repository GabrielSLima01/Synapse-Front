/**
 * ============================================================
 * SIGNUP.TSX - PÁGINA DE CADASTRO
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Formulário de cadastro para novos usuários.
 * Após cadastro, solicita o codigo de confirmação.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. FORMULÁRIO DE CADASTRO
 *    - Campo: Nome
 *    - Campo: Numero de WhatsApp
 *    - Botão de submit
 *    
 *    BACKEND NECESSÁRIO:
 *    - POST /api/auth/register
 *    - Body: { nome: string, whatsapp: string }
 *    - Retorna: { id: string, whatsapp: string }
 *    - Erros: 
 *      - 400 para WhatsApp ja existente
 * 
 * 2. VALIDAÇÕES
 *    - Nome e WhatsApp obrigatorios
 *    - WhatsApp nao pode ja estar em uso
 *    
 *    BACKEND: Validar no servidor também
 * 
 * 3. TELA DE SUCESSO
 *    - Após cadastro, mostra confirmação
 *    - Botão para ir para login
 *    
 *    BACKEND: Não requer
 * 
 * 4. LINK PARA LOGIN
 *    - Navega para /login
 *    
 *    BACKEND: Não requer
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * RegisterRequest:
 * {
 *   nome: string,
 *   whatsapp: string
 * }
 * 
 * RegisterResponse:
 * {
 *   id: string,
 *   whatsapp: string
 * }
 * 
 * ============================================================
 * FLUXO:
 * ============================================================
 * 
 * 1. Usuário preenche formulário
 * 2. Validação frontend (campos obrigatórios, etc)
 * 3. Envia para backend
 * 4. Se sucesso → mostra tela de confirmação
 * 5. Usuário confirma o código e acessa
 * 
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import SurveyPopup from '@/components/SurveyPopup';
import PhoneInput from '@/components/PhoneInput';
import { User, UserPlus, AlertCircle, ShieldCheck, Timer } from 'lucide-react';

export default function Signup() {
  const { registerUser, verifyCode, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // ============================================================
  // ESTADOS DO FORMULÁRIO
  // ============================================================
  
  /** Nome completo */
  const [nome, setNome] = useState('');

  /** WhatsApp */
  const [whatsapp, setWhatsapp] = useState('');

  /** Codigo de confirmacao */
  const [codigo, setCodigo] = useState('');

  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  
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
  * BACKEND: POST /api/auth/register
  * Body: { nome, whatsapp }
   * 
   * VALIDAÇÕES:
   * 1. Campos não vazios
   * 2. Senha mínimo 4 caracteres
   * 3. Senhas coincidem
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação: campos não vazios
    if (!nome.trim() || !whatsapp.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    const { error } = await registerUser({
      nome: nome.trim(),
      whatsapp: whatsapp.trim()
    });
    setIsSubmitting(false);
    
    if (error) {
      setError(error.message);
      return;
    }

    setStep('verify');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockSeconds > 0) {
      setError(`Aguarde ${lockSeconds}s antes de tentar novamente.`);
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
      // Show survey popup for regular users
      setShowSurvey(true);
    }
  };

  const handleSurveyComplete = () => {
    setShowSurvey(false);
    navigate('/home');
  };

  // ============================================================
  // TELA DE SUCESSO
  // ============================================================
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('signUpTitle')} />

      <main className="flex-1 px-4 py-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <form 
            onSubmit={step === 'register' ? handleRegister : handleVerify}
            className="bg-card border-4 border-primary/20 rounded-2xl p-6 shadow-card animate-scale-in"
          >
            {/* ============================================================
                HEADER DO FORMULÁRIO
                ============================================================ */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {step === 'register' ? (
                  <UserPlus className="w-10 h-10 text-primary" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-primary" />
                )}
              </div>
              <h2 className="text-accessible-xl font-bold text-foreground">
                {step === 'register' ? t('createAccount') : t('confirmCode')}
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

            {step === 'register' && (
              <>
                {/* ============================================================
                    CAMPO: NOME
                    ============================================================ */}
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-accessible-base font-semibold text-foreground mb-2">
                    {t('name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl text-accessible-base
                                 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder={t('enterYourName')}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

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
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t('selectCountryAndNumber')}</p>
                </div>

              </>
            )}

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
              ) : step === 'register'
                ? isSubmitting ? t('sendingCodeEllipsis') : t('sendCode')
                : isSubmitting ? t('confirming') : t('confirmCode')}
            </button>

            {step === 'verify' && (
              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full mt-3 py-3 border-2 border-border rounded-xl text-sm font-medium
                           hover:bg-secondary transition-colors"
              >
                {t('backToSignUp')}
              </button>
            )}

            {/* ============================================================
                LINK PARA LOGIN
                ============================================================ */}
            {step === 'register' && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {t('alreadyHaveAccount')}{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">
                    {t('loginLink')}
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </main>

      <PageFooter />

      {/* Survey popup shown after successful registration */}
      <SurveyPopup open={showSurvey} onComplete={handleSurveyComplete} />
    </div>
  );
}
