import { useState, useEffect } from 'react';
import ConfigServices from '../services/ConfigServices';

/**
 * Module-level promise cache — fetches once per session, shared across all
 * component instances. Survives unmount/remount without refetching.
 */
let cachedPromise = null;

/**
 * Hook that provides scoring configuration from the server.
 * Uses a module-level cache so the GET /config/scoring call happens
 * only once per browser session, no matter how many components use it.
 *
 * @returns {{ scoringConfig: Object|null, loading: boolean, error: string|null }}
 *   scoringConfig shape: { bracket: { round: { hit, bullseye } }, matchup: { ... } }
 */
export const clearScoringConfigCache = () => { cachedPromise = null; };

export const useScoringConfig = () => {
  const [state, setState] = useState({ scoringConfig: null, loading: true, error: null });

  useEffect(() => {
    if (!cachedPromise) {
      cachedPromise = ConfigServices.getScoringConfig();
    }
    cachedPromise
      .then(data => setState({ scoringConfig: data, loading: false, error: null }))
      .catch(err => {
        cachedPromise = null; // allow retry on next mount
        setState({ scoringConfig: null, loading: false, error: err.message });
      });
  }, []);

  return state;
};
