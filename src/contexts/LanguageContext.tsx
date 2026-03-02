/**
 * LanguageContext.tsx - Contexto de Idiomas
 * 
 * FUNCIONALIDADES:
 * - Suporta 3 idiomas: Português (pt), Inglês (en), Espanhol (es)
 * - Detecta idioma do dispositivo automaticamente
 * - Persiste escolha no localStorage
 * - Fornece função t() para traduzir chaves
 * 
 * USO:
 * const { language, setLanguage, t } = useLanguage();
 * <p>{t('welcome')}</p> // Exibe tradução baseada no idioma atual
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de idioma suportados
export type Language = 'pt' | 'en' | 'es';

// Interface para objeto de traduções
interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

/**
 * DICIONÁRIO DE TRADUÇÕES
 * Contém todas as strings traduzidas do aplicativo
 * Organizado por funcionalidade/página
 */
export const translations: Translations = {
  // ===== SELEÇÃO DE IDIOMA =====
  selectLanguage: {
    pt: 'Selecione seu idioma',
    en: 'Select your language',
    es: 'Selecciona tu idioma',
  },
  continue: {
    pt: 'Continuar',
    en: 'Continue',
    es: 'Continuar',
  },
  
  // ===== MENU PRINCIPAL (HOME) =====
  welcome: {
    pt: 'Bem-vindo à FENEARTE',
    en: 'Welcome to FENEARTE',
    es: 'Bienvenido a FENEARTE',
  },
  information: {
    pt: 'Informações',
    en: 'Information',
    es: 'Información',
  },
  map: {
    pt: 'Mapa',
    en: 'Map',
    es: 'Mapa',
  },
  topStands: {
    pt: 'Stands em Destaque',
    en: 'Featured Stands',
    es: 'Stands Destacados',
  },
  help: {
    pt: 'Ajuda',
    en: 'Help',
    es: 'Ayuda',
  },
  login: {
    pt: 'Entrar',
    en: 'Login',
    es: 'Iniciar Sesión',
  },
  
  // ===== FOTOS =====
  photos: {
    pt: 'Fotos',
    en: 'Photos',
    es: 'Fotos',
  },
  photosCaption: {
    pt: 'Poste suas fotos da FENEARTE',
    en: 'Post your FENEARTE photos',
    es: 'Publica tus fotos de FENEARTE',
  },
  photosTitle: {
    pt: 'Fotos',
    en: 'Photos',
    es: 'Fotos',
  },
  photosChooseOption: {
    pt: 'Escolha uma opção para explorar',
    en: 'Choose an option to explore',
    es: 'Elige una opción para explorar',
  },
  
  // ===== STANDS =====
  standsOption: {
    pt: 'Stands',
    en: 'Stands',
    es: 'Stands',
  },
  standsOptionDescription: {
    pt: 'Veja informações e fotos dos stands participantes',
    en: 'View information and photos from participating stands',
    es: 'Ver información y fotos de los stands participantes',
  },
  publicOption: {
    pt: 'Público',
    en: 'Public',
    es: 'Público',
  },
  publicOptionDescription: {
    pt: 'Envie suas fotos para serem publicadas na galeria',
    en: 'Submit your photos to be published in the gallery',
    es: 'Envía tus fotos para ser publicadas en la galería',
  },
  standsTitle: {
    pt: 'Stands Participantes',
    en: 'Participating Stands',
    es: 'Stands Participantes',
  },
  standsDescription: {
    pt: 'Conheça os stands da FENEARTE',
    en: 'Discover the FENEARTE stands',
    es: 'Conoce los stands de FENEARTE',
  },
  
  // ===== FOTOS PÚBLICAS =====
  publicPhotosTitle: {
    pt: 'Fotos do Público',
    en: 'Public Photos',
    es: 'Fotos del Público',
  },
  publicPhotosDescription: {
    pt: 'Envie sua foto para análise. As melhores fotos serão publicadas na galeria!',
    en: 'Submit your photo for review. The best photos will be published in the gallery!',
    es: '¡Envía tu foto para revisión. Las mejores fotos serán publicadas en la galería!',
  },
  submitPhoto: {
    pt: 'Enviar Foto para Análise',
    en: 'Submit Photo for Review',
    es: 'Enviar Foto para Revisión',
  },
  loginToSubmitPhoto: {
    pt: 'Faça login para enviar suas fotos',
    en: 'Login to submit your photos',
    es: 'Inicia sesión para enviar tus fotos',
  },
  photoSubmitted: {
    pt: 'Foto Enviada!',
    en: 'Photo Submitted!',
    es: '¡Foto Enviada!',
  },
  photoUnderReview: {
    pt: 'Sua foto foi enviada e será analisada pelos administradores.',
    en: 'Your photo has been submitted and will be reviewed by administrators.',
    es: 'Tu foto ha sido enviada y será revisada por los administradores.',
  },
  photoReviewNote: {
    pt: 'As fotos serão analisadas antes de serem publicadas',
    en: 'Photos will be reviewed before being published',
    es: 'Las fotos serán revisadas antes de ser publicadas',
  },
  approvedPhotos: {
    pt: 'Fotos Aprovadas',
    en: 'Approved Photos',
    es: 'Fotos Aprobadas',
  },
  sending: {
    pt: 'Enviando...',
    en: 'Sending...',
    es: 'Enviando...',
  },
  
  // ===== RODAPÉ =====
  footerText: {
    pt: 'FENEARTE - 26ª Edição',
    en: 'FENEARTE - 26th Edition',
    es: 'FENEARTE - 26ª Edición',
  },
  allRightsReserved: {
    pt: 'Todos os direitos reservados',
    en: 'All rights reserved',
    es: 'Todos los derechos reservados',
  },
  
  // ===== PÁGINA DE INFORMAÇÕES =====
  aboutFenearte: {
    pt: 'Sobre a FENEARTE',
    en: 'About FENEARTE',
    es: 'Sobre FENEARTE',
  },
  aboutDescription: {
    pt: 'A FENEARTE é a maior feira de artesanato da América Latina, celebrando a cultura e tradição do artesanato brasileiro.',
    en: 'FENEARTE is the largest craft fair in Latin America, celebrating Brazilian craft culture and tradition.',
    es: 'FENEARTE es la feria de artesanía más grande de América Latina, celebrando la cultura y tradición artesanal brasileña.',
  },
  schedule: {
    pt: 'Horário de Funcionamento',
    en: 'Opening Hours',
    es: 'Horario de Apertura',
  },
  scheduleTime: {
    pt: 'Diariamente: 14h às 22h',
    en: 'Daily: 2 PM to 10 PM',
    es: 'Diariamente: 14h a 22h',
  },
  location: {
    pt: 'Localização',
    en: 'Location',
    es: 'Ubicación',
  },
  locationText: {
    pt: 'Centro de Convenções de Pernambuco, Olinda - PE',
    en: 'Pernambuco Convention Center, Olinda - PE',
    es: 'Centro de Convenciones de Pernambuco, Olinda - PE',
  },
  
  // ===== PÁGINA DO MAPA =====
  mapTitle: {
    pt: 'Mapa da Feira',
    en: 'Fair Map',
    es: 'Mapa de la Feria',
  },
  mapDescription: {
    pt: 'Navegue pelo mapa para encontrar stands e pontos de interesse',
    en: 'Navigate the map to find stands and points of interest',
    es: 'Navega por el mapa para encontrar stands y puntos de interés',
  },
  addPin: {
    pt: 'Adicionar Marcador',
    en: 'Add Pin',
    es: 'Agregar Marcador',
  },
  pinName: {
    pt: 'Nome do local',
    en: 'Location name',
    es: 'Nombre del lugar',
  },
  save: {
    pt: 'Salvar',
    en: 'Save',
    es: 'Guardar',
  },
  cancel: {
    pt: 'Cancelar',
    en: 'Cancel',
    es: 'Cancelar',
  },
  
  // ===== STANDS EM DESTAQUE =====
  topStandsTitle: {
    pt: 'Stands em Destaque',
    en: 'Featured Stands',
    es: 'Stands Destacados',
  },
  topStandsDescription: {
    pt: 'Descubra os stands em destaque desta edição',
    en: 'Discover the featured stands this edition',
    es: 'Descubre los stands destacados de esta edición',
  },
  
  // ===== SELEÇÃO DE ANO (FOTOS) =====
  selectYear: {
    pt: 'Selecione o ano',
    en: 'Select year',
    es: 'Seleccionar año',
  },
  currentEdition: {
    pt: 'Edição atual - Envie sua foto!',
    en: 'Current edition - Submit your photo!',
    es: 'Edición actual - ¡Envía tu foto!',
  },
  pastEdition: {
    pt: 'Edição passada - Somente visualização',
    en: 'Past edition - View only',
    es: 'Edición pasada - Solo visualización',
  },
  viewOnMap: {
    pt: 'Ver no mapa',
    en: 'View on map',
    es: 'Ver en el mapa',
  },
  visits: {
    pt: 'visitas',
    en: 'visits',
    es: 'visitas',
  },
  
  // ===== BUSCA E FILTROS (STANDS) =====
  searchStands: {
    pt: 'Buscar por ID ou nome',
    en: 'Search by ID or name',
    es: 'Buscar por ID o nombre',
  },
  filter: {
    pt: 'Filtrar',
    en: 'Filter',
    es: 'Filtrar',
  },
  filterByCategory: {
    pt: 'Filtrar por categoria',
    en: 'Filter by category',
    es: 'Filtrar por categoría',
  },
  clearFilter: {
    pt: 'Limpar',
    en: 'Clear',
    es: 'Limpiar',
  },
  standsFound: {
    pt: 'stands encontrados',
    en: 'stands found',
    es: 'stands encontrados',
  },
  showingFirst20: {
    pt: 'Mostrando os primeiros 20 resultados. Use a pesquisa para encontrar mais.',
    en: 'Showing first 20 results. Use search to find more.',
    es: 'Mostrando los primeros 20 resultados. Usa la búsqueda para encontrar más.',
  },
  
  // ===== PÁGINA DE AJUDA =====
  helpTitle: {
    pt: 'Central de Ajuda',
    en: 'Help Center',
    es: 'Centro de Ayuda',
  },
  helpDescription: {
    pt: 'Como podemos ajudar você?',
    en: 'How can we help you?',
    es: '¿Cómo podemos ayudarte?',
  },
  faq: {
    pt: 'Perguntas Frequentes',
    en: 'FAQ',
    es: 'Preguntas Frecuentes',
  },
  contact: {
    pt: 'Contato',
    en: 'Contact',
    es: 'Contacto',
  },
  emergency: {
    pt: 'Emergência',
    en: 'Emergency',
    es: 'Emergencia',
  },
  
  // ===== PÁGINA DE LOGIN =====
  loginTitle: {
    pt: 'Acessar Conta',
    en: 'Login',
    es: 'Iniciar Sesión',
  },
  email: {
    pt: 'E-mail',
    en: 'Email',
    es: 'Correo Electrónico',
  },
  password: {
    pt: 'Senha',
    en: 'Password',
    es: 'Contraseña',
  },
  loginButton: {
    pt: 'Entrar',
    en: 'Sign In',
    es: 'Entrar',
  },
  adminAccess: {
    pt: 'Acesso Administrativo',
    en: 'Admin Access',
    es: 'Acceso Administrativo',
  },
  
  // ===== NAVEGAÇÃO =====
  back: {
    pt: 'Voltar',
    en: 'Back',
    es: 'Volver',
  },
  home: {
    pt: 'Início',
    en: 'Home',
    es: 'Inicio',
  },
  
  // ===== ADMIN =====
  adminPanel: {
    pt: 'Painel Administrativo',
    en: 'Admin Panel',
    es: 'Panel Administrativo',
  },
  manageMap: {
    pt: 'Gerenciar Mapa',
    en: 'Manage Map',
    es: 'Administrar Mapa',
  },
  logout: {
    pt: 'Sair',
    en: 'Logout',
    es: 'Cerrar Sesión',
  },
};

