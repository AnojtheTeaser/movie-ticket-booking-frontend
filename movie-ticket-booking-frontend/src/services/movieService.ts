import api from './api';

export interface Movie {
  movieId?: number;
  id?: number;
  title: string;
  description: string;
  genre: string;
  durationMinutes?: number;
  language: string;
  posterUrl?: string;
  rating?: number;
}

export const movieService = {
  // Get all movies from backend
  getAllMovies: async () => {
    const response = await api.get<Movie[]>('/v1/movies');
    return response.data;
  },

  // Get single movie by ID
  getMovieById: async (id: number) => {
    const response = await api.get<Movie>(`/v1/movies/${id}`);
    return response.data;
  }
};