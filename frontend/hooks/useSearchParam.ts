import {useCallback} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

type UseSearchParam = {
  value: string | null;
  setValue: (value: string | null) => void;
}

// Keeps a piece of page state in the URL so it survives reloads and can be linked to
const useSearchParam = (name: string): UseSearchParam => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setValue = useCallback((value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [name, searchParams, pathname, router]);

  return {value: searchParams.get(name), setValue};
}

export default useSearchParam;
