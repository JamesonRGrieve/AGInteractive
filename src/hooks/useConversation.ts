import useSWR, { SWRResponse } from 'swr';

// Import all types from the centralized schema file
import log from '@/next-log/log';
import { z } from 'zod';
import { createGraphQLClient } from './lib';
import { Conversation, ConversationSchema } from './z';

// ============================================================================
// Conversation Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage conversation data with real-time updates
 * @param conversationId - Conversation ID to fetch
 * @returns SWR response containing conversation data
 */
export function useConversation(conversationId: string): SWRResponse<Conversation | null> {
  const client = createGraphQLClient();

  return useSWR<Conversation | null>(
    conversationId ? [`/conversation`, conversationId] : null,
    async (): Promise<Conversation | null> => {
      try {
        const query = ConversationSchema.toGQL('query', 'conversation', { conversationId });
        log(['GQL useConversation() Query', query], {
          client: 3,
        });
        const response = await client.request<{ conversation: Conversation }>(query, { conversationId });
        return response.conversation;
      } catch (error) {
        log(['GQL useConversation() Error', error], {
          client: 1,
        });
        return null;
      }
    },
    {
      fallbackData: null,
      refreshInterval: 1000, // Real-time updates
    },
  );
}

/**
 * Hook to fetch and manage all conversations with real-time updates
 * @returns SWR response containing array of conversations
 */
export function useConversations(): SWRResponse<Conversation[]> {
  const client = createGraphQLClient();

  return useSWR<Conversation[]>(
    '/conversations',
    async (): Promise<Conversation[]> => {
      try {
        const query = z.array(ConversationSchema).toGQL('query', 'GetConversations');
        log(['GQL useConversations() Query', query], {
          client: 3,
        });
        const response = await client.request<{ conversations: Conversation[] }>(query);
        return response.conversations;
      } catch (error) {
        log(['GQL useConversations() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );
}
