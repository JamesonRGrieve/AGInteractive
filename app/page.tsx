'use client';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import AGiXTChat from '../components/AGiXTChat';
import React from 'react';
import Auth from '../components/Auth';
export default function Home() {
  const [userKey, setUserKey] = useState("");
  const [username, setUsername] = useState("");
  useEffect(() => {
    // Login
    if (userKey) {
      const loggedInC = getCookie("loggedIn");
      if (loggedInC) {
        setLoggedIn(true);
      }
      const userApiKey = getCookie("apiKey");
      if (userApiKey) {
        setUserKey(userApiKey);
      }
    }
  }, [userKey]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [conversationName, setConversationName] = useState(getCookie("conversationName")|| process.env.NEXT_PUBLIC_AGIXT_CONVERSATION_NAME);
  return (!loggedIn ? <Auth username={username} userKey={userKey} setLoggedIn={setLoggedIn} /> :
    
<AGiXTChat
      baseUri={process.env.NEXT_PUBLIC_AGIXT_SERVER} // Base URI to the AGiXT server
      agentName={process.env.NEXT_PUBLIC_AGIXT_AGENT} // Agent name
      insightAgent={process.env.NEXT_PUBLIC_AGIXT_INSIGHT_AGENT} // Insight agent name to use a different agent for insights, leave blank to use the same agent
      conversationName={process.env.NEXT_PUBLIC_AGIXT_CONVERSATION_NAME} // Conversation name
      setConversationName={setConversationName} // Function to set the conversation name
      // UI Options
      showConversationBar={process.env.NEXT_PUBLIC_AGIXT_SHOW_CONVERSATION_BAR==="true"} // Show the conversation selection bar to create, delete, and export conversations
      enableFileUpload={process.env.NEXT_PUBLIC_AGIXT_FILE_UPLOAD_ENABLED==="true"} // Enable file upload button, disabled by default.
      // Modes are prompt or chain
      mode={process.env.NEXT_PUBLIC_AGIXT_MODE}
      // prompt mode - Set promptName and promptCategory
      promptName={process.env.NEXT_PUBLIC_AGIXT_PROMPT_NAME} // Name of the prompt to use
      promptCategory={process.env.NEXT_PUBLIC_AGIXT_PROMPT_CATEGORY} // Category of the prompt to use
      // chain mode - Set chain name and chain args
      selectedChain={process.env.NEXT_PUBLIC_AGIXT_CHAIN} // Chain name
      chainArgs={JSON.parse(process.env.NEXT_PUBLIC_AGIXT_CHAIN_ARGS??"{}")} // Chain arg overrides, unnecessary if you don't need to override any args.
      useSelectedAgent={process.env.NEXT_PUBLIC_AGIXT_USE_SELECTED_AGENT==="true"} // Will force the selected agent to run all chain steps rather than the agents defined in the chain
    />
  );
}
