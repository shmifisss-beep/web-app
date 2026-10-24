import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadEntries, saveEntries } from '../lib/api';

export function useEntries<T extends { id: string }>(kind: string) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: [kind], queryFn: () => loadEntries<T>(kind) });
  const m = useMutation({
    mutationFn: async (next: T[]) => { await saveEntries(kind, next); return next; },
    onSuccess: (next) => qc.setQueryData([kind], next),
  });
  const list = q.data ?? [];
  return {
    list, loading: q.isLoading, error: q.error as Error | null,
    add: (e: T) => m.mutateAsync([e, ...list]),
    remove: (id: string) => m.mutateAsync(list.filter((x) => x.id !== id)),
  };
}
