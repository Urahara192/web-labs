import React, { useEffect, useState } from 'react';
import { eventService } from '../../api/eventService';
import styles from './ParticipantsList.module.scss';

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface ParticipantsListProps {
  eventId: string;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ eventId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await eventService.getEventParticipants(eventId);
        setParticipants(response);
      } catch (err) {
        setError('Ошибка при загрузке списка участников');
        console.error('Error fetching participants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка списка участников...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (participants.length === 0) {
    return <div className={styles.empty}>Нет участников</div>;
  }

  return (
    <div className={styles.participantsList}>
      {participants.map((participant) => (
        <div key={participant.id} className={styles.participantItem}>
          <div className={styles.participantName}>{participant.name}</div>
          <div className={styles.participantEmail}>{participant.email}</div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsList; 