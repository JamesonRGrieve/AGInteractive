'use client';

import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTimeDifference } from '@/interactive/Chat/Activity';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { cn } from '@/lib/utils';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';
import type { z } from 'zod';
import { useConversations } from '../hooks/useConversation';
import { ConversationSchema } from '../hooks/z';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

type Conversation = z.infer<typeof ConversationSchema> & {
  hasNotifications?: boolean;
  attachmentCount?: number;
};

type InteractiveConfig = {
  mutate?: (callback: (oldState: any) => any) => void;
  overrides?: Record<string, any>;
};

export function ChatHistory() {
  const state = useContext(InteractiveConfigContext) as InteractiveConfig;
  const { data: conversationData, isLoading } = useConversations() as {
    data: Conversation[] | undefined;
    isLoading: boolean;
  };

  const allConversations = conversationData || [];
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (conversationId: string) => pathname.includes('chat') && pathname.includes(conversationId);

  const handleOpenConversation = ({ conversationId }: { conversationId: string | number }) => {
    router.push(`/chat/${conversationId}`);

    state?.mutate?.((oldState) => ({
      ...oldState,
      overrides: { ...oldState.overrides, conversation: conversationId },
    }));
  };

  if (!conversationData || !conversationData.length || isLoading) return null;
  const groupedConversations = groupConversations(allConversations.filter((conversation) => conversation.name !== '-'));

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      {Object.entries(groupedConversations).map(([label, conversations]) => (
        <div key={label}>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarMenu className='ml-1'>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      side='left'
                      onClick={() => handleOpenConversation({ conversationId: conversation.id })}
                      className={cn(
                        'flex items-center justify-between w-full transition-colors',
                        isActive(conversation.id) && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                      )}
                    >
                      <span className='truncate'>{conversation.name}</span>
                      {conversation.hasNotifications && (
                        <Badge
                          variant='default'
                          className={cn(
                            'ml-2',
                            isActive(conversation.id)
                              ? 'bg-sidebar-accent-foreground/10 text-sidebar-accent-foreground'
                              : 'bg-primary/10 text-primary',
                          )}
                        >
                          New
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <div>{conversation.name}</div>
                    {/* TODO: Modify helper to handle all cases seconds, minutes, hours, days, weeks, months */}
                    {label === 'Today' ? (
                      <div>
                        Updated: {getTimeDifference(dayjs().format('YYYY-MM-DDTHH:mm:ssZ'), conversation.updatedAt)} ago
                      </div>
                    ) : (
                      <div>Updated: {dayjs(conversation.updatedAt).format('MMM DD YYYY')}</div>
                    )}
                    {conversation.attachmentCount > 0 && <div>Attachments: {conversation.attachmentCount}</div>}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      ))}
      <SidebarMenu>
        <SidebarMenuItem>
          {allConversations && allConversations?.length > 10 && (
            <ChatSearch {...{ conversationData: allConversations, handleOpenConversation }}>
              <SidebarMenuItem>
                <SidebarMenuButton className='text-sidebar-foreground/70' side='left'>
                  <DotsHorizontalIcon className='text-sidebar-foreground/70' />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ChatSearch>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ChatSearch({
  conversationData,
  handleOpenConversation,
  children,
}: {
  conversationData: Conversation[];
  handleOpenConversation: ({ conversationId }: { conversationId: string | number }) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='p-0 overflow-hidden shadow-lg'>
        <Command className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'>
          <CommandInput placeholder='Search Conversations...' />
          <CommandList>
            {conversationData.map((conversation) => (
              <CommandItem asChild key={conversation.id}>
                <DialogClose className='w-full' onClick={() => handleOpenConversation({ conversationId: conversation.id })}>
                  <span className='px-2'>{conversation.name}</span>
                </DialogClose>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function groupConversations(conversations: Conversation[]) {
  const groups = conversations.slice(0, 7).reduce<Record<string, Conversation[]>>(
    (groups, conversation) => {
      const date = dayjs(conversation.updatedAt);

      if (date.isToday()) {
        groups['Today'].push(conversation);
      } else if (date.isYesterday()) {
        groups['Yesterday'].push(conversation);
      } else if (date.isAfter(dayjs().subtract(7, 'day'))) {
        groups['Past Week'].push(conversation);
      } else {
        groups['Older'].push(conversation);
      }
      return groups;
    },
    { Today: [], Yesterday: [], 'Past Week': [], Older: [] },
  );

  return Object.fromEntries(Object.entries(groups).filter(([_, conversations]) => conversations.length > 0));
}
