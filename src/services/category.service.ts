import api from './api';

export interface PublicCategory {
  id: string;
  name: string;
}

export const categoryService = {
  getCategories: async () => {
    const { data } = await api.get<{ categories: PublicCategory[] }>('/api/categories');
    return data.categories || [];
  }
};
