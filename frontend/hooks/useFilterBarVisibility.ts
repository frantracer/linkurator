import {useEffect, useState} from "react";

const FILTER_BAR_VISIBILITY_KEY = "filterBarVisible";
const DEFAULT_VISIBILITY = true;

const readStoredVisibility = (): boolean => {
  try {
    const storedValue = window.localStorage.getItem(FILTER_BAR_VISIBILITY_KEY);
    return storedValue === null ? DEFAULT_VISIBILITY : storedValue === "true";
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

type UseFilterBarVisibility = {
  showFilters: boolean,
  toggleFilters: () => void,
  openFilters: () => void,
}

// Filter bar visibility shared across every page, persisted in localStorage.
const useFilterBarVisibility = (): UseFilterBarVisibility => {
  const [showFilters, setShowFilters] = useState<boolean>(DEFAULT_VISIBILITY);

  // Read after mount so the server render and the first client render match.
  useEffect(() => {
    setShowFilters(readStoredVisibility());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FILTER_BAR_VISIBILITY_KEY) {
        setShowFilters(readStoredVisibility());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateVisibility = (visible: boolean) => {
    setShowFilters(visible);
    try {
      window.localStorage.setItem(FILTER_BAR_VISIBILITY_KEY, String(visible));
    } catch {
      // Storage unavailable (e.g. private mode): keep the in-memory state only.
    }
  }

  return {
    showFilters,
    toggleFilters: () => updateVisibility(!showFilters),
    openFilters: () => updateVisibility(true),
  };
};

export default useFilterBarVisibility;