// Interface do contexto
interface LanguageContextType {
  language: Language;                              // Idioma atual
  setLanguage: (lang: Language) => void;           // Alterar idioma
  t: (key: string) => string;                      // Função de tradução
  isLanguageSelected: boolean;                     // Se usuário já selecionou idioma
  setIsLanguageSelected: (selected: boolean) => void; // Marcar idioma como selecionado
}

// Criação do contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * getDeviceLanguage - Detecta idioma do navegador
 * @returns Language baseado nas preferências do navegador
 */
function getDeviceLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  return 'en'; // Inglês como fallback
}

/**
 * LanguageProvider - Componente provedor de idioma
 * 
 * COMPORTAMENTO:
 * 1. Carrega idioma salvo do localStorage
 * 2. Se não existir, detecta idioma do dispositivo
 * 3. Persiste alterações no localStorage
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Estado do idioma - carrega do localStorage ou detecta automaticamente
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fenearte-language');
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      return saved as Language;
    }
    return getDeviceLanguage();
  });
  
  // Estado indicando se usuário já passou pela tela de seleção
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(() => {
    return localStorage.getItem('fenearte-language-selected') === 'true';
  });

  // Persiste idioma no localStorage quando muda
  useEffect(() => {
    localStorage.setItem('fenearte-language', language);
  }, [language]);

  // Persiste flag de seleção no localStorage quando muda
  useEffect(() => {
    localStorage.setItem('fenearte-language-selected', String(isLanguageSelected));
  }, [isLanguageSelected]);

  /**
   * t - Função de tradução
   * @param key - Chave da tradução (ex: 'welcome')
   * @returns String traduzida no idioma atual
   */
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLanguageSelected, setIsLanguageSelected }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage - Hook para acessar contexto de idioma
 * 
 * USO:
 * const { t, language, setLanguage } = useLanguage();
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
