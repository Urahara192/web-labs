import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  fetchEvents,
  fetchUserEvents,
  createEvent,
  updateEvent,
  participateInEvent,
} from '../store/slices/eventSlice';
import { Event } from '../types';

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const { events, userEvents, selectedEvent, isLoading, error } = useAppSelector(
    (state) => state.events
  );

  const handleFetchEvents = async () => {
    try {
      await dispatch(fetchEvents()).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleFetchUserEvents = async (userId: string) => {
    try {
      await dispatch(fetchUserEvents(userId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'participants'>) => {
    try {
      await dispatch(createEvent(eventData)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      await dispatch(updateEvent({ id, eventData })).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleParticipateInEvent = async (eventId: string) => {
    try {
      await dispatch(participateInEvent(eventId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    events,
    userEvents,
    selectedEvent,
    isLoading,
    error,
    fetchEvents: handleFetchEvents,
    fetchUserEvents: handleFetchUserEvents,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    participateInEvent: handleParticipateInEvent,
  };
}; 