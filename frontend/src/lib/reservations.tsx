import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { isSameDay, isBefore, setHours, setMinutes, areIntervalsOverlapping, startOfDay, endOfDay } from 'date-fns';

export type ReservationStatus = 'PENDING' | 'CHECKED_IN' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  userId: string;
  spotId: string;
  from: Date;
  to: Date;
  isElectric: boolean;
  status: ReservationStatus;
  createdAt: Date;
}

interface ReservationContextType {
  reservations: Reservation[];
  history: Reservation[];
  addReservation: (data: Omit<Reservation, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  checkIn: (reservationId: string) => void;
  checkInBySpot: (spotId: string) => void;
  cancelReservation: (reservationId: string) => void;
  getReservationBySpot: (spotId: string, date?: Date) => Reservation | undefined;
  getReservationsByDate: (date: Date) => Reservation[];
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);

  // Persist reservations
  useEffect(() => {
    const stored = localStorage.getItem('all_reservations');
    const storedHistory = localStorage.getItem('reservations_history');
    if (stored) {
      setReservations(JSON.parse(stored).map((r: any) => ({
        ...r,
        from: new Date(r.from),
        to: new Date(r.to),
        createdAt: new Date(r.createdAt)
      })));
    }
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory).map((r: any) => ({
        ...r,
        from: new Date(r.from),
        to: new Date(r.to),
        createdAt: new Date(r.createdAt)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('all_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('reservations_history', JSON.stringify(history));
  }, [history]);

  // Simulate automatic expiration at 11:00 AM for pending reservations starting today
  useEffect(() => {
    const checkExpiration = () => {
      const now = new Date();
      const limit = setMinutes(setHours(now, 11), 0);

      if (isBefore(limit, now)) {
        setReservations(prev => {
          const toExpire = prev.filter(res => 
            res.status === 'PENDING' && 
            isSameDay(res.from, now)
          );

          if (toExpire.length === 0) return prev;

          // Move expired to history
          setHistory(h => [...h, ...toExpire.map(res => ({ ...res, status: 'EXPIRED' as const }))]);
          
          return prev.filter(res => 
            !(res.status === 'PENDING' && isSameDay(res.from, now))
          );
        });
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    checkExpiration();
    return () => clearInterval(interval);
  }, []);

  const addReservation = (data: Omit<Reservation, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    if (!user) return;

    // Check for existing reservation for the same user on overlapping dates
    const hasOverlap = reservations.some(r => 
      r.userId === user.id && 
      r.status !== 'CANCELLED' &&
      areIntervalsOverlapping(
        { start: startOfDay(r.from), end: endOfDay(r.to) },
        { start: startOfDay(data.from), end: endOfDay(data.to) }
      )
    );

    if (hasOverlap) {
      alert("Vous avez déjà une réservation sur cette période.");
      return;
    }

    const newReservation: Reservation = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservation = (id: string, data: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const checkIn = (reservationId: string) => {
    setReservations(prev => {
      const res = prev.find(r => r.id === reservationId);
      if (!res) return prev;
      
      const updated = { ...res, status: 'CHECKED_IN' as const };
      return prev.map(r => r.id === reservationId ? updated : r);
    });
  };

  const checkInBySpot = (spotId: string) => {
    const now = new Date();
    const res = reservations.find(r => r.spotId === spotId && isSameDay(r.from, now) && r.status === 'PENDING');
    if (res) {
      checkIn(res.id);
    }
  };

  const cancelReservation = (reservationId: string) => {
    setReservations(prev => {
      const res = prev.find(r => r.id === reservationId);
      if (res) {
        setHistory(h => [...h, { ...res, status: 'CANCELLED' as const }]);
      }
      return prev.filter(r => r.id !== reservationId);
    });
  };

  const getReservationBySpot = (spotId: string, date: Date = new Date()) => {
    return reservations.find(r => r.spotId === spotId && isSameDay(r.from, date));
  };

  const getReservationsByDate = (date: Date) => {
    return reservations.filter(r => isSameDay(r.from, date));
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      history, 
      addReservation, 
      updateReservation,
      checkIn, 
      checkInBySpot,
      cancelReservation,
      getReservationBySpot,
      getReservationsByDate
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}
