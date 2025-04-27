import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEvents, participateInEvent } from '../../store/slices/eventSlice';
import { getCurrentUser } from '../../store/slices/authSlice';
import { getToken } from '../../utils/localStorage';
import Modal from '../../components/Modal/Modal';
import ParticipantsList from '../../components/ParticipantsList/ParticipantsList';
import styles from './EventsPage.module.scss';

const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { events, isLoading, error } = useAppSelector((state) => state.events);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [participatingEventId, setParticipatingEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
    dispatch(fetchEvents());
  }, [dispatch, isAuthenticated]);

  const handleParticipate = async (eventId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setParticipatingEventId(eventId);
      await dispatch(participateInEvent(eventId)).unwrap();
      dispatch(fetchEvents());
    } catch (error) {
      console.error('Error participating in event:', error);
    } finally {
      setParticipatingEventId(null);
    }
  };

  const handleShowParticipants = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
  };

  const isEventCreator = (eventCreatorId: string) => {
    return user?.id === eventCreatorId;
  };

  const isParticipant = (participants: string[] = []) => {
    return user ? participants.includes(user.id) : false;
  };

  if (isLoading && !participatingEventId) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!events || events.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Мероприятия</h1>
          {isAuthenticated && (
            <Link to="/events/new" className={styles.createButton}>
              Создать мероприятие
            </Link>
          )}
        </div>
        <div className={styles.noEvents}>
          Мероприятий пока нет
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Мероприятия</h1>
        {isAuthenticated && (
          <Link to="/events/new" className={styles.createButton}>
            Создать мероприятие
          </Link>
        )}
      </div>

      <div className={styles.eventsGrid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <h2>{event.title}</h2>
            <p className={styles.description}>{event.description}</p>
            <p className={styles.date}>
              <strong>Дата:</strong> {new Date(event.date).toLocaleDateString()}
            </p>
            <p className={styles.participants}>
              <strong>Участники:</strong>{' '}
              <button
                className={styles.participantsButton}
                onClick={() => handleShowParticipants(event.id)}
              >
                {event.participants?.length || 0}
              </button>
            </p>
            <div className={styles.actions}>
              {isAuthenticated ? (
                isEventCreator(event.createdBy) ? (
                  <Link
                    to={`/events/edit/${event.id}`}
                    className={styles.editButton}
                  >
                    Редактировать
                  </Link>
                ) : !isParticipant(event.participants) ? (
                  <button
                    onClick={() => handleParticipate(event.id)}
                    className={styles.participateButton}
                    disabled={participatingEventId === event.id}
                  >
                    {participatingEventId === event.id ? 'Загрузка...' : 'Участвовать'}
                  </button>
                ) : (
                  <span className={styles.participating}>Вы участвуете</span>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className={styles.participateButton}
                >
                  Войдите, чтобы участвовать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedEventId}
        onClose={handleCloseModal}
        title="Список участников"
      >
        {selectedEventId && <ParticipantsList eventId={selectedEventId} />}
      </Modal>
    </div>
  );
};

export default EventsPage;
