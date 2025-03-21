'use client';

import { SidebarContent } from '@/appwrapper/SidebarContentManager';
import { useTeam } from '@/auth/hooks/useTeam';
import { Input } from '@/components/ui/input';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { toast } from '@/hooks/useToast';
import { InteractiveConfigContext, Overrides } from '@/interactive/InteractiveConfigContext';
import log from '@/next-log/log';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { Badge, Check, Download, Paperclip, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { UIProps } from '../AGInteractive';
import { useConversation, useConversations } from '../hooks/useConversation';
import ChatBar from './ChatInput';
import ChatLog from './ChatLog';
import { ChatSidebar } from './ChatSidebar';

const conversationSWRPath = '/conversation/';
export default function Chat({
  showChatThemeToggles,
  alternateBackground,
  enableFileUpload,
  enableVoiceInput,
  showOverrideSwitchesCSV,
}: Overrides & UIProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const state = useContext(InteractiveConfigContext);
  const { data: conversations, isLoading: isLoadingConversations, mutate: mutateConversations } = useConversations();
  const { data: rawConversation } = useConversation(state.overrides.conversation);
  const [conversation, setConversation] = useState([]);
  useEffect(() => {
    if (rawConversation) {
      setConversation(getAndFormatConversastion(rawConversation));
    } else {
      setConversation([]);
    }
  }, [rawConversation]);
  const currentConversation = conversations?.find((conv) => conv.id === state.overrides.conversation);

  const { data: activeTeam } = useTeam();
  console.log('CONVERSATION DATA: ', conversation);
  useEffect(() => {
    if (Array.isArray(state.overrides.conversation)) {
      state.mutate((oldState) => ({
        ...oldState,
        overrides: { ...oldState.overrides, conversation: oldState.overrides.conversation[0] },
      }));
    }
  }, [state.overrides.conversation]);
  async function chat(messageTextBody, messageAttachedFiles): Promise<string> {
    let conversationId;
    const messages = [];
    if (state.overrides.conversation === '-' || state.overrides.conversation === null) {
      // 1. Create a new blank conversation
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation`,
        {
          conversation: {
            name: 'New Conversation',
            description: 'A new conversation is born...',
          },
        },
        {
          headers: {
            Authorization: getCookie('jwt'),
          },
        },
      );

      // 2. Get the conversation ID from the response
      conversationId = response.data.conversation.id;

      if (!conversationId) {
        throw new Error('Failed to create new conversation');
      }
      mutateConversations();
      // 3. Update the state with the new conversation ID and redirect
      state.mutate((oldState) => ({
        ...oldState,
        overrides: { ...oldState.overrides, conversation: conversationId },
      }));
      router.push(`/chat/${conversationId}`);
    }

    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: messageTextBody },
        ...Object.entries(messageAttachedFiles).map(([fileName, fileContent]: [string, string]) => ({
          type: `${fileContent.split(':')[1].split('/')[0]}_url`,
          file_name: fileName,
          [`${fileContent.split(':')[1].split('/')[0]}_url`]: {
            url: fileContent,
          },
        })), // Spread operator to include all file contents
      ],
      ...(activeTeam?.id ? { company_id: activeTeam?.id } : {}),
      ...(getCookie('aginteractive-create-image') ? { create_image: getCookie('aginteractive-create-image') } : {}),
      ...(getCookie('aginteractive-tts') ? { tts: getCookie('aginteractive-tts') } : {}),
      ...(getCookie('aginteractive-websearch') ? { websearch: getCookie('aginteractive-websearch') } : {}),
      ...(getCookie('aginteractive-analyze-user-input')
        ? { analyze_user_input: getCookie('aginteractive-analyze-user-input') }
        : {}),
    });

    const toOpenAI = {
      messages: messages,
      model: getCookie('aginteractive-agent'),
      user: conversationId,
    };
    setLoading(true);
    log(['Sending: ', state.openai, toOpenAI], { client: 1 });
    // const req = state.openai.chat.completions.create(toOpenAI);
    await new Promise((resolve) => setTimeout(resolve, 100));
    mutate(conversationSWRPath + conversationId);
    try {
      const completionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/chat/completions`,
        {
          ...toOpenAI,
        },
        {
          headers: {
            Authorization: getCookie('jwt'),
          },
        },
      );
      if (completionResponse.status === 200) {
        const chatCompletion = completionResponse.data;
        log(['RESPONSE: ', chatCompletion], { client: 1 });
        // let response;
        // if (state.overrides.conversation === '-') {
        //   response = await state.sdk.renameConversation(state.agent, state.overrides.conversation);
        //   // response = await axios.put(
        //   //   `${process.env.NEXT_PUBLIC_API_URI}/api/conversation`,
        //   //   {
        //   //     agent_name: state.agent,
        //   //     conversation_name: state.overrides?.conversation,
        //   //     new_name: '-',
        //   //   },
        //   //   {
        //   //     headers: {
        //   //       Authorization: getCookie('jwt'),
        //   //     },
        //   //   },
        //   // );
        //   await mutate('/conversation');
        //   log([response], { client: 1 });
        // }        mutate(conversationSWRPath + response);
        setLoading(false);

        mutate('/user');

        if (chatCompletion?.choices[0]?.message.content.length > 0) {
          return chatCompletion.choices[0].message.content;
        } else {
          throw '1 Failed to get response from the agent';
        }
      } else {
        throw '2 Failed to get response from the agent';
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Error: ' + error,
        duration: 5000,
      });
    }
  }

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

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <>
      <ChatSidebar currentConversation={currentConversation} />
      <ChatLog
        conversation={conversation}
        alternateBackground={alternateBackground}
        setLoading={setLoading}
        loading={loading}
      />
      <ChatBar
        onSend={chat}
        disabled={loading}
        showChatThemeToggles={showChatThemeToggles}
        enableFileUpload={enableFileUpload}
        enableVoiceInput={enableVoiceInput}
        loading={loading}
        setLoading={setLoading}
        showOverrideSwitchesCSV={showOverrideSwitchesCSV}
        showResetConversation={
          process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_CONVERSATION_BAR !== 'true' &&
          process.env.NEXT_PUBLIC_AGINTERACTIVE_CONVERSATION_MODE === 'uuid'
        }
      />
    </>
  );
}

export function getAndFormatConversastion(rawConversation): any[] {
  log(['Raw conversation: ', rawConversation], { client: 3 });
  return rawConversation.messages.reduce((accumulator, currentMessage: { id: string; content: string }) => {
    try {
      log(['Processing message: ', currentMessage], { client: 3 });
      const messageType = currentMessage.content.split(' ')[0];
      if (messageType.startsWith('[SUBACTIVITY]')) {
        let target;
        const parent = messageType.split('[')[2].split(']')[0];

        const parentIndex = accumulator.findIndex((message) => {
          return message.id === parent || message.children.some((child) => child.id === parent);
        });
        if (parentIndex !== -1) {
          if (accumulator[parentIndex].id === parent) {
            target = accumulator[parentIndex];
          } else {
            target = accumulator[parentIndex].children.find((child) => child.id === parent);
          }
          target.children.push({ ...currentMessage, children: [] });
        } else {
          throw new Error(
            `Parent message not found for subactivity ${currentMessage.id} - ${currentMessage.content}, parent ID: ${parent}`,
          );
        }
      } else {
        accumulator.push({ ...currentMessage, children: [] });
      }
      return accumulator;
    } catch (e) {
      console.error(e);
      return accumulator;
    }
  }, []);
}
