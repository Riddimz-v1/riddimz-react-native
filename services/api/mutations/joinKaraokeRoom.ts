import { gql } from '@apollo/client';

export const JOIN_KARAOKE_ROOM = gql`
  mutation JoinKaraokeRoom($roomId: ID!) {
    joinRoom(roomId: $roomId) {
      success
      message
      room {
        id
        participants
      }
    }
  }
`;
