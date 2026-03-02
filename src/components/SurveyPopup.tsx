/**
 * ============================================================
 * SURVEY POPUP - Questionário pós-cadastro
 * ============================================================
 *
 * Exibido após o cadastro/verificação do usuário.
 * Coleta dados demográficos e feedback sobre a FENEARTE.
 * UI acessível: botões grandes, fontes legíveis, contraste alto.
 */

import { useEffect, useState } from 'react';
import { ClipboardList, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { surveyService } from '@/services/survey.service';
import type { SurveyQuestion, SurveyAnswerInput } from '@/types';
import { toast } from 'sonner';

interface SurveyPopupProps {
  open: boolean;
  onComplete: () => void;
}

export default function SurveyPopup({ open, onComplete }: SurveyPopupProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    surveyService.getQuestions()
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        onComplete(); // If questions fail to load, skip survey
      });
  }, [open]);

  if (!open) return null;

  const question = questions[currentStep];
  const totalSteps = questions.length;
  const isLastStep = currentStep === totalSteps - 1;
  const currentAnswer = question ? answers[question.id] : undefined;

  const canProceed = () => {
    if (!question) return false;
    if (question.type === 'TEXT') {
      return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
    }
    if (question.type === 'MULTI_CHOICE') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return typeof currentAnswer === 'string' && currentAnswer.length > 0;
  };

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleMultiSelect = (value: string) => {
    setAnswers((prev) => {
      const current = (prev[question.id] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleTextChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload: SurveyAnswerInput[] = questions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        answer: answers[q.id]
      }));

    try {
      await surveyService.submitAnswers(payload);
      toast.success('Obrigado por responder!');
      onComplete();
    } catch {
      toast.error('Erro ao enviar respostas. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-lg text-foreground">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-primary/10 p-5 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Queremos te conhecer!
              </h2>
              <p className="text-sm text-muted-foreground">
                Ajude-nos a melhorar a FENEARTE
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="p-5">
          <h3 className="text-accessible-lg font-bold text-foreground mb-4">
            {question.label}
          </h3>

          {/* SINGLE_CHOICE */}
          {question.type === 'SINGLE_CHOICE' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = currentAnswer === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSingleSelect(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      text-accessible-base font-medium
                      ${selected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MULTI_CHOICE */}
          {question.type === 'MULTI_CHOICE' && question.options && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                Selecione uma ou mais opções
              </p>
              {question.options.map((option) => {
                const selectedList = (currentAnswer as string[]) || [];
                const selected = selectedList.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiSelect(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      text-accessible-base font-medium
                      ${selected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                        ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TEXT */}
          {question.type === 'TEXT' && (
            <textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Digite sua resposta..."
              rows={3}
              className="w-full px-4 py-4 border-2 border-border rounded-xl text-accessible-base
                         focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors
                         resize-none"
            />
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 space-y-3">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-5 py-4 border-2 border-border
                           rounded-xl font-bold text-accessible-base hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground
                         rounded-xl font-bold text-accessible-base shadow-button
                         hover:shadow-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  Enviar Respostas
                </>
              ) : (
                <>
                  Próxima
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground
                       transition-colors underline"
          >
            Pular questionário
          </button>
        </div>
      </div>
    </div>
  );
}
