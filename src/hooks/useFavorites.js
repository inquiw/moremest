import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', session.user.id);

    if (!error && data) {
      setFavoriteIds(new Set(data.map((f) => f.property_id)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchFavorites();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (propertyId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const isFav = favoriteIds.has(propertyId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('property_id', propertyId);
      if (!error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }
      return false;
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: session.user.id, property_id: propertyId });
      if (!error) {
        setFavoriteIds((prev) => new Set([...prev, propertyId]));
      }
      return true;
    }
  }, [favoriteIds]);

  const isFavorite = useCallback((propertyId) => favoriteIds.has(propertyId), [favoriteIds]);

  const getFavoriteProperties = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('property_id, properties(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((f) => f.properties).filter(Boolean);
  }, []);

  return { favoriteIds, loading, toggleFavorite, isFavorite, getFavoriteProperties, refresh: fetchFavorites };
};
