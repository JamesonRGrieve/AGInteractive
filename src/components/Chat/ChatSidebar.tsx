'use client';

import { SidebarContent } from '@/appwrapper/SidebarContentManager';
import { Input } from '@/components/ui/input';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { Badge, Check, Download, Paperclip, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useConversation, useConversations } from '../../hooks/useConversation';
import { useUser } from '@/components/auth/src/hooks/useUser';
import axios from 'axios';
import { getCookie } from 'cookies-next';

const conversationSWRPath = '/conversation/';
export function ChatSidebar({ conversationID }: { conversationID: string }): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const state = useContext(InteractiveConfigContext);
  const { data: user } = useUser();
  const { data: currentConversation, mutate:updateConvo } = useConversation(conversationID,user?.id);
  const {mutate:mutateConversations} = useConversations(user?.id);
  const router = useRouter();
  const [newName, setNewName] = useState(currentConversation?.name || '');

  const handleDeleteConversation = async (): Promise<void> => {
    await deleteConversation(currentConversation?.id || '-');
    await mutate();
    state.mutate((oldState) => ({
      ...oldState,
      overrides: { ...oldState.overrides, conversation: '-' },
    }));
    router.push('/chat');
  };

  const handleExportConversation = async (): Promise<void> => {
    // Get the full conversation content
    //const conversationContent = await state.sdk.getConversation('', currentConversation?.id || '-');
    const conversationContent = await getConversation(currentConversation?.id || '-');
    // Format the conversation for export
    const exportData = {
      name: currentConversation?.name || 'New',
      id: currentConversation?.id || '-',
      createdAt: currentConversation?.createdAt || new Date().toISOString(),
      messages: conversationContent.filter((msg)=>msg.conversation_id === currentConversation?.id).map((msg) => ({
        role: msg?.role || '',
        content: msg.content,
        createdAt: msg.created_at,
      })),
    };

    // Create and trigger download
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${currentConversation?.name || 'New'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  useEffect(() => {
    mutate(conversationSWRPath + state.overrides.conversation);
  }, [state.overrides.conversation]);
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        mutate(conversationSWRPath + state.overrides.conversation);
      }, 1000);
    }
  }, [loading, state.overrides.conversation]);

  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (renaming) {
      setNewName(currentConversation?.name || '');
    }
  }, [renaming, currentConversation]);
  console.log('rename',newName)
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <SidebarContent title='Conversation Management'>
      <SidebarGroup>
        {
          <div className='w-full group-data-[collapsible=icon]:hidden'>
            {renaming ? (
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
            ) : (
              <h4>{currentConversation?.name}</h4>
            )}
            {currentConversation && currentConversation.attachment_count > 0 && (
              <Badge className='gap-1'>
                <Paperclip className='w-3 h-3' />
                {currentConversation.attachment_count}
              </Badge>
            )}
          </div>
        }
        <SidebarGroupLabel>Conversation Functions</SidebarGroupLabel>
        <SidebarMenu>
          {[
            {
              title: 'New Conversation',
              icon: Plus,
              func: () => {
                router.push('/chat');
              },
              disabled: renaming,
            },
            {
              title: renaming ? 'Save Name' : 'Rename Conversation',
              icon: renaming ? Check : Pencil,
              func: renaming
                ? () => {
                    //state.sdk.renameConversation(state.agent, currentConversation.id, newName);
                    renameConversation(currentConversation.id, newName);
                    setRenaming(false);
                    updateConvo();
                    mutateConversations();
                    mutate('v1/conversation');
                    mutate('/conversation');
                  }
                : () => setRenaming(true),
              disabled:conversationID ? false : true,
            },
            {
              title: 'Import Conversation',
              icon: Upload,
              func: () => {
                // setImportMode(true);
                // setIsDialogOpen(true);
              },
              disabled: true,
            },
            {
              title: 'Export Conversation',
              icon: Download,
              func: () => handleExportConversation(),
              disabled: !renaming && conversationID ? false : true,
            },
            {
              title: 'Delete Conversation',
              icon: Trash2,
              func: () => {
                handleDeleteConversation();
              },
              disabled: !renaming && conversationID ? false : true,
            },
          ].map(
            (item) =>
              item.visible !== false && (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton side='left' tooltip={item.title} onClick={item.func} disabled={item.disabled}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
          )}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}

export async function deleteConversation(conversationId: string) {
  const jwt = getCookie('jwt');
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation/${conversationId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data;
}

export async function renameConversation(conversationId: string, newName: string) {
  const jwt = getCookie('jwt');
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation/${conversationId}`,
    {
      conversation: {
        name: newName,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data;
}

export async function getConversation(conversationId: string) {
  if(!conversationId) return [];
  const jwt = getCookie('jwt');
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URI}/v1/message`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data.messages;
}