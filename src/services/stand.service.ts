import api from './api';

export interface ApiStand {
  id: string;
  number?: number | null;
  name: string;
  category: string;
  location?: string | null;
  descriptionPT?: string;
  descriptionEN?: string;
  descriptionES?: string;
  history?: string | null;
  mapX: number;
  mapY: number;
  image?: string | null;
  rating?: number | null;
  accessCount?: number;
}

interface StandsResponse {
  stands: ApiStand[];
}

interface BackendReview {
  id: string;
  author: string;
  comment?: string | null;
  rating: number;
  createdAt: string;
}

export interface StandReview {
  id: string;
  name: string;
  comment?: string | null;
  rating: number;
  createdAt: string;
}

const mapReview = (review: BackendReview): StandReview => ({
  id: review.id,
  name: review.author,
  comment: review.comment ?? null,
  rating: review.rating,
  createdAt: review.createdAt
});

export const standService = {
  getStands: async (params: { search?: string; category?: string; limit?: number }) => {
    const { data } = await api.get<StandsResponse>('/api/stands', { params });
    return data.stands || [];
  },

  getTopStands: async (limit = 10) => {
    const { data } = await api.get<ApiStand[]>('/api/stands/top', { params: { limit } });
    return data || [];
  },

  getTopStandsByCategory: async (limit = 3) => {
    const { data } = await api.get<{ category: string; stands: ApiStand[] }[]>('/api/stands/top-by-category', { params: { limit } });
    return data || [];
  },

  getStandById: async (id: string) => {
    const { data } = await api.get<ApiStand>(`/api/stands/${id}`);
    return data;
  },

  getStandReviews: async (id: string) => {
    const { data } = await api.get<BackendReview[]>(`/api/stands/${id}/reviews`);
    return (data || []).map(mapReview);
  },

  createStandReview: async (id: string, payload: { name: string; comment?: string; rating: number }) => {
    const { data } = await api.post<BackendReview>(`/api/stands/${id}/reviews`, payload);
    return mapReview(data);
  },

  registerVisit: async (id: string) => {
    const { data } = await api.post<{ counted: boolean }>(`/api/stands/${id}/visit`);
    return data;
  }
};
