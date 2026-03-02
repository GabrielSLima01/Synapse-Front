import api from './api';

export interface ApiReview {
  id: string;
  name: string;
  description?: string | null;
  rating: number;
  createdAt: string;
}

interface BackendReview {
  id: string;
  author: string;
  comment?: string | null;
  rating: number;
  createdAt: string;
}

const mapReview = (review: BackendReview): ApiReview => ({
  id: review.id,
  name: review.author,
  description: review.comment ?? null,
  rating: review.rating,
  createdAt: review.createdAt
});

export const ratingService = {
  getRatings: async (params?: { rating?: number }) => {
    const { data } = await api.get<BackendReview[]>('/api/ratings', { params });
    return (data || []).map(mapReview);
  },

  createRating: async (payload: { name: string; description?: string; rating: number }) => {
    const { data } = await api.post<BackendReview>('/api/ratings', payload);
    return mapReview(data);
  }
};
