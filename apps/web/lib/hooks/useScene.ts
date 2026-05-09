import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';

export function useScene(sceneId: string | null) {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['scene', sceneId],
    queryFn: async () => {
      const response = await apiClient.get(`/scenes/${sceneId}`);
      return response.data;
    },
    enabled: !!sceneId,
  });

  return {
    scene: data?.scene ?? null,
    assets: data?.assets ?? [],
    clips: data?.clips ?? [],
    loading,
  };
}
