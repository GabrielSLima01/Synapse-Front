export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stand {
  id: string;
  number: number;
  name: string;
  categoryId: string;
  category?: Category;
  location: string; // JSON string or "x,y"
  descriptionPT: string;
  descriptionEN: string;
  descriptionES: string;
  image?: string; // Optional in frontend logic (prisma schema didn't show it but mocks had it. I'll keep it optional)
  rating?: number; // Not in schema, keeping optional for UI compatibility
  history?: string; // Not in schema, keeping optional
  updatedAt?: string;
}

export interface User {
  id: string;
  nome: string;
  whatsapp: string;
  role: 'ADMIN' | 'USER';
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AgeRangeCount {
  faixa_etaria: string;
  count: number;
}

export interface StandsResponse {
  stands: Stand[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export type MarkerType = 'BATHROOM' | 'FOOD' | 'ENTRANCE' | 'INFO' | 'EMERGENCY' | 'STAGE' | 'OTHER';

export interface MapMarker {
  id: string;
  type: MarkerType;
  name: string;
  description?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkersResponse {
  markers: MapMarker[];
}

// ============================================================
// SURVEY TYPES
// ============================================================

export type SurveyQuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TEXT';

export interface SurveyQuestion {
  id: string;
  slug: string;
  label: string;
  type: SurveyQuestionType;
  options: string[] | null;
  order: number;
}

export interface SurveyAnswerInput {
  questionId: string;
  answer: string | string[];
}

export interface SurveyChartItem {
  label: string;
  count: number;
}

export interface SurveyDashboardQuestion {
  slug: string;
  label: string;
  type: SurveyQuestionType;
  totalResponses: number;
  data: SurveyChartItem[] | string[];
}
