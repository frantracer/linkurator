import {useCallback} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

// Updates several URL params in a single navigation, since separate updates would each start from the same URL
// and undo one another
const useSearchParamsUpdate = (): (values: Record<string, string | null>) => void => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback((values: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([name, value]) => {
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [searchParams, pathname, router]);
}

export default useSearchParamsUpdate;
