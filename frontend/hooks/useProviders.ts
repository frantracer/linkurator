import {useQuery} from '@tanstack/react-query';
import {Provider} from '../entities/Provider';
import {getProviders} from '../services/providerService';

type ProvidersState = {
  providers: Provider[];
  providersAreLoading: boolean;
}

const useProviders = (): ProvidersState => {
  const {data: providers = [], isLoading: providersAreLoading} = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
    staleTime: 300000, // 5 minutes - providers don't change often
  });

  return {
    providers,
    providersAreLoading,
  };
};

export default useProviders;
