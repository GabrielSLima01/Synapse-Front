import api from './api';

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

export interface Trail {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stands: TrailStand[];
}

export interface TrailMission extends Trail {
  visitedStandIds: string[];
  completed: boolean;
}

export interface CompletedTrail {
  id: string;
  completedAt: string;
  trail: Trail;
}

export const trailService = {
  getSuggested: async (category: string) => {
    const { data } = await api.get<Trail>('/api/trails/suggested', { params: { category } });
    return data;
  },

  getMission: async (trailId: string) => {
    const { data } = await api.get<TrailMission>(`/api/trails/${trailId}/mission`);
    return data;
  },

  getCompleted: async () => {
    const { data } = await api.get<CompletedTrail[]>('/api/trails/me/completed');
    return data || [];
  }
};
