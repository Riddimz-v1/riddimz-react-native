import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { storage } from '@/utils/storage';
import { API_URL } from '@/utils/constants';

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from storage if it exists
  const token = await storage.getItem('auth_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
     typePolicies: {
         Query: {
             fields: {
                 feed: {
                     // Handle infinite scroll merging
                     keyArgs: false,
                     merge(existing = [], incoming) {
                         return [...existing, ...incoming];
                     }
                 }
             }
         }
     }
  }),
});
