import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import { getToken } from './utils/localStorage';
import Header from './components/Header';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import EventsPage from './pages/Events/EventsPage';
import EventFormPage from './pages/Events/EventFormPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteIfGuest from './components/ProtectedRouteIfGuest';
import './App.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getToken();
    if (token) {
    dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <ProtectedRouteIfGuest>
                <LoginPage />
              </ProtectedRouteIfGuest>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRouteIfGuest>
                <RegisterPage />
              </ProtectedRouteIfGuest>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/edit/:id"
            element={
              <ProtectedRoute>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
