import { sdk } from "../../lib/apiClient";
import axios from "axios";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import { Container } from "@mui/material";
import ContentSWR from "../../components/data/ContentSWR";
import PopoutDrawerWrapper from "../../components/menu/PopoutDrawerWrapper";
import AgentList from "../../components/systems/agent/AgentList";
export default function Home() {
  const docs = useSWR(
    "docs/agent",
    async () =>
      (
        await axios.get(
          "https://raw.githubusercontent.com/Josh-XT/AGiXT/main/docs/2-Concepts/8-Agent%20Training.md"
        )
      ).data
  );
  const agents = useSWR("agent", async () => await sdk.getAgents());

  return (
    <PopoutDrawerWrapper
      title={"Agent Training"}
      leftHeading={"Agents"}
      leftSWR={agents}
      leftMenu={AgentList}
      rightHeading={null}
      rightSWR={null}
      rightMenu={null}
    >
      <Container>
        <ContentSWR
          swr={docs}
          content={({ data }) => <ReactMarkdown>{data}</ReactMarkdown>}
        />
      </Container>
    </PopoutDrawerWrapper>
  );
}
