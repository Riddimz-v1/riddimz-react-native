import { gql } from '@apollo/client';

export const GET_KARAOKE_ROOMS = gql`
  query GetKaraokeRooms {
    rooms {
      id
      name
      host
      participantsCount
    }
  }
`;
