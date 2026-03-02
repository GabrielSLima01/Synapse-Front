import api from './api';

export interface PhotoEdition {
  year: number;
  isCurrent: boolean;
  photoCount: number;
}

export interface Photo {
  id: string;
  url: string;
  author: string;
  year: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const photoService = {
  getEditions: async () => {
    const { data } = await api.get<PhotoEdition[]>('/api/photos/editions');
    return data || [];
  },

  getPhotos: async (params: { year?: number; status?: 'PENDING' | 'APPROVED' | 'REJECTED' }) => {
    const { data } = await api.get<Photo[]>('/api/photos', { params });
    return data || [];
  },

  uploadPhoto: async (payload: { author: string; image: File }) => {
    const formData = new FormData();
    formData.append('author', payload.author);
    formData.append('image', payload.image);

    const { data } = await api.post<{ id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>(
      '/api/photos',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return data;
  }
};
