import { useQuery, useMutation } from '@apollo/client';

export function useGraphQL(operation: any, options?: any) {
    if (operation.definitions[0].operation === 'query') {
        return useQuery(operation, options);
    }
    return useMutation(operation, options);
}
