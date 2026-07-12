import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import type { SystemSettingRequest } from '@/services/settingsService';

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingsService.getSettings().then(res => res.data),
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: SystemSettingRequest }) =>
      settingsService.updateSetting(key, data).then(res => res.data),
    onSuccess: (updatedSetting) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings', updatedSetting.settingKey] });
    },
  });
};
