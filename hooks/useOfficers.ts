<file path="hooks/useOfficers.ts">
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Officer } from '@/types/schedule';

export function useOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('name');

      if (error) throw error;

      const officersData: Officer[] = data.map(officer => ({
        id: officer.id,
        name: officer.name,
        badge: officer.badge,
        rank: officer.rank,
        department: officer.department,
        email: officer.email,
        phone: officer.phone,
        avatar: officer.avatar,
        isSupervisor: officer.is_supervisor,
        ptoBalances: {
          vacation: officer.vacation_balance || 0,
          holiday: officer.holiday_balance || 0,
          sick: officer.sick_balance || 0,
        },
      }));

      setOfficers(officersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch officers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  return {
    officers,
    isLoading,
    error,
    refetch: fetchOfficers,
  };
}
</file>
