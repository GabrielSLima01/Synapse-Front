/**
 * ============================================================
 * HOME.TSX - TELA PRINCIPAL DA APLICAÇÃO FENEARTE
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Página inicial após seleção de idioma. Exibe menu principal com
 * todas as funcionalidades disponíveis para visitantes.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. AUTENTICAÇÃO (HEADER)
 *    - Verifica se usuário está logado via contexto
 *    - Se logado: mostra nome/WhatsApp do usuário
 *    - Se admin: link direto para /admin
 *    - Se não logado: mostra botões "Entrar" e "Cadastrar"
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/auth/me → Retorna usuário logado (id, whatsapp, isAdmin)
 *    - Token JWT no header Authorization
 * 
 * 2. MENU DE FUNCIONALIDADES (6 BOTÕES)
 *    - Mapa e Stands → /map
 *    - Stands em Destaque → /top-stands
 *    - Fotos → /public-photos
 *    - Avaliação → /rating
 *    - Informações → /information
 *    - Ajuda → /help
 *    
 *    BACKEND: Não requer chamadas, apenas navegação frontend
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * User (do contexto):
 * {
 *   id: string,
 *   whatsapp: string
 * }
 * 
 * isAdmin: boolean (indica se é administrador)
 * 
 * ============================================================
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageFooter } from '@/components/layout/PageFooter';
import { FeatureButton } from '@/components/ui/FeatureButton';
import { Info, MapIcon, Star, HelpCircle, Camera, LogIn, User, UserPlus, MessageSquare, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  // Hook de tradução para internacionalização (PT/EN/ES)
  const { t } = useLanguage();
  
  // Hook de autenticação - retorna user logado e se é admin
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/home');
  };

  /**
   * DEFINIÇÃO DOS 6 BOTÕES DO MENU PRINCIPAL
   * Cada objeto define: rota, ícone e label traduzido
   */
  const features = [
    { to: '/map', icon: <MapIcon className="w-12 h-12" strokeWidth={2} />, label: 'Mapa e Stands' },
    { to: '/top-stands', icon: <Star className="w-12 h-12" strokeWidth={2} />, label: t('topStands') },
    { to: '/public-photos', icon: <Camera className="w-12 h-12" strokeWidth={2} />, label: t('photos') },
    { to: '/rating', icon: <MessageSquare className="w-12 h-12" strokeWidth={2} />, label: 'Avaliação' },
    { to: '/information', icon: <Info className="w-12 h-12" strokeWidth={2} />, label: t('information') },
    { to: '/help', icon: <HelpCircle className="w-12 h-12" strokeWidth={2} />, label: t('help') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ============================================================
          HEADER - BARRA SUPERIOR
          Contém: título FENEARTE + botões de autenticação
          ============================================================ */}
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Espaçador para centralizar título */}
            <div className="w-24" />
            
            {/* TÍTULO DA APLICAÇÃO */}
            <h1 className="text-accessible-2xl font-bold animate-fade-in">
              FENEARTE
            </h1>
            
            {/* ============================================================
                ÁREA DE AUTENTICAÇÃO
                - Se logado: mostra ícone + nome/badge admin
                - Se não logado: mostra botões Entrar e Cadastrar separados
                ============================================================ */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? '/admin' : '/profile'}
                  className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-lg px-3 py-2"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">
                    {isAdmin ? 'Admin' : user.nome || user.whatsapp}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors rounded-lg px-3 py-2"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            ) : (
              // USUÁRIO NÃO LOGADO - Dois botões separados
              <div className="flex items-center gap-2">
                {/* BOTÃO ENTRAR - Navega para /login */}
                <Link
                  to="/login"
                  className="flex items-center gap-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-lg px-3 py-2"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">Entrar</span>
                </Link>
                {/* BOTÃO CADASTRAR - Navega para /signup */}
                <Link
                  to="/signup"
                  className="flex items-center gap-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors rounded-lg px-3 py-2"
                >
                  <UserPlus className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">Cadastrar</span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mensagem de boas-vindas traduzida */}
          <p className="text-accessible-base opacity-90 animate-fade-in animation-delay-100 text-center">
            {t('welcome')}
          </p>
        </div>
      </header>

      {/* ============================================================
          GRID DE FUNCIONALIDADES - 6 BOTÕES
          Layout: 2 colunas x 3 linhas
          Cada botão navega para sua respectiva página
          ============================================================ */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureButton
                key={feature.to}
                to={feature.to}
                icon={feature.icon}
                label={feature.label}
                delay={100 + index * 100}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Rodapé com informações da edição */}
      <PageFooter variant="main" />
    </div>
  );
}
