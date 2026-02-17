import { gql } from '@apollo/client';

export const SEND_GIFT = gql`
  mutation SendGift($toUserId: ID!, $amount: Float!) {
    sendGift(toUserId: $toUserId, amount: $amount) {
      success
      transactionId
    }
  }
`;
