import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Expense } from '@/pages/Index';

export const useExpenses = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['expenses', user?.id],
        queryFn: expensesAPI.getAll,
        enabled: !!user?.id,
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Omit<Expense, 'id'> }) =>
            expensesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};
