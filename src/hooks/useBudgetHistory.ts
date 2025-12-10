import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyAPI } from '@/lib/api';

export const useBudgetHistory = () => {
    return useQuery({
        queryKey: ['budgetHistory'],
        queryFn: historyAPI.getAll,
    });
};

export const useMonthHistory = (month: string | null) => {
    return useQuery({
        queryKey: ['budgetHistory', month],
        queryFn: () => (month ? historyAPI.getByMonth(month) : null),
        enabled: !!month,
    });
};

export const useArchiveMonth = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: historyAPI.archive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetHistory'] });
        },
    });
};
