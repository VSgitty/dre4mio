import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      apiClient.post<Project>('/projects', { name, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => apiClient.delete(`/projects/${projectId}`),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previous = queryClient.getQueryData<Project[]>(['projects']);
      queryClient.setQueryData<Project[]>(['projects'], (old) =>
        old?.filter((p) => p.id !== projectId) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['projects'], ctx?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return {
    projects,
    loading,
    createProject: (name: string, description?: string) =>
      createMutation.mutateAsync({ name, description }),
    deleteProject: (id: string) => deleteMutation.mutate(id),
  };
}
