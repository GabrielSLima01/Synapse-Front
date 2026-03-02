import api from './api';
import { MapMarker, MarkersResponse } from '@/types';

export const mapService = {
  // Get all public markers
  getMarkers: async () => {
    const { data } = await api.get<MarkersResponse>('/map/markers');
    return data.markers || [];
  },

  // Admin: Create marker
  createMarker: async (marker: Omit<MapMarker, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await api.post<MapMarker>('/map/markers', marker);
    return data;
  },

  // Admin: Update marker
  updateMarker: async (id: string, marker: Partial<MapMarker>) => {
    const { data } = await api.put<MapMarker>(`/map/markers/${id}`, marker);
    return data;
  },

  // Admin: Delete marker
  deleteMarker: async (id: string) => {
    await api.delete(`/map/markers/${id}`);
  }
};
