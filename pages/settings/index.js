import { useRouter } from "next/router";
import { useMemo } from "react";
import AgentConfigure from "../../components/systems/agent/tabs/AgentConfigure";
import { sdk } from "../../lib/apiClient";
import ContentSWR from "../../components/data/ContentSWR";
import useSWR from "swr";
export default function AgentSettings() {
  const router = useRouter();
  const agentName = useMemo(() => router.query.agent, [router.query.agent]);
  const agent = useSWR(
    agentName ? `agent/${agentName}` : null,
    async () => await sdk.getAgentConfig(agentName)
  );

  return <ContentSWR swr={agent} content={AgentConfigure} />;
}
