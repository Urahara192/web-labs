import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Event Manager
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <Link to="/events" className={styles.link}>
                Мероприятия
              </Link>
              <Link to="/profile" className={styles.link}>
                {user?.name || 'Профиль'}
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>
                Войти
              </Link>
              <Link to="/register" className={styles.link}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
