import api from './api';
import type { 
  MovieDTO, 
  ShowDTO, 
  BookingDTO, 
  UserDTO, 
  PaymentDTO, 
  TheatreDTO 
} from '../types';

export const movieService = {
  // Authentication
  loginUser: async (credentials: { email: string; password?: string }) => {
    const response = await api.post<{ token: string; user: UserDTO }>('/v1/auth/login', credentials);
    return response.data;
  },

  registerUser: async (userData: UserDTO) => {
    const response = await api.post<UserDTO>('/v1/auth/register', userData);
    return response.data;
  },

  // Movie Management (CRUD)
  getAllMovies: async () => {
    const response = await api.get<MovieDTO[]>('/v1/movies');
    return response.data;
  },

  getMovieById: async (id: number) => {
    const response = await api.get<MovieDTO>(`/v1/movies/${id}`);
    return response.data;
  },

  addMovie: async (movieData: MovieDTO) => {
    const response = await api.post<MovieDTO>('/v1/movies', movieData);
    return response.data;
  },

  updateMovie: async (id: number, movieData: MovieDTO) => {
    const response = await api.put<MovieDTO>(`/v1/movies/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id: number) => {
    await api.delete(`/v1/movies/${id}`);
  },

  // Theatre Management (CRUD)
  getAllTheatres: async () => {
    const response = await api.get<TheatreDTO[]>('/v1/theatres');
    return response.data;
  },

  addTheatre: async (theatreData: TheatreDTO) => {
    const response = await api.post<TheatreDTO>('/v1/theatres', theatreData);
    return response.data;
  },

  updateTheatre: async (id: number, theatreData: TheatreDTO) => {
    const response = await api.put<TheatreDTO>(`/v1/theatres/${id}`, theatreData);
    return response.data;
  },

  deleteTheatre: async (id: number) => {
    await api.delete(`/v1/theatres/${id}`);
  },

  // Show Management (CRUD)
  getShowsByMovieId: async (movieId: number) => {
    const response = await api.get<ShowDTO[]>(`/v1/shows/movie/${movieId}`);
    return response.data;
  },

  getAllShows: async () => {
    const response = await api.get<ShowDTO[]>('/v1/shows');
    return response.data;
  },

  createShow: async (showData: ShowDTO) => {
    const response = await api.post<ShowDTO>('/v1/shows', showData);
    return response.data;
  },

  updateShow: async (id: number, showData: ShowDTO) => {
    const response = await api.put<ShowDTO>(`/v1/shows/${id}`, showData);
    return response.data;
  },

  deleteShow: async (id: number) => {
    await api.delete(`/v1/shows/${id}`);
  },

  // Booking & Payment Services
  createBooking: async (bookingData: BookingDTO) => {
    const response = await api.post<BookingDTO>('/v1/bookings', bookingData);
    return response.data;
  },

  getBookingsByUserId: async (userId: number) => {
    const response = await api.get<BookingDTO[]>(`/v1/bookings/user/${userId}`);
    return response.data;
  },

  // Get Booked Seats by Show ID
  getBookedSeatsByShowId: async (showId: number): Promise<string[]> => {
    const response = await api.get<string[]>(`/v1/bookings/show/${showId}/seats`);
    return response.data;
  },

  processPayment: async (paymentData: PaymentDTO) => {
    const response = await api.post<PaymentDTO>('/v1/payments', paymentData);
    return response.data;
  }
};