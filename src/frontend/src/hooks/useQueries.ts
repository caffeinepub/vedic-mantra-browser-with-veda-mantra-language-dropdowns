import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Veda, Language } from '../backend';

/**
 * Hook to fetch available mantra numbers for a given Veda
 */
export function useMantraNumbers(veda: Veda) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<number[]>({
    queryKey: ['mantraNumbers', veda],
    queryFn: async () => {
      if (!actor) return [];
      const numbers = await actor.getMantraNumbers(veda);
      // Convert BigInt to number for easier handling in UI
      return numbers.map(n => Number(n));
    },
    enabled: !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to fetch mantra meaning for a given Veda, mantra number, and language
 */
export function useMantraMeaning(veda: Veda, mantraNumber: number, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraMeaning', veda, mantraNumber, language],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getMantraMeaning(veda, BigInt(mantraNumber), language);
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

/**
 * Hook to fetch mantra text (translation) for a given Veda, mantra number, and language
 */
export function useMantraText(veda: Veda, mantraNumber: number, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraText', veda, mantraNumber, language],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getMantraText(veda, BigInt(mantraNumber), language);
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
