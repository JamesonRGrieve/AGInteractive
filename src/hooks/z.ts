import { z } from 'zod';
// Activity schema
export const ActivityTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  extensionId: z.string().uuid(),
  // createdAt: z.string(),
  // createdByUser: z.string().uuid(),
  // updatedAt: z.string().optional(),
  // updatedByUser: z.string().uuid().optional(),
});

// Project schema based directly on the database model
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});

// ProjectContextPrompt schema
export const ProjectContextPromptSchema = z.object({
  id: z.string().uuid(),
  promptId: z.string().uuid(),
  projectId: z.string().uuid(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});
// MessageActivity schema
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  state: z.string().optional(),
  messageId: z.string().uuid(),
  chainStepId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
  updatedByUser: z.string().uuid().optional(),
  type: ActivityTypeSchema.optional(),
});
// Message schema
export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: z.string(), // Assuming this matches RoleSchema
  content: z.string().min(1),
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
  updatedByUser: z.string().uuid().optional(),
  activities: z.array(ActivitySchema).optional(),
});
// Conversation schema
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
  messages: z.array(MessageSchema).optional(),
});

// Artifact schema
export const ArtifactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  relativePath: z.string().min(1),
  hostedPath: z.string().min(1),
  encrypted: z.boolean().default(false),
  projectId: z.string().uuid(),
  sourceMessageId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});

// MessageArtifact schema
export const MessageArtifactSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  artifactId: z.string().uuid(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});

// MessageFeedback schema
export const MessageFeedbackSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  content: z.string().min(1),
  positive: z.boolean().nullable(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});

// UserNotification schema
export const UserNotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  content: z.string().min(1),
  read: z.boolean().default(false),
  readAt: z.string().nullable(),
  messageId: z.string().uuid().nullable(),
  conversationId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  createdByUser: z.string().uuid(),
  updatedAt: z.string().optional(),
});

// Type exports
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectContextPrompt = z.infer<typeof ProjectContextPromptSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
export type MessageArtifact = z.infer<typeof MessageArtifactSchema>;
export type MessageFeedback = z.infer<typeof MessageFeedbackSchema>;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
