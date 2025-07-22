import useSWR, { SWRResponse } from 'swr';

// Import all types from the centralized schema file
import log from '@/next-log/log';
import '@/zod2gql';

import z, { GQLType } from '@/zod2gql';
import { convertTimestampsToLocal } from '../lib/timezone';
import { createGraphQLClient } from './lib';
import { Conversation, ConversationSchema, Message } from './z';
import axios from 'axios';
import { getCookie } from 'cookies-next';

// ============================================================================
// Conversation Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage conversation data with real-time updates
 * @param id - Conversation ID to fetch
 * @returns SWR response containing conversation data
 */
export function useConversation(id: string , userId:string): SWRResponse<Conversation | null> {
  const client = createGraphQLClient();

  return useSWR<Conversation | null>(
    [`/conversation`, id,userId],
    async (): Promise<Conversation | null> => {
      if (!id || id === '-')
        return {
          messages: [],
        };
      try {
        const query = ConversationSchema.toGQL(GQLType.Query, { variables: { id: id } });
        log(['GQL useConversation() Query', query], {
          client: 3,
        });
        log(['GQL useConversation() Conversation ID', id], {
          client: 3,
        });
        const response = await client.request<{ conversation: Conversation }>(query, { id: id });
        log(['GQL useConversation() Conversations', response], {
          client: 3,
        });

        // Convert timestamps to local time
        const conversation = convertTimestampsToLocal(response.conversation, ['createdAt', 'updatedAt', 'deletedAt']);

        // Convert message timestamps if they exist
        if (conversation.messages) {
          conversation.messages = conversation.messages.map((message: Message) =>
            convertTimestampsToLocal(message, ['createdAt', 'updatedAt', 'deletedAt']),
          );
        }

        if (!conversation.messages) {
          conversation.messages = [];
        }

        return conversation;
      } catch (error) {
        log(['GQL useConversation() Error', error], {
          client: 1,
        });
        return null;
      }
    },
    {
      fallbackData: {
        messages: [],
      },
      refreshInterval: 5000, // Real-time updates
    },
  );
}

/**
 * Hook to fetch and manage all conversations with real-time updates
 * @returns SWR response containing array of conversations
 */
export function useConversations(userId: string): SWRResponse<Conversation[]> {
  return useSWR<Conversation[]>(
    userId ? ['v1/conversation', userId] : null,
    async (): Promise<Conversation[]> => {
      try {
        const jwt = getCookie('jwt');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            validateStatus: (status: number) => [200, 403].includes(status),
          }
        );
        const data = response.data;
        // Expecting data in the form { conversations: [...] }
        if (!data || !Array.isArray(data.conversations)) {
          return [];
        }
        // Filter by userId
        const filtered = data.conversations.filter((conv: any) => conv.created_by_user_id === userId || conv.user_id === userId);
        // Optionally, convert timestamps to local if needed
        return filtered.map((conversation: any) => convertTimestampsToLocal(conversation, ['created_at', 'updated_at']));
      } catch (error: any) {
        log(['REST useConversations() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );
}



/**
 * Hook to fetch and manage messages, filtered by conversation ID
 * @param conversationId - Conversation ID to filter messages
 * @param userId - User ID for authentication/filtering
 * @returns SWR response containing array of messages
 */
export function useMessages(conversationId: string): SWRResponse<Message[]> {
  return useSWR<Message[]>(
    conversationId ? ['v1/message', conversationId] : null,
    async (): Promise<Message[]> => {
      try {
        const jwt = getCookie('jwt');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/message`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            validateStatus: (status: number) => [200, 403].includes(status),
          }
        );
        const data = response.data;
        // Expecting data in the form { messages: [...] }
        if (!data || !Array.isArray(data.messages)) {
          return [];
        }
        // Filter messages by conversationId
        const filtered = data.messages.filter((msg: any) => msg.conversation_id === conversationId);
        // Optionally, convert timestamps to local if needed
        return filtered.map((message: any) => convertTimestampsToLocal(message, ['created_at', 'updated_at', 'deleted_at']));
      } catch (error: any) {
        log(['REST useMessages() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    {
      fallbackData: [],
      refreshInterval: 1000 * 10, // Real-time updates
    },
  );
}