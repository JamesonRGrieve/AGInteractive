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
  return useSWR<Conversation | null>(
    id ? [`v1/conversation/${id}`, userId] : null,
    async (): Promise<Conversation | null> => {
      if (!id || !userId || id === '-') {
        return {
          messages: [],
        };
      }
      try {
        const jwt = getCookie('jwt');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            validateStatus: (status: number) => [200, 403, 404].includes(status),
          }
        );
        const data = response.data;
        if (!data || typeof data !== 'object') {
          return { messages: [] };
        }
        // Optionally, filter by userId if needed
        if (data.created_by_user_id !== userId && data.user_id !== userId) {
          return { messages: [] };
        }
        // Convert timestamps to local time
        const conversation = convertTimestampsToLocal(data, ['created_at', 'updated_at', 'deleted_at']);
        // Convert message timestamps if they exist
        if (conversation.messages) {
          conversation.messages = conversation.messages.map((message: Message) =>
            convertTimestampsToLocal(message, ['created_at', 'updated_at', 'deleted_at'])
          );
        }
        if (!conversation.messages) {
          conversation.messages = [];
        }
        return conversation;
      } catch (error) {
        log(['REST useConversation() Error', error], {
          client: 1,
        });
        return null;
      }
    },
    {
      fallbackData: {
        messages: [],
      },
      refreshInterval: 1000, // Real-time updates
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
