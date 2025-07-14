<file path="hooks/usePatrolCars.ts">
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PatrolCar } from '@/types/schedule';

export function usePatrolCars() {
  const [patrolCars, setPatrolCars] = useState<PatrolCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatrolCars = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('patrol_cars')
        .select('*')
        .order('number');

      if (error) throw error;

      setPatrolCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patrol cars');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrolCars();
  }, []);

  return {
    patrolCars,
    isLoading,
    error,
    refetch: fetchPatrolCars,
  };
}
</file>
