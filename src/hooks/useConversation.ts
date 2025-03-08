import useSWR, { SWRResponse } from 'swr';

// Import all types from the centralized schema file
import log from '@/next-log/log';
import { z } from 'zod';
import { createGraphQLClient } from './lib';
import { ConversationEdge, ConversationEdgeSchema } from './z';

// ============================================================================
// Conversation Related Hooks
// ============================================================================

// /**
//  * Hook to fetch and manage conversation data with real-time updates
//  * @param conversationId - Conversation ID to fetch
//  * @returns SWR response containing conversation data
//  */
// export function useAppState(conversationId: string): SWRResponse<Conversation | null> {
//   const client = createGraphQLClient();

//   return useSWR<Conversation | null>(
//     conversationId ? [`/conversation`, conversationId] : null,
//     async (): Promise<Conversation | null> => {
//       try {
//         const query = AppStateSchema.toGQL('subscription', 'appState', { conversationId });
//         log(['GQL useAppState() Query', query], {
//           client: 3,
//         });
//         const response = await client.request<Conversation>(query, { conversationId });
//         return response.conversation;
//       } catch (error) {
//         log(['GQL useAppState() Error', error], {
//           client: 1,
//         });
//         return null;
//       }
//     },
//     {
//       fallbackData: null,
//       refreshInterval: 1000, // Real-time updates
//     },
//   );
// }
// export function useConversation(conversationId: string): SWRResponse<Conversation | null> {
//   const client = createGraphQLClient();

//   return useSWR<Conversation | null>(
//     conversationId ? [`/conversation`, conversationId] : null,
//     async (): Promise<Conversation | null> => {
//       try {
//         const query = ConversationSchema.toGQL('query', 'conversation', { conversationId });
//         log(['GQL useConversation() Query', query], {
//           client: 3,
//         });
//         const response = await client.request<Conversation>(query, { conversationId });
//         return response.conversation;
//       } catch (error) {
//         log(['GQL useConversation() Error', error], {
//           client: 1,
//         });
//         return null;
//       }
//     },
//     {
//       fallbackData: null,
//       refreshInterval: 1000, // Real-time updates
//     },
//   );
// }
/**
 * Hook to fetch and manage all conversations with real-time updates
 * @returns SWR response containing array of conversation edges
 */
export function useConversations(): SWRResponse<ConversationEdge[]> {
  const client = createGraphQLClient();

  return useSWR<ConversationEdge[]>(
    '/conversations',
    async (): Promise<ConversationEdge[]> => {
      try {
        const query = z.object({ edges: ConversationEdgeSchema }).toGQL('query', 'GetConversations');
        log(['GQL useConversations() Query', query], {
          client: 3,
        });
        const response = await client.request<{ conversations: { edges: ConversationEdge[] } }>(query);
        return z
          .array(ConversationEdgeSchema)
          .parse(response.conversations.edges.filter((conv) => !conv.name.startsWith('PROMPT_TEST')));
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
