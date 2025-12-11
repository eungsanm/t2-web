import api from './api';
import type { Book, CreateBookDto, DarBajaBookDto, BookDetails } from '../types';

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const response = await api.get('/books');
    return response.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  getDetails: async (id: number): Promise<BookDetails> => {
    const response = await api.get(`/books/${id}/details`);
    return response.data;
  },

  create: async (data: CreateBookDto): Promise<Book> => {
    const response = await api.post('/books', data);
    return response.data;
  },

  update: async (id: number, data: CreateBookDto): Promise<Book> => {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/books/${id}`);
  },

  darBaja: async (id: number, data: DarBajaBookDto): Promise<{ success: boolean; message: string; bookId: number }> => {
    const response = await api.post(`/books/${id}/darbaja`, data);
    return response.data;
  },
};

