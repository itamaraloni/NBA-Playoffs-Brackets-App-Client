import { useState, useEffect } from 'react';
import ConfigServices from '../services/ConfigServices';

/**
 * Module-level promise cache — fetches once per session, shared across all
 * component instances. Survives unmount/remount without refetching.
 */
let cachedPromise = null;

/**
 * Hook that provides active teams from the server.
 * Uses a module-level cache so the GET /teams call happens
 * only once per browser session, no matter how many components use it.
 *
 * @returns {{ teams: Array|null, loading: boolean, error: string|null }}
 *   teams shape: [{ teamId, name, seed, conference, isActive, championshipPoints }]
 */
export const clearTeamsCache = () => { cachedPromise = null; };

export const useTeams = () => {
  const [state, setState] = useState({ teams: null, loading: true, error: null });

  useEffect(() => {
    if (!cachedPromise) {
      cachedPromise = ConfigServices.getTeams();
    }
    cachedPromise
      .then(data => setState({ teams: data, loading: false, error: null }))
      .catch(err => {
        cachedPromise = null; // allow retry on next mount
        setState({ teams: null, loading: false, error: err.message });
      });
  }, []);

  return state;
};
