/**
 * ============================================================
 * PUBLICPHOTOS.TSX - GALERIA DE FOTOS DO PÚBLICO
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Permite que visitantes enviem fotos da FENEARTE para serem
 * publicadas na galeria. O envio NÃO requer login - apenas nome.
 * Fotos ficam pendentes até aprovação pelo admin.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. CARROSSEL DE ANOS (EDIÇÕES)
 *    - Lista edições passadas (2020-2023) e atual (2024)
 *    - Navegar entre anos para ver fotos de cada edição
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/photos/editions
 *    - Retorna: [{ year, isCurrent, photoCount }]
 * 
 * 2. GALERIA DE FOTOS APROVADAS
 *    - Exibe fotos aprovadas pelo admin para o ano selecionado
 *    - Grid 2x2 com nome do autor
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/photos?year={year}&status=approved
 *    - Retorna: [{ id, url, author, year }]
 * 
 * 3. ENVIO DE FOTO (SEM LOGIN)
 *    - Formulário com: nome do autor + arquivo de imagem
 *    - Foto é enviada como "pendente"
 *    - Aguarda aprovação do admin
 *    
 *    BACKEND NECESSÁRIO:
 *    - POST /api/photos
 *    - Body: FormData { author: string, image: File }
 *    - Retorna: { id, status: 'pending' }
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * Edition:
 * {
 *   year: number,
 *   isCurrent: boolean,
 *   photos: Photo[]
 * }
 * 
 * Photo:
 * {
 *   id: number,
 *   url: string,
 *   author: string,
 *   year: number,
 *   status: 'pending' | 'approved' | 'rejected'
 * }
 * 
 * ============================================================
 * FLUXO DE APROVAÇÃO:
 * ============================================================
 * 
 * 1. Visitante envia foto → status = 'pending'
 * 2. Admin visualiza em /admin (aba Fotos)
 * 3. Admin aprova → status = 'approved' → aparece na galeria
 * 4. Admin rejeita → status = 'rejected' → não aparece
 * 
 * ============================================================
 */

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { Camera, Upload, ImageIcon, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { photoService } from '@/services/photo.service';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

/** Interface de edição (ano) com suas fotos */
interface PhotosByYear {
  year: number;
  isCurrent: boolean;
  photos: { id: string; url: string; author: string }[];
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PublicPhotos() {
  const { t } = useLanguage();
  
  // ============================================================
  // ESTADOS DO COMPONENTE
  // ============================================================
  
  /** Se está enviando foto */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /** Se foto foi enviada com sucesso */
  const [submitted, setSubmitted] = useState(false);
  
  /** Nome do autor da foto */
  const [authorName, setAuthorName] = useState('');

  /** Arquivo selecionado */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /**
   * DADOS MOCK DAS EDIÇÕES
   * 
   * BACKEND: Substituir por GET /api/photos/editions
   * E depois GET /api/photos?year={year}&status=approved
   */
  const [editionYears, setEditionYears] = useState<PhotosByYear[]>([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [isLoadingEditions, setIsLoadingEditions] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  const selectedYear = useMemo(() => editionYears[selectedYearIndex], [editionYears, selectedYearIndex]);

  /**
   * ENVIAR FOTO
   * 
   * BACKEND: POST /api/photos
   * Body: FormData { author, image }
   * 
   * OBS: Neste mock, apenas simula o envio
   * Em produção, fazer upload do arquivo para storage
   */
  const handleSubmitPhoto = async () => {
    if (!authorName.trim()) {
      toast.error(t('pleaseEnterName'));
      return;
    }

    if (!selectedFile) {
      toast.error(t('pleaseSelectPhoto'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      await photoService.uploadPhoto({ author: authorName.trim(), image: selectedFile });
      setSubmitted(true);
      setSelectedFile(null);
      toast.success(t('photoSentForReview'));
    } catch {
      toast.error(t('errorSendingPhoto'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Navegar para ano anterior */
  const handlePrevYear = () => setSelectedYearIndex(prev => Math.max(prev - 1, 0));
  
  /** Navegar para próximo ano */
  const handleNextYear = () => setSelectedYearIndex(prev => Math.min(prev + 1, editionYears.length - 1));

  useEffect(() => {
    let active = true;
    setIsLoadingEditions(true);

    photoService.getEditions()
      .then((data) => {
        if (!active) return;
        const mapped = data.map((edition) => ({ year: edition.year, isCurrent: edition.isCurrent, photos: [] }));
        setEditionYears(mapped);
        const currentIndex = mapped.findIndex((edition) => edition.isCurrent);
        setSelectedYearIndex(currentIndex >= 0 ? currentIndex : Math.max(mapped.length - 1, 0));
      })
      .catch(() => {
        if (active) setEditionYears([]);
      })
      .finally(() => {
        if (active) setIsLoadingEditions(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    let active = true;
    setIsLoadingPhotos(true);

    photoService.getPhotos({ year: selectedYear.year, status: 'APPROVED' })
      .then((data) => {
        if (!active) return;
        const photos = data.map((photo) => ({ id: photo.id, url: photo.url, author: photo.author }));
        setEditionYears((prev) =>
          prev.map((edition, index) =>
            index === selectedYearIndex ? { ...edition, photos } : edition
          )
        );
      })
      .catch(() => {
        if (active) {
          setEditionYears((prev) =>
            prev.map((edition, index) =>
              index === selectedYearIndex ? { ...edition, photos: [] } : edition
            )
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingPhotos(false);
      });

    return () => {
      active = false;
    };
  }, [selectedYearIndex, selectedYear?.year]);

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('publicPhotosTitle')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* ============================================================
              CABEÇALHO COM ÍCONE E DESCRIÇÃO
              ============================================================ */}
          <div className="text-center animate-fade-in">
            <Camera className="w-12 h-12 text-primary mx-auto mb-3" strokeWidth={2} />
            <p className="text-accessible-base text-muted-foreground">
              {t('publicPhotosUploadDescription')}
            </p>
          </div>

          {/* ============================================================
              CARROSSEL DE ANOS
              - Setas para navegar entre anos
              - Pills com anos (2020-2024)
              - Ano atual marcado com estrela
              ============================================================ */}
          <div className="animate-fade-in animation-delay-100">
            <p className="text-sm text-muted-foreground text-center mb-3">{t('selectYear')}</p>
            <div className="flex items-center justify-center gap-4">
              {/* SETA ESQUERDA - Ano anterior */}
              <button
                onClick={handlePrevYear}
                disabled={selectedYearIndex <= 0 || isLoadingEditions}
                className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center
                           hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              {/* PILLS DE ANOS */}
              <div className="flex gap-2 overflow-x-auto py-2 px-1">
                {isLoadingEditions ? (
                  <span className="text-sm text-muted-foreground">{t('loadingEditions')}</span>
                ) : editionYears.length > 0 ? (
                  editionYears.map((edition, index) => (
                    <button
                      key={edition.year}
                      onClick={() => setSelectedYearIndex(index)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                        ${selectedYearIndex === index 
                          ? 'bg-primary text-primary-foreground scale-105 shadow-md' 
                          : 'bg-card border-2 border-border text-foreground hover:bg-secondary'}
                        ${edition.isCurrent ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                    >
                      {edition.year}
                      {edition.isCurrent && <span className="ml-1">★</span>}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">{t('noEditionFound')}</span>
                )}
              </div>

              {/* SETA DIREITA - Próximo ano */}
              <button
                onClick={handleNextYear}
                disabled={selectedYearIndex >= editionYears.length - 1 || isLoadingEditions}
                className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center
                           hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* BADGE DE EDIÇÃO ATUAL/PASSADA */}
            <div className="text-center mt-3">
              {selectedYear?.isCurrent ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {t('currentEdition')}
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                  {t('pastEdition')}
                </span>
              )}
            </div>
          </div>

          {/* ============================================================
              SEÇÃO DE UPLOAD DE FOTO
              - Só aparece para edição atual (2024)
              - NÃO requer login, apenas nome
              - Após envio, mostra confirmação
              ============================================================ */}
          {selectedYear?.isCurrent && (
            <div className="animate-fade-in animation-delay-100">
              {submitted ? (
                // CONFIRMAÇÃO DE ENVIO
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-accessible-lg font-bold text-green-800 mb-2">
                    {t('photoSubmitted')}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {t('photoUnderReview')}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setAuthorName('');
                      setSelectedFile(null);
                    }}
                    className="mt-4 text-green-700 underline text-sm"
                  >
                    {t('sendAnotherPhoto')}
                  </button>
                </div>
              ) : (
                // FORMULÁRIO DE ENVIO
                <div className="space-y-4 bg-card border-2 border-border rounded-xl p-4">
                  {/* Campo: Nome do autor (obrigatório) */}
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={t('yourName')}
                    maxLength={30}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl text-accessible-base
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                               file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {/* Botão de envio */}
                  <button
                    onClick={handleSubmitPhoto}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 text-accessible-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Clock className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" strokeWidth={2} />
                    )}
                    {isSubmitting ? t('sending') : t('submitPhoto')}
                  </button>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('photoReviewNote')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              GALERIA DE FOTOS APROVADAS
              - Grid 2x2 com fotos do ano selecionado
              - Cada foto mostra nome do autor
              ============================================================ */}
          <div className="animate-fade-in animation-delay-200">
            <h2 className="text-accessible-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {t('approvedPhotos')} - {selectedYear?.year ?? ''}
            </h2>
            {isLoadingPhotos ? (
              <div className="text-center py-8 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground text-sm">{t('loadingPhotos')}</p>
              </div>
            ) : selectedYear && selectedYear.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedYear.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                  >
                    <img
                      src={photo.url}
                      alt={`Foto por ${photo.author}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Overlay com nome do autor */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-sm font-medium">{photo.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Estado vazio
              <div className="text-center py-8 bg-muted/30 rounded-xl">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{t('noPhotosAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PageFooter variant="page" />
    </div>
  );
}
