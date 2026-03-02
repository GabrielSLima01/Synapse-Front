import api from './api';
import type { SurveyQuestion, SurveyAnswerInput } from '@/types';

export const surveyService = {
  getQuestions: async () => {
    const { data } = await api.get<SurveyQuestion[]>('/api/survey/questions');
    return data || [];
  },

  submitAnswers: async (answers: SurveyAnswerInput[]) => {
    const { data } = await api.post<{ submitted: number }>('/api/survey/answers', { answers });
    return data;
  },

  checkStatus: async () => {
    const { data } = await api.get<{ completed: boolean }>('/api/survey/status');
    return data;
  }
};
