'use client';

import log from '@/next-log/log';
import React, { useEffect, useRef } from 'react';
import { useConversation } from '../hooks/useConversation';
import { ActivityBar as ChatActivity } from './Activity';
import Message from './Message/Message';

export default function ChatLog({
  conversationID,
  alternateBackground,
}: {
  conversationID: string;
  alternateBackground?: string;
}): React.JSX.Element {
  const messagesEndRef = useRef(null);
  const { data: conversation } = useConversation(conversationID);
  console.log('SELECTED CONVERSATION', conversation);
  useEffect(() => {
    log(['Conversation mutated, scrolling to bottom.', conversation], { client: 3 });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className='flex flex-col-reverse flex-grow overflow-y-auto bg-background pb-28' style={{ flexBasis: '0px' }}>
      <div className='flex flex-col h-min max-w-100vw'>
        {conversation.messages.length > 0 ? (
          conversation.messages.map((message, index: number) => {
            return (
              <>
                <Message {...message} />
                {message.activities
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .filter((x) => x.parentId == null)
                  .map((activity) => (
                    <ChatActivity
                      key={activity.id}
                      {...activity}
                      alternateBackground={alternateBackground}
                      children={message.activities.filter((x) => x.parentId == activity.id)}
                    />
                  ))}
              </>
            );
          })
        ) : (
          <div className='max-w-4xl px-2 mx-auto space-y-2 text-center'>
            <div>
              <h1 className='text-4xl md:text-6xl'>
                Welcome {process.env.NEXT_PUBLIC_APP_NAME && `to ${process.env.NEXT_PUBLIC_APP_NAME}`}
              </h1>
              {process.env.NEXT_PUBLIC_APP_DESCRIPTION && (
                <p className='text-sm'>{process.env.NEXT_PUBLIC_APP_DESCRIPTION}</p>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>
              {process.env.NEXT_PUBLIC_APP_NAME || 'This software'} may provide inaccurate or inappropriate responses, may
              break character and comes with no warranty of any kind. By using this software you agree to hold harmless the
              developers of {process.env.NEXT_PUBLIC_APP_NAME || 'this software'} for any damages caused by the use of this
              software.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
