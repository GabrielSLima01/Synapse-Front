/**
 * ============================================================
 * ADMIN.TSX - PAINEL ADMINISTRATIVO COMPLETO
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Painel de controle para administradores da FENEARTE.
 * Permite gerenciar avaliações, fotos, marcadores do mapa e visitas.
 * 
 * ACESSO: Apenas usuários com isAdmin = true
 * CREDENCIAIS: login: "admin", senha: "admin"
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. AUTENTICAÇÃO E PROTEÇÃO DE ROTA
 *    - Verifica se usuário está logado E é admin
 *    - Redireciona para /login se não autorizado
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/auth/me → { id, whatsapp, isAdmin }
 *    - Middleware de verificação de role
 * 
 * 2. TAB: AVALIAÇÕES (Aprovar/Rejeitar)
 *    - Lista avaliações pendentes de aprovação
 *    - Botões para aprovar ou rejeitar cada uma
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/admin/ratings?status=pending
 *      Retorna: [{ id, standId, standName, author, comment, rating }]
 *    
 *    - PUT /api/admin/ratings/:id/approve
 *    - PUT /api/admin/ratings/:id/reject
 * 
 * 3. TAB: FOTOS (Aprovar/Rejeitar)
 *    - Lista fotos pendentes de aprovação
 *    - Preview da imagem + dados do autor
 *    - Botões para aprovar ou rejeitar
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/admin/photos?status=pending
 *      Retorna: [{ id, url, author, submittedAt }]
 *    
 *    - PUT /api/admin/photos/:id/approve
 *    - PUT /api/admin/photos/:id/reject
 * 
 * 4. TAB: MAPA (Gerenciar Marcadores)
 *    - Visualizar marcadores existentes no mapa
 *    - Adicionar novo marcador (clique no mapa + nome)
 *    - Mover marcador existente (clique no mapa)
 *    - Remover marcador
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/admin/markers
 *      Retorna: [{ id, name, x, y }]
 *    
 *    - POST /api/admin/markers
 *      Body: { name, x, y }
 *    
 *    - PUT /api/admin/markers/:id
 *      Body: { name?, x?, y? }
 *    
 *    - DELETE /api/admin/markers/:id
 * 
 * 5. TAB: VISITAS (Resetar Contagem)
 *    - Lista stands com contagem de visitas
 *    - Botão para zerar todas as contagens
 *    - Usado antes de nova edição da feira
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/admin/stands/visits
 *      Retorna: [{ id, name, visits }]
 *    
 *    - POST /api/admin/stands/reset-visits
 *      Zera access_count de todos os stands
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * PendingRating:
 * {
 *   id: number,
 *   standId: number,
 *   standName: string,
 *   author: string,
 *   comment: string,
 *   rating: number (1-5)
 * }
 * 
 * PendingPhoto:
 * {
 *   id: number,
 *   url: string,
 *   author: string,
 *   submittedAt: string (ISO date)
 * }
 * 
 * StandMarker:
 * {
 *   id: string,
 *   name: string,
 *   x: number (0-100),
 *   y: number (0-100)
 * }
 * 
 * StandVisit:
 * {
 *   id: number,
 *   name: string,
 *   visits: number
 * }
 * 
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { MapIcon, LogOut, Shield, Loader2, Image, RefreshCw, Check, X, Plus, Trash2, MapPin, Star, MessageSquare, Move, Gift, Pencil, Tags, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import mapaFenearte from '@/assets/mapa-fenearte.png';
import { adminService, PendingPhoto, PendingRating, StandVisit, AdminStandOption, AdminTrail, AdminCategory, AdminSurveyQuestion, AdminSurveyQuestionType } from '@/services/admin.service';
import type { AgeRangeCount, MapMarker, SurveyDashboardQuestion, SurveyChartItem } from '@/types';

// ============================================================
// TIPOS
// ============================================================

/** Tabs disponíveis no painel */
type AdminTab = 'dashboard' | 'ratings' | 'photos' | 'map' | 'visits' | 'trails' | 'categories' | 'questions';

// ============================================================
// TIPOS
// ============================================================

interface UiPendingRating extends PendingRating {
  rating: number;
}

