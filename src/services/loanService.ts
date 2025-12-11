import api from './api';
import type { Loan, CreateLoanDto } from '../types';

export const loanService = {
  getAll: async (): Promise<Loan[]> => {
    const response = await api.get('/loans');
    return response.data;
  },

  getById: async (id: number): Promise<Loan> => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<Loan[]> => {
    const response = await api.get(`/loans/status/${status}`);
    return response.data;
  },

  create: async (data: CreateLoanDto): Promise<Loan> => {
    const response = await api.post('/loans', data);
    return response.data;
  },

  returnLoan: async (id: number): Promise<Loan> => {
    const response = await api.post(`/loans/${id}/return`);
    return response.data;
  },
};

