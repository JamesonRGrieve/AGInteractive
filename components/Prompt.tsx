import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import ConversationHistory from '../../node_modules/agixtchat/components/conversation/ConversationHistory';
import AudioRecorder from '../../node_modules/agixtchat/components/conversation/AudioRecorder';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import {
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import useSWR from 'swr';
import { mutate } from 'swr';
import { useSettings } from '../../../../lib/SettingsContext';
import PromptSelector from '../prompt/PromptSelector';
import ChainSelector from '../chain/ChainSelector';

export default function AgentPrompt({
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
  conversationName
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [promptCategory, setPromptCategory] = useState('Default');
  const [promptName, setPromptName] = useState('Chat');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const { conversation, promptCategories, prompts, hasFiles } = useSettings();
  const router = useRouter();
  const tab = router.query.tab;
  const agentName = useMemo(() => router.query.agent, [router.query.agent]);
  const [promptArgs, setPromptArgs] = useState({});

  const { data: prompt } = useSWR(`prompt/${promptName}`, async () => await sdk.getPrompt(promptName, promptCategory));

  const handleCloseFileUpload = () => {
    setOpenFileUpload(false);
  };
  const handleUploadFiles = async () => {
    let newUploadedFiles = [];
    // Format for uploadedFiles should be [{"file_name": "file_content"}]
    // Iterate through the files and add them to the form data
    for (const file of uploadedFiles) {
      const fileContent = await file.text();
      newUploadedFiles.push({ [file.name]: fileContent });
    }
    setUploadedFiles(newUploadedFiles);
    setOpenFileUpload(false);
  };

  useEffect(() => {
    mutate(`conversation/${agentName}/${conversationName}`);
    if (conversation != 'Unable to retrieve data.' && conversation != undefined) {
      setChatHistory(conversation);
    }
  }, [conversationName, conversation, lastResponse]);
  useEffect(() => {
    mutate(`promptCategories`);
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
          if (arg !== '') {
            newArgs[arg] = '';
          }
        }
        setPromptArgs(newArgs);
      }
    };
    getArgs(promptName, promptCategory);
  }, [promptName]);
  // Uploaded files will be formatted like [{"file_name": "file_content"}]

  const runChain = async () => {
    setIsLoading(true);
    const agentOverride = useSelectedAgent ? agentName : '';
    chainArgs['conversation_name'] = conversationName;
    if (singleStep) {
      const response = await sdk.runChainStep(selectedChain, fromStep, message, agentOverride, chainArgs);
      setIsLoading(false);
      setLastResponse(response);
    } else {
      const response = await sdk.runChain(selectedChain, message, agentOverride, allResponses, fromStep, chainArgs);
      setIsLoading(false);
      setLastResponse(response);
    }
  };
  const PromptAgent = async (
    message,
    promptName = 'Chat',
    promptCategory = 'Default',
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
    if (message) {
      promptArgs['user_input'] = message;
    }
    if (hasFiles && promptName == 'Chat') {
      promptName = 'Chat and Files';
    }
    if (uploadedFiles != []) {
      promptArgs['import_files'] = uploadedFiles;
    }
    const disableMemory = !enableMemory;
    const skipArgs = [
      'conversation_history',
      'context',
      'COMMANDS',
      'command_list',
      'date',
      'agent_name',
      'working_directory',
      'helper_agent_name',
      'prompt_name',
      'context_results',
      'conversation_results',
      'conversation_name',
      'prompt_category',
      'websearch',
      'websearch_depth',
      'enable_memory',
      'inject_memories_from_collection_number',
      'context_results',
      'persona',
      ''
    ];
    for (const arg of skipArgs) {
      delete promptArgs[arg];
    }
    const promptArguments = {
      prompt_category: promptCategory,
      conversation_name: conversationName,
      context_results: contextResults,
      shots: shots,
      browse_links: browseLinks,
      websearch: websearch,
      websearch_depth: websearchDepth,
      disable_memory: disableMemory,
      inject_memories_from_collection_number: injectMemoriesFromCollectionNumber,
      conversation_results: conversationResults,
      ...promptArgs
    };
    if (tab == 0) {
      promptName = 'Chat';
    } else if (tab == 3) {
      promptName = 'Instruction';
    } else if (tab == 1) {
      promptName = promptName;
    } else if (tab == 2) {
      promptName = selectedChain;
    }
    const response = await sdk.promptAgent(agentName, promptName, promptArguments);
    setIsLoading(false);
    setLastResponse(response);
    setUploadedFiles([]);
    const fetchConversation = async () => {
      const conversation = await sdk.getConversation(agentName, conversationName);
      setChatHistory(conversation);
    };
    fetchConversation();
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey && message) {
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
    setMessage('');
  };
  return (
    <>
      <ConversationHistory chatHistory={chatHistory} isLoading={isLoading} />
      {tab == 1 ? (
        <>
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
          <Button variant='contained' color='info' onClick={handleSendMessage} disabled={isLoading} sx={{ height: '56px' }}>
            Send
          </Button>
        </>
      ) : tab == 2 ? (
        <>
          <ChainSelector
            chains={chains}
            sdk={sdk}
            selectedChain={selectedChain}
            setSelectedChain={setSelectedChain}
            disabled={isLoading}
          />
          <TextField
            label='User Input'
            placeholder='User input...'
            multiline
            rows={2}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    color='info'
                    variant='contained'
                    onClick={runChain}
                    disabled={isLoading}
                    sx={{ height: '56px', padding: '0px' }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </>
      ) : (
        <>
          <TextField
            label='User Input'
            placeholder='User input...'
            multiline
            rows={2}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {tab == 0 && (
                    <>
                      <IconButton
                        variant='contained'
                        color='info'
                        onClick={() => {
                          setUploadedFiles([]);
                          setOpenFileUpload(true);
                        }}
                        disabled={isLoading}
                        sx={{ height: '56px' }}
                      >
                        <NoteAddOutlinedIcon />
                      </IconButton>
                      <Dialog open={openFileUpload} onClose={handleCloseFileUpload}>
                        <DialogTitle id='form-dialog-title'>Upload Files</DialogTitle>
                        <DialogContent>
                          <DialogContentText>Please upload the files you would like to send.</DialogContentText>
                          <input
                            accept='*'
                            id='contained-button-file'
                            multiple
                            type='file'
                            onChange={(e) => {
                              setUploadedFiles(e.target.files);
                            }}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseFileUpload} color='error'>
                            Cancel
                          </Button>
                          <Button onClick={handleUploadFiles} color='info' disabled={isLoading}>
                            Upload
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  )}
                  <IconButton
                    variant='contained'
                    color='info'
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    sx={{ height: '56px', padding: '0px' }}
                  >
                    <SendIcon />
                  </IconButton>
                  <AudioRecorder
                    conversationName={conversationName}
                    contextResults={contextResults}
                    conversationResults={conversationResults}
                  />
                </InputAdornment>
              )
            }}
          />
        </>
      )}
    </>
  );
}
