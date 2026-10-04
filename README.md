# Online Movie Ticket Booking System - Frontend Application

A responsive, single-page web application (SPA) built with React, TypeScript, and Vite for searching movies, checking showtimes, selecting seats in real-time, and booking tickets online.

---

## 🛠️️ Tech Stack & Libraries

* **Build Tool & Bundler:** Vite
* **Framework/Library:** React 19 (TypeScript)
* **Routing:** React Router DOM (v7)
* **HTTP Client:** Axios (for Backend API communication)
* **Styling & UI:** Bootstrap 5 & Bootstrap Icons

---

## 🔑 Test Credentials (Default Users)

For evaluating role-based views and testing features:

| Role | Email | Password | Access & Features |
|---|---|---|---|
| **Admin** | `admindasun@gmail.com` | `admin123` | Movie, Theatre & Show Scheduling Management |
| **Customer** | `nirosh@gmail.com` | `pass123` | Browsing, Real-time Seat Grid Selection, Booking & Payments |

---

## 🚀 How to Run the Frontend Application

1. Open your terminal and navigate to the frontend project directory:
   ```bash
   cd frontend

   **Install the necessary project dependencies:**
   npm install

 **  Ensure the Spring Boot backend server is running at http://localhost:8081.
**
 Start the Vite development server:

Bash
npm run dev

**The application will start and be accessible at:
**
http://localhost:5173

## 🏗️ Key Features & Architecture

* 🔐 **Role-Based Routing:** Protected routes restricting Admin dashboards and features strictly to authorized administrators.
* 🔑 **Authentication & Authorization:** Secure JWT token management handled via `localStorage` and automated API request interceptors.
* 🎟️ **Interactive Seat Selection Grid:** Real-time seat layout visualization fetching and locking already-reserved seats for any selected show.
* 📅 **Dynamic Show Filtering:** Automated show schedule filtering based on valid future show dates and times to prevent expired bookings.
