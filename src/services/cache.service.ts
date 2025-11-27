// Cache local de eventos para melhor performance
const CACHE_KEY = 'adriano_events_cache';
const CACHE_TIMESTAMP_KEY = 'adriano_events_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const saveToCache = (events: any[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(events));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Erro ao salvar cache:', error);
  }
};

export const getFromCache = (): any[] | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return null;

    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      clearCache();
      return null;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Erro ao ler cache:', error);
    return null;
  }
};

export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Erro ao limpar cache:', error);
  }
};
