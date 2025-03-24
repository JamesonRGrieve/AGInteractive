import useSWR, { SWRResponse } from 'swr';

// Import all types from the centralized schema file
import log from '@/next-log/log';
import '@/zod2gql/zod2gql';

import { createGraphQLClient } from './lib';
import { Conversation, ConversationSchema, Message } from './z';
import { convertTimestampsToLocal } from '../lib/timezone';

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
    [`/conversation`, conversationId],
    async (): Promise<Conversation | null> => {
      console.log('useConversation() ID: ', conversationId);
      if (!conversationId || conversationId === '-') return null;
      try {
        const query = ConversationSchema.toGQL('query', 'conversation', { conversationId });
        log(['GQL useConversation() Query', query], {
          client: 3,
        });
        log(['GQL useConversation() Conversation ID', conversationId], {
          client: 3,
        });
        const response = await client.request<{ conversation: Conversation }>(query, { conversationId: conversationId });
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

        return conversation;
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
        const query = ConversationSchema.toGQL('query', 'GetConversations');
        log(['GQL useConversations() Query', query], {
          client: 3,
        });
        const response = await client.request<{ conversations: Conversation[] }>(query);
        log(['GQL useConversation() Conversation ID', response.conversations], {
          client: 3,
        });

        // Convert timestamps to local time for each conversation
        return response.conversations.map((conversation) => {
          const localConversation = convertTimestampsToLocal(conversation, ['createdAt', 'updatedAt']);

          // Convert message timestamps if they exist
          if (localConversation.messages) {
            localConversation.messages = localConversation.messages.map((message: Message) =>
              convertTimestampsToLocal(message, ['createdAt', 'updatedAt']),
            );
          }

          return localConversation;
        });
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
