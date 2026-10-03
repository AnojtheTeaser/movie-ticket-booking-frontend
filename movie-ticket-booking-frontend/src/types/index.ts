export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum MovieStatus {
  NOW_SHOWING = 'NOW_SHOWING',
  UPCOMING = 'UPCOMING',
  ENDED = 'ENDED'
}

export enum ShowStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TheatreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CARD = 'CARD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// DTO Interfaces
export interface UserDTO {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
}

export interface MovieDTO {
  id?: number;
  movieId?: number;
  title: string;
  genre: string;
  durationMinutes?: number;
  language?: string;
  releaseDate?: string;
  description?: string;
  posterUrl: string;
  status: MovieStatus;
}

export interface TheatreDTO {
  id?: number;
  theatreId?: number;
  name: string;
  location: string;
  capacity: number;
  status: TheatreStatus;
  seatMapUrl?: string; 
}

export interface ShowDTO {
  id?: number;
  showId?: number;
  movieId: number;
  theatreId: number;
  capacity?: number;     
  seatMapUrl?: string;   
  showDate: string;
  showTime: string;
  ticketPrice: number;
  status?: ShowStatus | string;
}

export interface BookingDTO {
  id?: number;
  bookingId?: number;
  userId: number;
  showId: number;
  seatNumbers: string[];
  numberOfTickets: number;
  totalAmount: number;
  bookingTime?: string;
  status: BookingStatus;
}

export interface PaymentDTO {
  id?: number;
  paymentId?: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionTime?: string;
}