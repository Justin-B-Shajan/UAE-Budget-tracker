import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomRentsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Expense } from '@/pages/Index';

export const useRoomRents = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['roomRents', user?.id],
        queryFn: roomRentsAPI.getAll,
        enabled: !!user?.id,
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
