import { gql } from '@apollo/client';

export const GET_FYP_FEED = gql`
  query GetFYPFeed($limit: Int, $offset: Int) {
    feed(limit: $limit, offset: $offset) {
      id
      title
      artist
      imageUrl
      type
    }
  }
`;