interface UiPendingPhoto extends PendingPhoto {
  submittedAt: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Admin() {
  const { t } = useLanguage();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  
  /** Tab ativa */
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // ============================================================
  // ESTADOS DOS DADOS
  // ============================================================
  
  const [pendingRatings, setPendingRatings] = useState<UiPendingRating[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<UiPendingPhoto[]>([]);
  const [standMarkers, setStandMarkers] = useState<MapMarker[]>([]);
  const [visitStands, setVisitStands] = useState<StandVisit[]>([]);
  const [trails, setTrails] = useState<AdminTrail[]>([]);
  const [trailStands, setTrailStands] = useState<AdminStandOption[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<AdminSurveyQuestion[]>([]);
  const [resettingVisits, setResettingVisits] = useState(false);
  const [ageRanges, setAgeRanges] = useState<AgeRangeCount[]>([]);
  const [surveyCharts, setSurveyCharts] = useState<SurveyDashboardQuestion[]>([]);

  const [trailName, setTrailName] = useState('');
  const [trailCategory, setTrailCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [questionSlug, setQuestionSlug] = useState('');
  const [questionLabel, setQuestionLabel] = useState('');
  const [questionType, setQuestionType] = useState<AdminSurveyQuestionType>('SINGLE_CHOICE');
  const [questionOptionsText, setQuestionOptionsText] = useState('');
  const [questionOrder, setQuestionOrder] = useState('1');
  const [questionIsActive, setQuestionIsActive] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedTrailStandIds, setSelectedTrailStandIds] = useState<string[]>([]);
  const [editingTrailId, setEditingTrailId] = useState<string | null>(null);
  
  // ============================================================
  // ESTADOS PARA GERENCIAMENTO DE MAPA
  // ============================================================
  
  /** Se está no modo de adicionar marcador */
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  /** Se está no modo de adicionar stand */
  const [isAddingStand, setIsAddingStand] = useState(false);
  
  /** Nome do novo marcador */
  const [newMarkerName, setNewMarkerName] = useState('');

  /** Nome do novo stand */
  const [newStandName, setNewStandName] = useState('');

  /** Categoria do novo stand */
  const [newStandCategory, setNewStandCategory] = useState('');

  /** Número opcional do novo stand */
  const [newStandNumber, setNewStandNumber] = useState('');
  
  /** Posição temporária do novo marcador */
  const [newMarkerPos, setNewMarkerPos] = useState<{ x: number; y: number } | null>(null);

  /** Posição temporária do novo stand */
  const [newStandPos, setNewStandPos] = useState<{ x: number; y: number } | null>(null);
  
  /** ID do marcador sendo movido */
  const [movingMarkerId, setMovingMarkerId] = useState<string | null>(null);

  // ============================================================
  // PROTEÇÃO DE ROTA
  // ============================================================
  
  /**
   * Redireciona para login se não autenticado ou não admin
   */
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    let active = true;

    const loadAll = async () => {
      const [
        ageResult,
        ratingsResult,
        photosResult,
        markersResult,
        visitsResult,
        trailsResult,
        standsResult,
        surveyDashboardResult,
        categoriesResult,
        surveyQuestionsResult
      ] = await Promise.allSettled([
        adminService.getAgeRanges(),
        adminService.getRatings('PENDING'),
        adminService.getPhotos('PENDING'),
        adminService.getMarkers(),
        adminService.getStandVisits(),
        adminService.getTrails(),
        adminService.getStandsForTrail(),
        adminService.getSurveyDashboard(),
        adminService.getCategories(),
        adminService.getSurveyQuestions()
      ]);

      if (!active) return;

      setAgeRanges(ageResult.status === 'fulfilled' ? ageResult.value : []);
      setPendingRatings(ratingsResult.status === 'fulfilled' ? ratingsResult.value : []);

      setPendingPhotos(
        photosResult.status === 'fulfilled'
          ? photosResult.value.map((photo) => ({
              ...photo,
              submittedAt: new Date(photo.createdAt).toLocaleDateString()
            }))
          : []
      );

      setStandMarkers(markersResult.status === 'fulfilled' ? markersResult.value : []);
      setVisitStands(visitsResult.status === 'fulfilled' ? visitsResult.value : []);
      setTrails(trailsResult.status === 'fulfilled' ? trailsResult.value : []);
      setTrailStands(standsResult.status === 'fulfilled' ? standsResult.value : []);
      setSurveyCharts(surveyDashboardResult.status === 'fulfilled' ? surveyDashboardResult.value : []);
      setCategories(categoriesResult.status === 'fulfilled' ? categoriesResult.value : []);
      setSurveyQuestions(surveyQuestionsResult.status === 'fulfilled' ? surveyQuestionsResult.value : []);
    };

    loadAll();

    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Não renderiza se não é admin
  if (!user || !isAdmin) return null;

  // ============================================================
  // HANDLERS
  // ============================================================

  /** Logout */
  const handleLogout = async () => {
    await signOut();
    navigate('/home');
  };

  /**
   * APROVAR AVALIAÇÃO
   * BACKEND: PUT /api/admin/ratings/:id/approve
   */
  const handleApproveRating = async (id: string) => {
    try {
      await adminService.approveRating(id);
      setPendingRatings(r => r.filter(rating => rating.id !== id));
      toast.success('Avaliação aprovada!');
    } catch {
      toast.error('Erro ao aprovar avaliação');
    }
  };

  /**
   * REJEITAR AVALIAÇÃO
   * BACKEND: PUT /api/admin/ratings/:id/reject
   */
  const handleRejectRating = async (id: string) => {
    try {
      await adminService.rejectRating(id);
      setPendingRatings(r => r.filter(rating => rating.id !== id));
      toast.success('Avaliação rejeitada');
    } catch {
      toast.error('Erro ao rejeitar avaliação');
    }
  };

  /**
   * APROVAR FOTO
   * BACKEND: PUT /api/admin/photos/:id/approve
   */
  const handleApprovePhoto = async (id: string) => {
    try {
      await adminService.approvePhoto(id);
      setPendingPhotos(p => p.filter(photo => photo.id !== id));
      toast.success('Foto aprovada!');
    } catch {
      toast.error('Erro ao aprovar foto');
    }
  };

  /**
   * REJEITAR FOTO
   * BACKEND: PUT /api/admin/photos/:id/reject
   */
  const handleRejectPhoto = async (id: string) => {
    try {
      await adminService.rejectPhoto(id);
      setPendingPhotos(p => p.filter(photo => photo.id !== id));
      toast.success('Foto rejeitada');
    } catch {
      toast.error('Erro ao rejeitar foto');
    }
  };

  /**
   * DELETAR MARCADOR
   * BACKEND: DELETE /api/admin/markers/:id
   */
  const handleDeleteMarker = async (id: string) => {
    try {
      await adminService.deleteMarker(id);
      setStandMarkers(m => m.filter(marker => marker.id !== id));
      toast.success('Marcador removido');
    } catch {
      toast.error('Erro ao remover marcador');
    }
  };

  /**
   * CLIQUE NO MAPA
   * - Se movendo marcador: atualiza posição
   * - Se adicionando: define posição temporária
   */
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isAddingStand) {
      setNewStandPos({ x, y });
      return;
    }
    
    if (movingMarkerId) {
      // MOVER MARCADOR - BACKEND: PUT /api/admin/markers/:id
      try {
        const updated = await adminService.updateMarker(movingMarkerId, { x, y });
        setStandMarkers(markers => markers.map(m => 
          m.id === movingMarkerId ? updated : m
        ));
        setMovingMarkerId(null);
        toast.success('Marcador movido!');
      } catch {
        toast.error('Erro ao mover marcador');
      }
    } else if (isAddingMarker) {
      // DEFINIR POSIÇÃO DO NOVO MARCADOR
      setNewMarkerPos({ x, y });
    }
  };

  /**
   * SALVAR NOVO MARCADOR
   * BACKEND: POST /api/admin/markers
   * Body: { name, x, y }
   */
  const handleSaveNewMarker = async () => {
    if (!newMarkerName.trim() || !newMarkerPos) return;

    try {
      const created = await adminService.createMarker({
        name: newMarkerName.trim(),
        x: newMarkerPos.x,
        y: newMarkerPos.y,
        type: 'OTHER'
      });

      setStandMarkers((prev) => [...prev, created]);
      setNewMarkerName('');
      setNewMarkerPos(null);
      setIsAddingMarker(false);
      toast.success('Marcador adicionado!');
    } catch {
      toast.error('Erro ao adicionar marcador');
    }
  };

  const handleSaveNewStand = async () => {
    if (!newStandName.trim() || !newStandCategory || !newStandPos) {
      toast.error('Informe nome, categoria e clique no mapa para escolher a posição');
      return;
    }

    try {
      const created = await adminService.createStand({
        name: newStandName.trim(),
        category: newStandCategory,
        mapX: newStandPos.x,
        mapY: newStandPos.y,
        number: newStandNumber.trim() ? Number(newStandNumber) : undefined
      });

      setTrailStands((prev) => [created, ...prev]);
      setNewStandName('');
      setNewStandCategory('');
      setNewStandNumber('');
      setNewStandPos(null);
      setIsAddingStand(false);
      toast.success('Stand criado com sucesso!');
    } catch {
      toast.error('Erro ao criar stand');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }

    try {
      const created = await adminService.createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      setNewCategoryName('');
      toast.success('Categoria adicionada!');
    } catch {
      toast.error('Erro ao adicionar categoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await adminService.deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      if (trailCategory && !categories.some((item) => item.id !== id && item.name === trailCategory)) {
        setTrailCategory('');
        setSelectedTrailStandIds([]);
      }
      if (newStandCategory && !categories.some((item) => item.id !== id && item.name === newStandCategory)) {
        setNewStandCategory('');
      }
      toast.success('Categoria removida');
    } catch {
      toast.error('Não foi possível remover essa categoria');
    }
  };

  /**
   * RESETAR CONTAGEM DE VISITAS
   * BACKEND: POST /api/admin/stands/reset-visits
   */
  const handleResetVisits = async () => {
    setResettingVisits(true);
    try {
      await adminService.resetVisits();
      const visits = await adminService.getStandVisits();
      setVisitStands(visits);
      toast.success('Contagem de visitas resetada!');
    } catch {
      toast.error('Erro ao resetar visitas');
    } finally {
      setResettingVisits(false);
    }
  };

  const resetTrailForm = () => {
    setTrailName('');
    setTrailCategory('');
    setSelectedTrailStandIds([]);
    setEditingTrailId(null);
  };

  const handleToggleTrailStand = (standId: string) => {
    setSelectedTrailStandIds((prev) => (
      prev.includes(standId) ? prev.filter((id) => id !== standId) : [...prev, standId]
    ));
  };

  const handleEditTrail = (trail: AdminTrail) => {
    setEditingTrailId(trail.id);
    setTrailName(trail.name);
    setTrailCategory(trail.category);
    setSelectedTrailStandIds(trail.stands.map((item) => item.stand.id));
    setActiveTab('trails');
  };

  const handleSaveTrail = async () => {
    if (!trailName.trim() || !trailCategory.trim() || selectedTrailStandIds.length < 2) {
      toast.error('Informe nome, categoria e pelo menos 2 stands na rota');
      return;
    }

    try {
      if (editingTrailId) {
        const updated = await adminService.updateTrail(editingTrailId, {
          name: trailName.trim(),
          category: trailCategory.trim(),
          standIds: selectedTrailStandIds
        });
        setTrails((prev) => prev.map((trail) => (trail.id === updated.id ? updated : trail)));
        toast.success('Trilha atualizada!');
      } else {
        const created = await adminService.createTrail({
          name: trailName.trim(),
          category: trailCategory.trim(),
          standIds: selectedTrailStandIds,
          isActive: true
        });
        setTrails((prev) => [created, ...prev]);
        toast.success('Trilha criada!');
      }

      resetTrailForm();
    } catch {
      toast.error('Erro ao salvar trilha');
    }
  };

  const handleDeleteTrail = async (trailId: string) => {
    try {
      await adminService.deleteTrail(trailId);
      setTrails((prev) => prev.filter((trail) => trail.id !== trailId));
      if (editingTrailId === trailId) {
        resetTrailForm();
      }
      toast.success('Trilha removida');
    } catch {
      toast.error('Erro ao remover trilha');
    }
  };

  const handleToggleTrailActive = async (trail: AdminTrail) => {
    try {
      const updated = await adminService.updateTrail(trail.id, { isActive: !trail.isActive });
      setTrails((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(updated.isActive ? 'Trilha ativada' : 'Trilha desativada');
    } catch {
      toast.error('Erro ao atualizar trilha');
    }
  };

  const availableTrailStands = trailCategory
    ? trailStands.filter((stand) => stand.category === trailCategory)
    : [];

  const resetQuestionForm = () => {
    setQuestionSlug('');
    setQuestionLabel('');
    setQuestionType('SINGLE_CHOICE');
    setQuestionOptionsText('');
    setQuestionOrder('1');
    setQuestionIsActive(true);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question: AdminSurveyQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionSlug(question.slug);
    setQuestionLabel(question.label);
    setQuestionType(question.type);
    setQuestionOptionsText((question.options || []).join(', '));
    setQuestionOrder(String(question.order));
    setQuestionIsActive(question.isActive);
    setIsQuestionFormOpen(true);
    setActiveTab('questions');
  };

  const handleOpenCreateQuestionForm = () => {
    resetQuestionForm();
    setIsQuestionFormOpen(true);
  };

  const handleCloseQuestionForm = () => {
    resetQuestionForm();
    setIsQuestionFormOpen(false);
  };

  const handleSaveQuestion = async () => {
    if (!questionSlug.trim() || !questionLabel.trim()) {
      toast.error('Informe slug e texto da pergunta');
      return;
    }

    const parsedOrder = Number(questionOrder);
    if (!Number.isFinite(parsedOrder) || parsedOrder < 1) {
      toast.error('Informe uma ordem válida');
      return;
    }

    const options = questionType === 'TEXT'
      ? []
      : questionOptionsText.split(',').map((item) => item.trim()).filter(Boolean);

    if (questionType !== 'TEXT' && options.length === 0) {
      toast.error('Perguntas de escolha precisam de opções');
      return;
    }

    try {
      if (editingQuestionId) {
        const updated = await adminService.updateSurveyQuestion(editingQuestionId, {
          slug: questionSlug.trim(),
          label: questionLabel.trim(),
          type: questionType,
          options,
          order: parsedOrder,
          isActive: questionIsActive
        });

        setSurveyQuestions((prev) => prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.order - b.order));
        toast.success('Pergunta atualizada!');
      } else {
        const created = await adminService.createSurveyQuestion({
          slug: questionSlug.trim(),
          label: questionLabel.trim(),
          type: questionType,
          options,
          order: parsedOrder,
          isActive: questionIsActive
        });

        setSurveyQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        toast.success('Pergunta criada!');
      }

      resetQuestionForm();
      setIsQuestionFormOpen(false);
    } catch {
      toast.error('Erro ao salvar pergunta');
    }
  };

  const handleToggleQuestionActive = async (question: AdminSurveyQuestion) => {
    try {
      const updated = await adminService.updateSurveyQuestion(question.id, {
        isActive: !question.isActive
      });

      setSurveyQuestions((prev) => prev
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((a, b) => a.order - b.order));
      toast.success(updated.isActive ? 'Pergunta ativada' : 'Pergunta desativada');
    } catch {
      toast.error('Erro ao atualizar pergunta');
    }
  };

  // Definição das tabs
  const firstRowTabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: Shield },
    { id: 'ratings' as AdminTab, label: 'Avaliações', icon: MessageSquare },
    { id: 'photos' as AdminTab, label: 'Fotos', icon: Image },
  ];

