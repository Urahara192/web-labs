import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createEvent, updateEvent } from '../../store/slices/eventSlice';
import { getCurrentUser } from '../../store/slices/authSlice';
import { getToken } from '../../utils/localStorage';
import EventForm from '../../components/EventForm/EventForm';
import { Event } from '../../types';
import styles from './EventFormPage.module.scss';

const EventFormPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { events, isLoading } = useAppSelector((state) => state.events);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const event = id ? events.find((e) => e.id === id) : undefined;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
    } else if (!isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (data: Omit<Event, 'id' | 'participants'>) => {
    try {
      setError(null);
      if (id) {
        await dispatch(updateEvent({ id, eventData: data })).unwrap();
      } else {
        await dispatch(createEvent(data)).unwrap();
      }
      navigate('/events');
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(
          error.response?.data?.error || 
          error.message || 
          'Произошла ошибка при сохранении мероприятия'
        );
      }
    }
  };

  if (!isAuthenticated) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {id ? 'Редактирование мероприятия' : 'Создание мероприятия'}
      </h1>
      {error && <div className={styles.error}>{error}</div>}
      <EventForm
        event={event}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EventFormPage; 