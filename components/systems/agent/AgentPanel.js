import { useState, useEffect } from "react";
import { Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import AgentAdmin from "./tabs/AgentAdmin";
import AgentConfigure from "./tabs/AgentConfigure";
import AgentPrompt from "./tabs/AgentPrompt";
import { useTheme } from "@mui/material/styles";
import { sdk } from "../../../lib/apiClient";
import useSWR from "swr";

export default function AgentPanel({
  data,
  chains,
  selectedChain,
  setSelectedChain,
  chainArgs,
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
  setUseSelectedAgent,
}) {
  const router = useRouter();
  const [tab, setTab] = useState(router.query.tab || 0);

  useEffect(() => {
    // Push the current tab to the router query
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab },
      },
      undefined,
      { shallow: true }
    );
  }, [tab]);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const theme = useTheme();

  const tabs = [
    <AgentPrompt
      key="chat"
      mode="Chat"
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      chains={chains}
      chainArgs={chainArgs}
      contextResults={contextResults}
      shots={shots}
      browseLinks={browseLinks}
      websearch={websearch}
      websearchDepth={websearchDepth}
      enableMemory={enableMemory}
      injectMemoriesFromCollectionNumber={injectMemoriesFromCollectionNumber}
      conversationResults={conversationResults}
    />,
    <AgentPrompt
      key="prompt"
      mode="Prompt"
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      chains={chains}
      chainArgs={chainArgs}
      contextResults={contextResults}
      shots={shots}
      browseLinks={browseLinks}
      websearch={websearch}
      websearchDepth={websearchDepth}
      enableMemory={enableMemory}
      injectMemoriesFromCollectionNumber={injectMemoriesFromCollectionNumber}
      conversationResults={conversationResults}
    />,
    <AgentPrompt
      key="instruct"
      mode="instruct"
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      chains={chains}
      chainArgs={chainArgs}
      contextResults={contextResults}
      shots={shots}
      browseLinks={browseLinks}
      websearch={websearch}
      websearchDepth={websearchDepth}
      enableMemory={enableMemory}
      injectMemoriesFromCollectionNumber={injectMemoriesFromCollectionNumber}
      conversationResults={conversationResults}
    />,
    <AgentPrompt
      key="chainExecution"
      mode="Chain"
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      chains={chains}
      chainArgs={chainArgs}
      contextResults={contextResults}
      shots={shots}
      browseLinks={browseLinks}
      websearch={websearch}
      websearchDepth={websearchDepth}
      enableMemory={enableMemory}
      injectMemoriesFromCollectionNumber={injectMemoriesFromCollectionNumber}
      conversationResults={conversationResults}
      singleStep={singleStep}
      fromStep={fromStep}
      allResponses={allResponses}
      useSelectedAgent={useSelectedAgent}
      setUseSelectedAgent={setUseSelectedAgent}
    />,
  ];

  return (
    <>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        TabIndicatorProps={{
          style: { background: theme.palette.mode == "dark" ? "#FFF" : "#000" },
        }}
        sx={{ mb: "0.5rem" }}
        textColor={theme.palette.mode == "dark" ? "white" : "black"}
      >
        <Tab label="Chat Mode" selected={tab == 0} />
        <Tab label="Prompt Mode" selected={tab == 1} />
        <Tab label="Instruct Mode" selected={tab == 2} />
        <Tab label="Chain Execution" selected={tab == 3} />
      </Tabs>
      {tabs[tab]}
    </>
  );
}
