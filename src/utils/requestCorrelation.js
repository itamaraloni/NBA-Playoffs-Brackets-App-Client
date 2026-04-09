const FLOW_ID_STORAGE_KEY = 'request-flow-id';

let inMemoryFlowId = null;

const createCorrelationId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getFlowId = () => {
  if (typeof window === 'undefined') {
    if (!inMemoryFlowId) {
      inMemoryFlowId = createCorrelationId();
    }
    return inMemoryFlowId;
  }

  try {
    const existingFlowId = window.sessionStorage.getItem(FLOW_ID_STORAGE_KEY);
    if (existingFlowId) {
      return existingFlowId;
    }

    const nextFlowId = createCorrelationId();
    window.sessionStorage.setItem(FLOW_ID_STORAGE_KEY, nextFlowId);
    return nextFlowId;
  } catch (_) {
    if (!inMemoryFlowId) {
      inMemoryFlowId = createCorrelationId();
    }
    return inMemoryFlowId;
  }
};

export const createRequestId = () => createCorrelationId();

export const getCorrelationHeaders = () => ({
  'X-Request-ID': createRequestId(),
  'X-Flow-ID': getFlowId(),
});
