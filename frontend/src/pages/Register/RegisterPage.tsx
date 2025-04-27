// frontend/src/pages/Register/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterPage.module.scss';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      const success = await registerUser(data.email, data.password, data.name);
      if (success) {
        navigate('/events');
      } else {
        setError('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Произошла ошибка при регистрации.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Регистрация</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: 'Имя обязательно',
                minLength: {
                  value: 2,
                  message: 'Имя должно быть не менее 2 символов',
                },
              })}
            />
            {errors.name && (
              <span className={styles.error}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email обязателен',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email',
                },
              })}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Пароль обязателен',
                minLength: {
                  value: 6,
                  message: 'Пароль должен быть не менее 6 символов',
                },
              })}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Подтвердите пароль',
                validate: (value) =>
                  value === password || 'Пароли не совпадают',
              })}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {(error || authError) && (
            <div className={styles.error}>{error || authError}</div>
          )}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className={styles.loginLink}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
