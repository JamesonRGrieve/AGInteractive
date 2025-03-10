import { z } from 'zod';

// Project schemas
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
});

export const ProjectContextPromptSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  prompt_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

// Conversation schemas
export const ConversationMetadataSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  project_id: z.string().uuid(),
});

// Message schemas
export const MessageSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  role: z.string().min(1), // Assuming RoleSchema is a string enum
  content: z.string().min(1),
  conversation_id: z.string().uuid(),
});

// Activity schemas
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  extension_id: z.string().uuid(),
});

// MessageActivity schemas
export const MessageActivitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  message_id: z.string().uuid(),
  chain_step_id: z.string().uuid(),
});

// Artifact schemas
export const ArtifactSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  name: z.string().min(1),
  relative_path: z.string().min(1),
  hosted_path: z.string().min(1),
  encrypted: z.boolean().default(false),
  project_id: z.string().uuid(),
  source_message_id: z.string().uuid(),
});

// MessageArtifact schemas
export const MessageArtifactSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  message_id: z.string().uuid(),
  artifact_id: z.string().uuid(),
});

// MessageFeedback schemas
export const MessageFeedbackSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  message_id: z.string().uuid(),
  content: z.string().min(1),
  positive: z.boolean().nullable(),
});

// UserNotification schemas
export const UserNotificationSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  created_by_user: z.string().uuid(),
  updated_at: z.string().optional(),
  updated_by_user: z.string().uuid().optional(),
  deleted_at: z.string().optional(),
  deleted_by_user: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  type: z.string().min(1),
  content: z.string().min(1),
  read: z.boolean().default(false),
  read_at: z.string().nullable(),
  message_id: z.string().uuid().nullable(),
  conversation_id: z.string().uuid().nullable(),
});

// Combined schemas for related models
export const ConversationSchema = z.object({
  metadata: ConversationMetadataSchema,
  messages: z.array(MessageSchema),
});

export const ProjectWithContextPromptsSchema = z.object({
  project: ProjectSchema,
  contextPrompts: z.array(ProjectContextPromptSchema),
});

export const ConversationEdgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  hasNotifications: z.boolean(),
  attachmentCount: z.number().int().nonnegative(),
  summary: z.unknown(),
});

// Type exports
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectContextPrompt = z.infer<typeof ProjectContextPromptSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationMetadata = z.infer<typeof ConversationMetadataSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type MessageActivity = z.infer<typeof MessageActivitySchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
export type MessageArtifact = z.infer<typeof MessageArtifactSchema>;
export type MessageFeedback = z.infer<typeof MessageFeedbackSchema>;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
export type ConversationEdge = z.infer<typeof ConversationEdgeSchema>;
