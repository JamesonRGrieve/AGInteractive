'use client';

import { SidebarContent } from '@/appwrapper/SidebarContentManager';
import { Input } from '@/components/ui/input';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { Badge, Check, Download, Paperclip, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useConversation } from '../hooks/useConversation';

const conversationSWRPath = '/conversation/';
export function ChatSidebar({ conversationID }: { conversationID: string }): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const state = useContext(InteractiveConfigContext);
  const { data: currentConversation } = useConversation(conversationID);
  const handleDeleteConversation = async (): Promise<void> => {
    await state.sdk.deleteConversation(currentConversation?.id || '-');
    await mutate();
    state.mutate((oldState) => ({
      ...oldState,
      overrides: { ...oldState.overrides, conversation: '-' },
    }));
  };

  const handleExportConversation = async (): Promise<void> => {
    // Get the full conversation content
    const conversationContent = await state.sdk.getConversation('', currentConversation?.id || '-');

    // Format the conversation for export
    const exportData = {
      name: currentConversation?.name || 'New',
      id: currentConversation?.id || '-',
      createdAt: currentConversation?.createdAt || new Date().toISOString(),
      messages: conversationContent.map((msg) => ({
        role: msg.role,
        content: msg.message,
        createdAt: msg.createdAt,
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

  const [newName, setNewName] = useState('');
  const router = useRouter();

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
                    state.sdk.renameConversation(state.agent, currentConversation.id, newName);
                    setRenaming(false);
                  }
                : () => setRenaming(true),
              disabled: false,
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
              disabled: renaming,
            },
            {
              title: 'Delete Conversation',
              icon: Trash2,
              func: () => {
                console.log('DELETE');
                handleDeleteConversation();
              },
              disabled: renaming,
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
