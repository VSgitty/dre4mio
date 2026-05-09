import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';

export function useProject(projectId: string | null) {
  const { data: project, isLoading: loading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}`),
    enabled: !!projectId,
  });

  return { project, loading };
}
