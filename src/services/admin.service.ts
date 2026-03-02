import api from './api';
import type { AgeRangeCount, MapMarker, SurveyDashboardQuestion } from '@/types';

export type AdminSurveyQuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TEXT';

export interface AdminSurveyQuestion {
  id: string;
  slug: string;
  label: string;
  type: AdminSurveyQuestionType;
  options: string[] | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingRating {
  id: string;
  standId: string | null;
  standName: string | null;
  author: string;
  comment?: string | null;
  rating: number;
  type: 'STAND' | 'GENERAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PendingPhoto {
  id: string;
  url: string;
  author: string;
  year: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface StandVisit {
  id: string;
  name: string;
  accessCount: number;
}

export interface AdminStandOption {
  id: string;
  number?: number | null;
  name: string;
  category: string;
  mapX?: number;
  mapY?: number;
}

export interface TrailStand {
  order: number;
  stand: {
    id: string;
    number?: number | null;
    name: string;
    category: string;
    mapX: number;
    mapY: number;
    image?: string | null;
  };
}

export interface AdminTrail {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stands: TrailStand[];
}

export const adminService = {
  getAgeRanges: async () => {
    const { data } = await api.get<AgeRangeCount[]>('/api/admin/dashboard/age-ranges');
    return data || [];
  },

  getRatings: async (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') => {
    const { data } = await api.get<PendingRating[]>('/api/admin/ratings', { params: { status } });
    return data || [];
  },

  approveRating: async (id: string) => {
    const { data } = await api.put<PendingRating>(`/api/admin/ratings/${id}/approve`);
    return data;
  },

  rejectRating: async (id: string) => {
    const { data } = await api.put<PendingRating>(`/api/admin/ratings/${id}/reject`);
    return data;
  },

  getPhotos: async (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') => {
    const { data } = await api.get<PendingPhoto[]>('/api/admin/photos', { params: { status } });
    return data || [];
  },

  approvePhoto: async (id: string) => {
    const { data } = await api.put<PendingPhoto>(`/api/admin/photos/${id}/approve`);
    return data;
  },

  rejectPhoto: async (id: string) => {
    const { data } = await api.put<PendingPhoto>(`/api/admin/photos/${id}/reject`);
    return data;
  },

  getMarkers: async () => {
    const { data } = await api.get<{ markers: MapMarker[] }>('/api/admin/markers');
    return data.markers || [];
  },

  createMarker: async (payload: Omit<MapMarker, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await api.post<MapMarker>('/api/admin/markers', payload);
    return data;
  },

  updateMarker: async (id: string, payload: Partial<MapMarker>) => {
    const { data } = await api.put<MapMarker>(`/api/admin/markers/${id}`, payload);
    return data;
  },

  deleteMarker: async (id: string) => {
    await api.delete(`/api/admin/markers/${id}`);
  },

  getStandVisits: async () => {
    const { data } = await api.get<StandVisit[]>('/api/admin/stands/visits');
    return data || [];
  },

  getStandsForTrail: async () => {
    const { data } = await api.get<AdminStandOption[]>('/api/admin/stands');
    return data || [];
  },

  createStand: async (payload: { name: string; category: string; mapX: number; mapY: number; number?: number }) => {
    const { data } = await api.post<AdminStandOption>('/api/admin/stands', payload);
    return data;
  },

  getTrails: async () => {
    const { data } = await api.get<AdminTrail[]>('/api/admin/trails');
    return data || [];
  },

  createTrail: async (payload: { name: string; category: string; standIds: string[]; isActive?: boolean }) => {
    const { data } = await api.post<AdminTrail>('/api/admin/trails', payload);
    return data;
  },

  updateTrail: async (id: string, payload: { name?: string; category?: string; standIds?: string[]; isActive?: boolean }) => {
    const { data } = await api.put<AdminTrail>(`/api/admin/trails/${id}`, payload);
    return data;
  },

  deleteTrail: async (id: string) => {
    await api.delete(`/api/admin/trails/${id}`);
  },

  resetVisits: async () => {
    const { data } = await api.post<{ message: string; backupPath?: string }>('/api/admin/stands/reset-visits');
    return data;
  },

  getSurveyDashboard: async () => {
    const { data } = await api.get<SurveyDashboardQuestion[]>('/api/admin/dashboard/survey');
    return data || [];
  },

  getSurveyQuestions: async () => {
    const { data } = await api.get<AdminSurveyQuestion[]>('/api/admin/survey/questions');
    return data || [];
  },

  createSurveyQuestion: async (payload: {
    slug: string;
    label: string;
    type: AdminSurveyQuestionType;
    options?: string[];
    order: number;
    isActive?: boolean;
  }) => {
    const { data } = await api.post<AdminSurveyQuestion>('/api/admin/survey/questions', payload);
    return data;
  },

  updateSurveyQuestion: async (id: string, payload: {
    slug?: string;
    label?: string;
    type?: AdminSurveyQuestionType;
    options?: string[];
    order?: number;
    isActive?: boolean;
  }) => {
    const { data } = await api.put<AdminSurveyQuestion>(`/api/admin/survey/questions/${id}`, payload);
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get<{ categories: AdminCategory[] }>('/api/admin/categories');
    return data.categories || [];
  },

  createCategory: async (name: string) => {
    const { data } = await api.post<AdminCategory>('/api/admin/categories', { name });
    return data;
  },

  deleteCategory: async (id: string) => {
    await api.delete(`/api/admin/categories/${id}`);
  }
};
