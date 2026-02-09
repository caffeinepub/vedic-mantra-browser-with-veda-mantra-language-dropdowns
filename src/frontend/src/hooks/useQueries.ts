import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Veda, Language, ExternalBlob } from '../backend';

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
      // Convert BigInt to number, deduplicate, and sort ascending
      const uniqueNumbers = Array.from(new Set(numbers.map(n => Number(n))));
      return uniqueNumbers.sort((a, b) => a - b);
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
      const result = await actor.getMantraMeaning(veda, BigInt(mantraNumber), language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
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
      const result = await actor.getMantraText(veda, BigInt(mantraNumber), language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
  });
}

/**
 * Hook to fetch mantra metadata/header for a given Veda, mantra number, and language
 */
export function useMantraMetadata(veda: Veda, mantraNumber: number, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraMetadata', veda, mantraNumber, language],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraMetadata(veda, BigInt(mantraNumber), language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
  });
}

/**
 * Hook to fetch mantra audio file for a given Veda and mantra number
 */
export function useMantraAudio(veda: Veda, mantraNumber: number) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['mantraAudio', veda, mantraNumber],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraAudioFile(veda, BigInt(mantraNumber));
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0,
    staleTime: 0,
    gcTime: 0,
    placeholderData: undefined,
  });
}

/**
 * Hook to upload/replace mantra audio file
 */
export function useUploadMantraAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      veda,
      mantraNumber,
      audioBlob,
    }: {
      veda: Veda;
      mantraNumber: number;
      audioBlob: ExternalBlob;
    }) => {
      if (!actor) {
        throw new Error('Backend actor is not available. Please try again.');
      }
      await actor.addMantraAudioFile(veda, BigInt(mantraNumber), audioBlob);
    },
    onSuccess: (_, variables) => {
      // Invalidate the audio query to refetch the newly uploaded audio
      queryClient.invalidateQueries({
        queryKey: ['mantraAudio', variables.veda, variables.mantraNumber],
      });
    },
    onError: (error: Error) => {
      // Return user-readable error message
      console.error('Audio upload failed:', error);
      throw new Error(
        error.message || 'Failed to upload audio. Please check your file and try again.'
      );
    },
  });
}
