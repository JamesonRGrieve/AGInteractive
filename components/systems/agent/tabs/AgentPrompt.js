import { useEffect, useState } from "react";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { sdk } from "../../../../lib/apiClient";
import ConversationSelector from "../../conversation/ConversationSelector";
import ConversationHistory from "../../conversation/ConversationHistory";
import PromptSelector from "../../prompt/PromptSelector";
import AdvancedOptions from "../AdvancedOptions";
import ChainSelector from "../../chain/ChainSelector";
import { Button, TextField } from "@mui/material";
import useSWR from "swr";
import { mutate } from "swr";

export default function AgentPrompt({
  chains,
  selectedChain,
  setSelectedChain,
  chainArgs,
  mode = "Prompt",
  contextResults = 5,
  shots = 1,
  browseLinks = false,
  websearch = false,
  websearchDepth = 0,
  enableMemory = false,
  injectMemoriesFromCollectionNumber = 0,
  conversationResults = 5,
  singleStep = false,
  fromStep = 0,
  allResponses = false,
  useSelectedAgent = true,
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationName, setConversationName] = useState("Test");
  const [lastResponse, setLastResponse] = useState("");
  const [promptCategory, setPromptCategory] = useState("Default");
  const [promptName, setPromptName] = useState("Chat");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const agentName = useMemo(() => router.query.agent, [router.query.agent]);
  const { data: conversations } = useSWR(
    "getConversations",
    async () => await sdk.getConversations()
  );

  const { data: conversation } = useSWR(
    `conversation/${agentName}/${conversationName}`,
    async () => await sdk.getConversation(agentName, conversationName, 100, 1)
  );
  const { data: promptCategories } = useSWR(
    `promptCategories/${agentName}`,
    async () => await sdk.getPromptCategories(agentName)
  );

  const { data: prompts } = useSWR(
    `prompts/${promptCategory}`,
    async () => await sdk.getPrompts(promptCategory)
  );
  const [promptArgs, setPromptArgs] = useState({});

  const { data: prompt } = useSWR(
    `prompt/${promptName}`,
    async () => await sdk.getPrompt(promptName, promptCategory)
  );
  useEffect(() => {
    mutate("getConversations");
    if (conversations) {
      setConversationName(conversationName);
    }
  }, [conversationName]);
  useEffect(() => {
    mutate(`conversation/${agentName}/${conversationName}`);
    if (
      conversation != "Unable to retrieve data." &&
      conversation != undefined
    ) {
      setChatHistory(conversation);
    }
  }, [conversationName, conversation, lastResponse]);
  useEffect(() => {
    mutate(`promptCategories/${agentName}`);
    if (promptCategories) {
      setPromptCategory(promptCategory);
    }
  }, [promptCategory]);
  useEffect(() => {
    mutate(`prompts/${promptCategory}`);
    if (prompts) {
      setPromptName(promptName);
    }
    mutate(`prompt/${promptName}`);
  }, [promptName]);
  useEffect(() => {
    const getArgs = async (promptName, promptCategory) => {
      const promptArgData = await sdk.getPromptArgs(promptName, promptCategory);
      if (promptArgData) {
        let newArgs = {};
        for (const arg of promptArgData) {
          if (arg !== "") {
            newArgs[arg] = "";
          }
        }
        setPromptArgs(newArgs);
      }
    };
    getArgs(promptName, promptCategory);
  }, [promptName]);
  const runChain = async () => {
    setIsLoading(true);
    const agentOverride = useSelectedAgent ? agentName : "";
    chainArgs["conversation_name"] = conversationName;
    if (singleStep) {
      const response = await sdk.runChainStep(
        selectedChain,
        fromStep,
        message,
        agentOverride
      );
      setIsLoading(false);
      setLastResponse(response);
    } else {
      const response = await sdk.runChain(
        selectedChain,
        message,
        agentOverride,
        allResponses,
        fromStep,
        chainArgs
      );
      setIsLoading(false);
      setLastResponse(response);
    }
  };
  const PromptAgent = async (
    message,
    promptName = "Chat",
    promptCategory = "Default",
    contextResults = 5,
    shots = 1,
    browseLinks = false,
    websearch = false,
    websearchDepth = 0,
    enableMemory = false,
    injectMemoriesFromCollectionNumber = 0,
    conversationResults = 5
  ) => {
    setIsLoading(true);
    const promptArguments = {
      user_input: message,
      prompt_category: promptCategory,
      conversation_name: conversationName,
      context_results: contextResults,
      shots: shots,
      browse_links: browseLinks,
      websearch: websearch,
      websearch_depth: websearchDepth,
      enable_memory: enableMemory,
      inject_memories_from_collection_number:
        injectMemoriesFromCollectionNumber,
      conversation_results: conversationResults,
      ...promptArgs,
    };
    if (mode != "Prompt") {
      promptName = mode;
    }
    const response = await sdk.promptAgent(
      agentName,
      promptName,
      promptArguments
    );
    setIsLoading(false);
    setLastResponse(response);
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };
  const handleSendMessage = async () => {
    await PromptAgent(
      message,
      promptName,
      promptCategory,
      contextResults,
      shots,
      browseLinks,
      websearch,
      websearchDepth,
      enableMemory,
      injectMemoriesFromCollectionNumber,
      conversationResults
    );
    setMessage("");
  };
  return (
    <>
      <ConversationSelector
        conversations={conversations}
        conversationName={conversationName}
        setConversationName={setConversationName}
      />
      <ConversationHistory chatHistory={chatHistory} isLoading={isLoading} />
      {mode == "Prompt" ? (
        <>
          <br />
          <PromptSelector
            promptCategories={promptCategories}
            promptCategory={promptCategory}
            setPromptCategory={setPromptCategory}
            promptName={promptName}
            setPromptName={setPromptName}
            prompt={prompt}
            promptArgs={promptArgs}
            setPromptArgs={setPromptArgs}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ height: "56px" }}
            disabled={isLoading}
          >
            Send
          </Button>
        </>
      ) : mode == "Chain" ? (
        <>
          <ChainSelector
            chains={chains}
            sdk={sdk}
            selectedChain={selectedChain}
            setSelectedChain={setSelectedChain}
            disabled={isLoading}
          />
          <TextField
            label="User Input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2, width: "85%" }}
            disabled={isLoading}
          />
          <Button
            onClick={runChain}
            variant="contained"
            color="primary"
            sx={{ height: "56px", width: "15%" }}
            disabled={isLoading}
          >
            Execute Chain
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="User Input"
            placeholder="User input..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2, width: "90%" }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ height: "56px", width: "10%" }}
            disabled={isLoading}
          >
            Send
          </Button>
        </>
      )}
    </>
  );
}
