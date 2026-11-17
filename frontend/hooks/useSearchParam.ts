import {useCallback} from "react";
import {useSearchParams} from "next/navigation";
import useSearchParamsUpdate from "./useSearchParamsUpdate";

type UseSearchParam = {
  value: string | null;
  setValue: (value: string | null) => void;
}

// Keeps a piece of page state in the URL so it survives reloads and can be linked to
const useSearchParam = (name: string): UseSearchParam => {
  const searchParams = useSearchParams();
  const updateSearchParams = useSearchParamsUpdate();

  const setValue = useCallback((value: string | null) => {
    updateSearchParams({[name]: value});
  }, [name, updateSearchParams]);

  return {value: searchParams.get(name), setValue};
}

export default useSearchParam;
