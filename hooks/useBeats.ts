<file path="hooks/useBeats.ts">
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Beat } from '@/types/schedule';

export function useBeats() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBeats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .order('name');

      if (error) throw error;

      setBeats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch beats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, []);

  return {
    beats,
    isLoading,
    error,
    refetch: fetchBeats,
  };
}
</file>
