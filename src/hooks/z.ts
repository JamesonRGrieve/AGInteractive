import { RoleSchema, UserSchema } from '@/auth/hooks/z';
import { z } from 'zod';

export const ConversationMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  updatedByUser: z.string().uuid().optional(),
  deletedAt: z.string().datetime().optional(),
  deletedByUser: z.string().uuid().optional(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: RoleSchema,
  content: z.string().min(1),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  feedbackReceived: z.boolean().default(false),
  notify: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  updatedByUser: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});

export const ConversationSchema = z.object({
  metadata: ConversationMetadataSchema,
  messages: z.array(MessageSchema),
});

export const ConversationEdgeSchema = z.object({
  attachmentCount: z.number().int().nonnegative(),
  createdAt: z.string(), // TODO Figure out why this errors: .datetime(),
  hasNotifications: z.boolean(),
  id: z.string().uuid(),
  name: z.string().min(1),
  summary: z.unknown(),
  updatedAt: z.string(), // TODO Figure out why this errors: .datetime(),.datetime(),
});

export const AppStateSchema = z.object({
  state: z.object({
    conversations: z.object({
      edges: z.array(ConversationEdgeSchema),
    }),
    currentConversation: z.object({
      messages: z.array(MessageSchema),
      metadata: ConversationMetadataSchema,
    }),
    notifications: z.array(
      z.object({
        conversationId: z.string().uuid(),
        conversationName: z.string(),
        message: z.string(),
        messageId: z.string().uuid(),
        timestamp: z.string().datetime(),
        role: z.string(),
      }),
    ),
    user: UserSchema,
  }),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationEdge = z.infer<typeof ConversationEdgeSchema>;
export type ConversationMetadata = z.infer<typeof ConversationMetadataSchema>;
export type Message = z.infer<typeof MessageSchema>;