  const secondRowTabs = [
    { id: 'map' as AdminTab, label: 'Mapa', icon: MapIcon },
    { id: 'visits' as AdminTab, label: 'Visitas', icon: RefreshCw },
    { id: 'trails' as AdminTab, label: 'Trilhas', icon: Gift },
    { id: 'categories' as AdminTab, label: 'Categorias', icon: Tags },
    { id: 'questions' as AdminTab, label: 'Perguntas', icon: ClipboardList },
  ];

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('adminPanel')} showBack={true} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          
          {/* ============================================================
              BADGE DE ADMIN
              ============================================================ */}
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">
              Logado como: {user.nome || user.whatsapp}
            </span>
          </div>

          {/* ============================================================
              NAVEGAÇÃO POR TABS
              ============================================================ */}
          <div className="space-y-2 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {firstRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap
                           ${activeTab === tab.id 
                             ? 'bg-primary text-primary-foreground shadow-button' 
                             : 'bg-card border-2 border-border hover:border-primary/50'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {secondRowTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap
                           ${activeTab === tab.id 
                             ? 'bg-primary text-primary-foreground shadow-button' 
                             : 'bg-card border-2 border-border hover:border-primary/50'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
              ))}
            </div>
          </div>

          {/* ============================================================
              TAB: DASHBOARD
              Multiplos graficos — faixa etaria, pontos de melhoria, etc.
              ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Dashboard</h2>

              {/* Legacy age range chart from User table */}
              <div className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Usuários por Faixa Etária (Cadastro)
                </h3>

                {ageRanges.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const maxCount = Math.max(1, ...ageRanges.map((item) => item.count));
                      return ageRanges.map((range) => {
                        const width = `${Math.round((range.count / maxCount) * 100)}%`;
                        return (
                          <div key={range.faixa_etaria} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground font-medium">{range.faixa_etaria}</span>
                              <span className="text-muted-foreground">{range.count}</span>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
                )}
              </div>

              {/* Survey-based charts */}
              {surveyCharts.map((chart) => {
                // Skip text-type questions (not suitable for bar charts)
                if (chart.type === 'TEXT') {
                  const textData = chart.data as string[];
                  return (
                    <div key={chart.slug} className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {chart.label}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          {chart.totalResponses} respostas
                        </span>
                      </div>

                      {textData.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {/* Group and count identical text answers */}
                          {(() => {
                            const grouped: Record<string, number> = {};
                            for (const item of textData) {
                              const key = String(item).trim().toLowerCase();
                              if (key) grouped[key] = (grouped[key] || 0) + 1;
                            }
                            const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
                            return sorted.slice(0, 20).map(([text, count]) => (
                              <div key={text} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                <span className="text-foreground capitalize">{text}</span>
                                <span className="text-muted-foreground font-medium">{count}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
                      )}
                    </div>
                  );
                }

                // Bar chart for SINGLE_CHOICE and MULTI_CHOICE
                const chartData = chart.data as SurveyChartItem[];
                const maxCount = Math.max(1, ...chartData.map((item) => item.count));
                const chartColors = [
                  'bg-primary',
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-amber-500',
                  'bg-purple-500',
                  'bg-rose-500',
                  'bg-teal-500',
                  'bg-orange-500',
                  'bg-indigo-500'
                ];

                return (
                  <div key={chart.slug} className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {chart.label}
                      </h3>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {chart.totalResponses} respostas
                      </span>
                    </div>

                    {chartData.some((d) => d.count > 0) ? (
                      <div className="space-y-3">
                        {chartData.map((item, idx) => {
                          const width = `${Math.round((item.count / maxCount) * 100)}%`;
                          const colorClass = chartColors[idx % chartColors.length];

                          return (
                            <div key={item.label} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-foreground font-medium">{item.label}</span>
                                <span className="text-muted-foreground">{item.count}</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
                    )}
                  </div>
                );
              })}

              {surveyCharts.length === 0 && (
                <div className="bg-card border-2 border-border rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Dados do questionário serão exibidos aqui conforme os participantes preencherem.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              TAB: AVALIAÇÕES PENDENTES
              Aprovar ou rejeitar avaliações de stands
              ============================================================ */}
          {activeTab === 'ratings' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Avaliações Pendentes</h2>
              
              {pendingRatings.length > 0 ? (
                <div className="space-y-4">
                  {pendingRatings.map((rating) => (
                    <div key={rating.id} className="bg-card border-2 border-border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{rating.author}</p>
                          <p className="text-sm text-muted-foreground">Stand: {rating.standName}</p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-3">{rating.comment}</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveRating(rating.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejectRating(rating.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border-2 border-border rounded-xl p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma avaliação pendente</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              TAB: FOTOS PENDENTES
              Aprovar ou rejeitar fotos enviadas pelo público
              ============================================================ */}
          {activeTab === 'photos' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Fotos Pendentes</h2>
              
              {pendingPhotos.length > 0 ? (
                <div className="space-y-4">
                  {pendingPhotos.map((photo) => (
                    <div key={photo.id} className="bg-card border-2 border-border rounded-xl overflow-hidden">
                      <img src={photo.url} alt={`Foto de ${photo.author}`} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <p className="font-medium text-foreground">{photo.author}</p>
                        <p className="text-sm text-muted-foreground mb-3">Enviada em: {photo.submittedAt}</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprovePhoto(photo.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectPhoto(photo.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border-2 border-border rounded-xl p-8 text-center">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma foto pendente</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              TAB: GERENCIAMENTO DE MAPA
              Adicionar, mover e remover marcadores de stands
              ============================================================ */}
          {activeTab === 'map' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Marcadores de Stands</h2>
                <div className="flex items-center gap-2">
                  {!isAddingStand && !isAddingMarker && !movingMarkerId && (
                    <button
                      onClick={() => {
                        setIsAddingStand(true);
                        setIsAddingMarker(false);
                        setMovingMarkerId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Novo stand
                    </button>
                  )}
                  {!isAddingMarker && !isAddingStand && !movingMarkerId && (
                    <button
                      onClick={() => {
                        setIsAddingMarker(true);
                        setIsAddingStand(false);
                        setNewStandPos(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 border-2 border-border rounded-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Novo marcador
                    </button>
                  )}
                </div>
              </div>

              {/* Instruções */}
              {(isAddingMarker || isAddingStand || movingMarkerId) && (
                <div className="bg-primary/10 border-2 border-primary rounded-xl p-3 text-center">
                  <p className="text-sm text-primary font-medium">
                    {movingMarkerId
                      ? 'Clique no mapa para mover o marcador'
                      : isAddingStand
                        ? 'Clique no mapa para posicionar o novo stand'
                        : 'Clique no mapa para posicionar o novo marcador'}
                  </p>
                  <button
                    onClick={() => {
                      setIsAddingMarker(false);
                      setIsAddingStand(false);
                      setMovingMarkerId(null);
                      setNewMarkerPos(null);
                      setNewStandPos(null);
                    }}
                    className="mt-2 text-sm text-primary underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Mapa interativo */}
              <div 
                className={`relative w-full h-64 rounded-xl overflow-hidden border-2 ${isAddingMarker || movingMarkerId ? 'border-primary cursor-crosshair' : 'border-border'}`}
                onClick={handleMapClick}
              >
                <img src={mapaFenearte} alt="Mapa da FENEARTE" className="w-full h-full object-contain" />
                
                {/* Marcadores existentes */}
                {standMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-full z-10 ${movingMarkerId === marker.id ? 'opacity-50' : ''}`}
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  >
                    <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" fill="currentColor" />
                  </div>
                ))}

                {/* Novo marcador temporário */}
                {newMarkerPos && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-full z-20 animate-pulse"
                    style={{ left: `${newMarkerPos.x}%`, top: `${newMarkerPos.y}%` }}
                  >
                    <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
                  </div>
                )}

                {newStandPos && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-full z-20 animate-pulse"
                    style={{ left: `${newStandPos.x}%`, top: `${newStandPos.y}%` }}
                  >
                    <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" />
                  </div>
                )}
              </div>

              {isAddingStand && (
                <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    value={newStandName}
                    onChange={(e) => setNewStandName(e.target.value)}
                    placeholder="Nome do stand"
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />

                  <input
                    type="number"
                    value={newStandNumber}
                    onChange={(e) => setNewStandNumber(e.target.value)}
                    placeholder="Número do stand (opcional)"
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />

                  <select
                    value={newStandCategory}
                    onChange={(e) => setNewStandCategory(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-card"
                  >
                    <option value="">Selecione a categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>

                  <p className="text-xs text-muted-foreground">
                    {newStandPos ? 'Posição definida no mapa.' : 'Clique no mapa para definir a posição do stand.'}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsAddingStand(false);
                        setNewStandPos(null);
                        setNewStandName('');
                        setNewStandCategory('');
                        setNewStandNumber('');
                      }}
                      className="flex-1 py-2 border-2 border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNewStand}
                      disabled={!newStandName.trim() || !newStandCategory || !newStandPos}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium
                                 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                      Criar stand
                    </button>
                  </div>
                </div>
              )}

              {/* Formulário para novo marcador */}
              {newMarkerPos && (
                <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    value={newMarkerName}
                    onChange={(e) => setNewMarkerName(e.target.value)}
                    placeholder="Nome do stand (ex: Stand #42 - Nome)"
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setNewMarkerPos(null);
                        setNewMarkerName('');
                      }}
                      className="flex-1 py-2 border-2 border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNewMarker}
                      disabled={!newMarkerName.trim()}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium
                                 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de marcadores */}
              <div className="space-y-3">
                {standMarkers.map((marker) => (
                  <div key={marker.id} className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-foreground text-sm">{marker.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMovingMarkerId(marker.id)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Mover"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMarker(marker.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB: CONTAGEM DE VISITAS
              Visualizar e resetar contagem de acessos dos stands
              ============================================================ */}
          {activeTab === 'visits' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Contagem de Visitas</h2>
                <button
                  onClick={handleResetVisits}
                  disabled={resettingVisits}
                  className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium
                             disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {resettingVisits ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Resetar Tudo
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                Use este botão antes de uma nova edição da FENEARTE para zerar todas as contagens.
              </p>

              {/* Lista de stands com visitas */}
              <div className="space-y-3">
                {visitStands.map((stand) => (
                  <div key={stand.id} className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Stand #{stand.id}</p>
                      <p className="text-sm text-muted-foreground">{stand.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{stand.accessCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">visitas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Trilhas</h2>

              <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Crie uma rota por categoria para missão de brindes.
                </p>

                <input
                  type="text"
                  value={trailName}
                  onChange={(e) => setTrailName(e.target.value)}
                  placeholder="Nome da trilha"
                  className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                             focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />

                <select
                  value={trailCategory}
                  onChange={(e) => {
                    setTrailCategory(e.target.value);
                    setSelectedTrailStandIds([]);
                  }}
                  className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                             focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-card"
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {trailCategory ? (
                    availableTrailStands.map((stand) => {
                      const selected = selectedTrailStandIds.includes(stand.id);
                      return (
                        <button
                          key={stand.id}
                          onClick={() => handleToggleTrailStand(stand.id)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                            selected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <p className="font-medium text-sm text-foreground">
                            {stand.number ? `#${stand.number} - ` : ''}{stand.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{stand.category}</p>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Selecione uma categoria para escolher os stands.</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Ordem da rota: {selectedTrailStandIds.length > 0 ? selectedTrailStandIds.length : 0} stands selecionados
                </p>

                <div className="flex gap-2">
                  {editingTrailId && (
                    <button
                      onClick={resetTrailForm}
                      className="flex-1 py-2 border-2 border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Cancelar edição
                    </button>
                  )}
                  <button
                    onClick={handleSaveTrail}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {editingTrailId ? 'Salvar alterações' : 'Criar trilha'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {trails.map((trail) => (
                  <article key={trail.id} className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{trail.name}</p>
                        <p className="text-xs text-muted-foreground">{trail.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${trail.isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {trail.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Rota: {trail.stands.map((item) => item.stand.number ? `#${item.stand.number}` : item.stand.name).join(' → ')}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTrail(trail)}
                        className="flex-1 py-2 border-2 border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleTrailActive(trail)}
                        className="flex-1 py-2 border-2 border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        {trail.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDeleteTrail(trail.id)}
                        className="px-3 py-2 border-2 border-destructive text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}

                {trails.length === 0 && (
                  <div className="bg-card border-2 border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
                    Nenhuma trilha cadastrada.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Categorias</h2>

              <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Cadastre categorias para serem usadas no mapa, nos stands e nas trilhas.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="bg-card border-2 border-border rounded-xl p-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{category.name}</p>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 py-1.5 border-2 border-destructive text-destructive rounded-lg text-xs font-medium hover:bg-destructive/10 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="bg-card border-2 border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
                    Nenhuma categoria cadastrada.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">Perguntas</h2>
                {!isQuestionFormOpen && (
                  <button
                    onClick={handleOpenCreateQuestionForm}
                    className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label="Adicionar pergunta"
                    title="Adicionar pergunta"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!isQuestionFormOpen ? (
                <div className="space-y-2">
                {surveyQuestions.map((question) => (
                  <article key={question.id} className="bg-card border-2 border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{question.label}</p>
                        <p className="text-xs text-muted-foreground">slug: {question.slug}</p>
                        <p className="text-xs text-muted-foreground">tipo: {question.type} • ordem: {question.order}</p>
                        {question.options && question.options.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">opções: {question.options.join(', ')}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${question.isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {question.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="flex-1 py-2 border-2 border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleQuestionActive(question)}
                        className="flex-1 py-2 border-2 border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        {question.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </article>
                ))}

                {surveyQuestions.length === 0 && (
                  <div className="bg-card border-2 border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
                    Nenhuma pergunta cadastrada.
                  </div>
                )}
                </div>
              ) : (
                <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {editingQuestionId
                      ? 'Edite os dados da pergunta selecionada.'
                      : 'Preencha os campos para adicionar uma nova pergunta.'}
                  </p>

                  <input
                    type="text"
                    value={questionSlug}
                    onChange={(e) => setQuestionSlug(e.target.value)}
                    placeholder="Slug (ex: faixa_etaria)"
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />

                  <input
                    type="text"
                    value={questionLabel}
                    onChange={(e) => setQuestionLabel(e.target.value)}
                    placeholder="Texto da pergunta"
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                               focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as AdminSurveyQuestionType)}
                      className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                                 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-card"
                    >
                      <option value="SINGLE_CHOICE">Escolha única</option>
                      <option value="MULTI_CHOICE">Múltipla escolha</option>
                      <option value="TEXT">Texto livre</option>
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={questionOrder}
                      onChange={(e) => setQuestionOrder(e.target.value)}
                      placeholder="Ordem"
                      className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                                 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>

                  {questionType !== 'TEXT' && (
                    <textarea
                      value={questionOptionsText}
                      onChange={(e) => setQuestionOptionsText(e.target.value)}
                      placeholder="Opções separadas por vírgula"
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                                 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  )}

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={questionIsActive}
                      onChange={(e) => setQuestionIsActive(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Pergunta ativa
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseQuestionForm}
                      className="flex-1 py-2 border-2 border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      {editingQuestionId ? 'Cancelar edição' : 'Voltar para lista'}
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {editingQuestionId ? 'Salvar alterações' : 'Adicionar pergunta'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              BOTÃO DE LOGOUT
              ============================================================ */}
          <button
            onClick={handleLogout}
            className="w-full mt-6 py-4 border-2 border-destructive text-destructive rounded-xl
                       flex items-center justify-center gap-2 text-accessible-lg font-bold
                       hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            {t('logout')}
          </button>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
