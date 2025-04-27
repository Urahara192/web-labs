import React from 'react';
import { useForm } from 'react-hook-form';
import { Event } from '../../types';
import styles from './EventForm.module.scss';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<Event, 'id' | 'participants'>) => void;
  isLoading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    },
  });

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Название мероприятия</label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Название обязательно' })}
        />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          {...register('description', { required: 'Описание обязательно' })}
        />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Дата проведения</label>
        <input
          id="date"
          type="date"
          min={minDate}
          {...register('date', { required: 'Дата обязательна' })}
        />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
      </div>

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Сохранение...' : event ? 'Сохранить изменения' : 'Создать мероприятие'}
      </button>
    </form>
  );
};

export default EventForm; 