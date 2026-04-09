import { useState, useEffect } from 'react';
import ConfigServices from '../services/ConfigServices';

/**
 * Module-level promise cache — fetches once per session, shared across all
 * component instances. Survives unmount/remount without refetching.
 */
let cachedPromise = null;

/**
 * Hook that provides MVP candidates from the server.
 * Uses a module-level cache so the GET /config/mvp_candidates call happens
 * only once per browser session, no matter how many components use it.
 *
 * @returns {{ mvpCandidates: Array|null, loading: boolean, error: string|null }}
 *   mvpCandidates shape: [{ nbaPlayerId, name, teamId, teamName, mvpPoints }]
 */
export const clearMvpCandidatesCache = () => { cachedPromise = null; };

export const useMvpCandidates = () => {
  const [state, setState] = useState({ mvpCandidates: null, loading: true, error: null });

  useEffect(() => {
    if (!cachedPromise) {
      cachedPromise = ConfigServices.getMvpCandidates();
    }
    cachedPromise
      .then(data => setState({ mvpCandidates: data, loading: false, error: null }))
      .catch(err => {
        cachedPromise = null; // allow retry on next mount
        setState({ mvpCandidates: null, loading: false, error: err.message });
      });
  }, []);

  return state;
};
