import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Veda, Language, ExternalBlob } from '../backend';

/**
 * Hook to fetch available mantra numbers for a given Veda
 * Uses getAllMantraNumbersForVeda to include both complete mantras and template-only entries
 */
export function useMantraNumbers(veda: Veda) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['mantraNumbers', veda],
    queryFn: async () => {
      if (!actor) return [];
      const numbers = await actor.getAllMantraNumbersForVeda(veda);
      
      // Sort ascending numerically
      const sorted = numbers.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
      
      // De-duplicate: filter out any duplicate bigint values
      const unique: bigint[] = [];
      const seen = new Set<string>();
      
      for (const num of sorted) {
        const key = num.toString();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(num);
        }
      }
      
      return unique;
    },
    enabled: !!actor && !isActorFetching,
    staleTime: 0, // Always fetch fresh data to ensure newly added mantras appear
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Hook to fetch mantra meaning for a given Veda, mantra number, and language
 */
export function useMantraMeaning(veda: Veda, mantraNumber: bigint, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraMeaning', veda, mantraNumber.toString(), language],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraMeaning(veda, mantraNumber, language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0n,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
  });
}

/**
 * Hook to fetch mantra text (translation) for a given Veda, mantra number, and language
 */
export function useMantraText(veda: Veda, mantraNumber: bigint, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraText', veda, mantraNumber.toString(), language],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraText(veda, mantraNumber, language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0n,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
  });
}

/**
 * Hook to fetch mantra metadata/header for a given Veda, mantra number, and language
 */
export function useMantraMetadata(veda: Veda, mantraNumber: bigint, language: Language) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraMetadata', veda, mantraNumber.toString(), language],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraMetadata(veda, mantraNumber, language);
      // Ensure we return null for empty/undefined results
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0n,
    staleTime: 0, // Always fetch fresh data to avoid stale content
    gcTime: 0, // Don't keep data in cache after component unmounts
    placeholderData: undefined, // Never show previous data when query key changes
  });
}

/**
 * Hook to fetch mantra audio file for a given Veda and mantra number
 */
export function useMantraAudio(veda: Veda, mantraNumber: bigint) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['mantraAudio', veda, mantraNumber.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraAudioFile(veda, mantraNumber);
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0n,
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
      mantraNumber: bigint;
      audioBlob: ExternalBlob;
    }) => {
      if (!actor) {
        throw new Error('Backend actor is not available. Please try again.');
      }
      await actor.addMantraAudioFile(veda, mantraNumber, audioBlob);
    },
    onSuccess: (_, variables) => {
      // Invalidate the audio query to refetch the newly uploaded audio
      queryClient.invalidateQueries({
        queryKey: ['mantraAudio', variables.veda, variables.mantraNumber.toString()],
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

/**
 * Hook to fetch saved mantra template for a given Veda and mantra number
 */
export function useMantraTemplate(veda: Veda, mantraNumber: bigint) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['mantraTemplate', veda, mantraNumber.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMantraTemplate(veda, mantraNumber);
      return result || null;
    },
    enabled: !!actor && !isActorFetching && mantraNumber > 0n,
    staleTime: 0,
    gcTime: 0,
    placeholderData: undefined,
  });
}

/**
 * Hook to submit/save mantra template
 */
export function useSubmitMantraTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      veda,
      mantraNumber,
      template,
    }: {
      veda: Veda;
      mantraNumber: bigint;
      template: string;
    }) => {
      if (!actor) {
        throw new Error('Backend actor is not available. Please try again.');
      }
      await actor.submitTemplate(veda, mantraNumber, template);
    },
    onSuccess: (_, variables) => {
      // Invalidate the template query to refetch the newly saved template
      queryClient.invalidateQueries({
        queryKey: ['mantraTemplate', variables.veda, variables.mantraNumber.toString()],
      });
      
      // Invalidate the mantra numbers query to refresh the dropdown
      queryClient.invalidateQueries({
        queryKey: ['mantraNumbers', variables.veda],
      });
    },
    onError: (error: Error) => {
      console.error('Template submission failed:', error);
      throw new Error(
        error.message || 'Failed to submit template. Please try again.'
      );
    },
  });
}
