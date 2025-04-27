import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchUserEvents } from '../../store/slices/eventSlice';
import styles from './ProfilePage.module.scss';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userEvents, isLoading } = useAppSelector((state) => state.events);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEvents(user.id));
    }
  }, [dispatch, user]);

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileInfo}>
        <h1>Профиль пользователя</h1>
        <div className={styles.userInfo}>
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div className={styles.eventsSection}>
        <h2>Мои мероприятия</h2>
        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <div className={styles.eventsGrid}>
            {userEvents.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p className={styles.date}>
                  <strong>Дата:</strong> {new Date(event.date).toLocaleDateString()}
                </p>
                <p className={styles.participants}>
                  <strong>Участники:</strong> {event.participants.length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 