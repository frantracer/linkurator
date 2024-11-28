import { useState, useCallback } from "react";

function useSet<T>() {
  const [set, setSet] = useState<Set<T>>(new Set());

  const add = useCallback((element: T) => {
    setSet((prevSet) => new Set(prevSet).add(element));
  }, []);

  const remove = useCallback((element: T) => {
    setSet((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(element);
      return newSet;
    });
  }, []);

  const reset = useCallback(() => {
    setSet(new Set());
  }, []);

  return { set, add, remove, reset };
}

export default useSet;
