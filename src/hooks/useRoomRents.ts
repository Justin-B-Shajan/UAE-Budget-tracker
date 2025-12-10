import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomRentsAPI } from '@/lib/api';
import { Expense } from '@/pages/Index';

export const useRoomRents = () => {
    return useQuery({
        queryKey: ['roomRents'],
        queryFn: roomRentsAPI.getAll,
    });
};

export const useCreateRoomRent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: roomRentsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomRents'] });
        },
    });
};

export const useUpdateRoomRent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Omit<Expense, 'id'> }) =>
            roomRentsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomRents'] });
        },
    });
};

export const useDeleteRoomRent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: roomRentsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomRents'] });
        },
    });
};
