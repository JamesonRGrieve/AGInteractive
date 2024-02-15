'use client';
import React, { useContext, useState } from 'react';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { setCookie } from 'cookies-next';
import { DeleteForever } from '@mui/icons-material';
import SwitchDark from 'jrgcomponents/theming/SwitchDark';
import SwitchColorblind from 'jrgcomponents/theming/SwitchColorblind';
import Link from 'next/link';
import { mutate } from 'swr';
import { ChatContext } from '../../../types/ChatContext';
import AudioRecorder from './AudioRecorder';

export default function ConversationBar({
  mode,
  latestMessage,
  setLatestMessage,
}: {
  mode: 'prompt' | 'chain' | 'command';
  latestMessage: string;
  setLatestMessage: any;
}) {
  const state = useContext(ChatContext);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [alternativeInputActive, setAlternativeInputActive] = useState(false);
  const [message, setMessage] = useState('');
  const handleUploadFiles = async () => {
    // Uploaded files will be formatted like [{"file_name": "file_content"}]
    const newuploadedFiles: { [x: string]: string }[] = [];
    // Format for state.uploadedFiles should be [{"file_name": "file_content"}]
    // Iterate through the files and add them to the form data
    for (const file of uploadedFiles) {
      const fileContent = await file.text();
      newuploadedFiles.push({ [file.name]: fileContent });
      state.mutate((oldState) => ({ ...oldState, chatState: { ...oldState.chatState, uploadedFiles: newuploadedFiles } }));
      setFileUploadOpen(false);
    }
  };
  const handleSendMessage = async () => {
    setLatestMessage(message);
    const request = mode === 'chain' ? runChain() : mode === 'command' ? runCommand() : runPrompt();
    setMessage('');
    await request;
    setUploadedFiles([]);
    setLatestMessage('');
    mutate('/conversation/' + state.chatSettings.conversationName);
  };
  const runChain = async () => {
    return await state.sdk.runChain(
      state.chain,
      message,
      state.chatSettings.useSelectedAgent ? state.chatSettings.selectedAgent : '',
      false,
      0,
      { ...state.chatSettings.chainRunConfig.chainArgs, conversation_name: state.chatSettings.conversationName },
    );
  };
  const runCommand = async () => {
    const args = { ...state.commandArgs, [state.commandMessageArg]: message };
    console.log('Command Args:', args);
    return await state.sdk.executeCommand(
      state.chatSettings.selectedAgent,
      state.command,
      args,
      state.chatSettings.conversationName,
    );
  };
  const runPrompt = async () => {
    console.log('Prompt Category and Prompt: ', state.promptCategory, state.prompt);
    const args: any = state.sdk.getPromptArgs(state.prompt, state.promptCategory);
    if (message) {
      args.user_input = message;
    }
    if (uploadedFiles.length > 0) {
      args.import_files = uploadedFiles;
    }
    const promptName =
      state.prompt + (state.prompt == 'Chat with Commands' && uploadedFiles.length > 0 ? ' with Files' : '');
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
      '',
    ];
    for (const arg of skipArgs) {
      delete args[arg];
    }
    const stateArgs = {
      prompt_category: state.promptCategory,
      conversation_name: state.chatSettings.conversationName,
      context_results: state.chatSettings.contextResults,
      shots: state.chatSettings.shots,
      browse_links: state.chatSettings.browseLinks,
      websearch: state.chatSettings.webSearch,
      websearch_depth: state.chatSettings.websearchDepth,
      disable_memory: !state.chatSettings.enableMemory,
      inject_memories_from_collection_number: state.chatSettings.injectMemoriesFromCollectionNumber,
      conversation_results: state.chatSettings.conversationResults,
      ...args,
    };
    console.log('---Sending Message---\nState args:\n', stateArgs, '\nState:\n', state, '\nPrompt name:\n', promptName);
    return await state.sdk.promptAgent(state.chatSettings.selectedAgent, promptName, stateArgs);
  };
  return (
    <>
      <Box px='1rem' display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
        <TextField
          label={`Enter your message to ${state.chatSettings.selectedAgent} here.`}
          placeholder={`Hello, ${state.chatSettings.selectedAgent}!`}
          multiline
          rows={2}
          fullWidth
          value={message}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && message) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ my: 2 }}
          disabled={Boolean(latestMessage)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                {state.chatSettings.enableFileUpload && (
                  <>
                    <IconButton
                      color='info'
                      onClick={() => {
                        setFileUploadOpen(true);
                        state.mutate((oldState) => ({
                          ...oldState,
                          chatState: { ...oldState.chatState, uploadedFiles: [] },
                        }));
                      }}
                      disabled={Boolean(latestMessage)}
                      sx={{ height: '56px' }}
                    >
                      <NoteAddOutlinedIcon />
                    </IconButton>
                    <Dialog
                      open={fileUploadOpen}
                      onClose={() => {
                        setFileUploadOpen(false);
                      }}
                    >
                      <DialogTitle id='form-dialog-title'>Upload Files</DialogTitle>
                      <DialogContent>
                        <DialogContentText>Please upload the files you would like to send.</DialogContentText>
                        <input
                          accept='*'
                          id='contained-button-file'
                          multiple
                          type='file'
                          onChange={(e) => {
                            state.mutate((oldState) => ({
                              ...oldState,
                              chatState: { ...oldState.chatState, uploadedFiles: Array(e.target.files) },
                            }));
                          }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => {
                            setFileUploadOpen(false);
                          }}
                          color='error'
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUploadFiles} color='info' disabled={Boolean(latestMessage)}>
                          Upload
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
                {!alternativeInputActive && (
                  <Tooltip title='Send Message'>
                    <IconButton
                      color='info'
                      onClick={handleSendMessage}
                      disabled={Boolean(latestMessage)}
                      sx={{ height: '56px', padding: '0.5rem' }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <AudioRecorder
                  recording={alternativeInputActive}
                  setRecording={setAlternativeInputActive}
                  disabled={Boolean(latestMessage)}
                />
              </InputAdornment>
            ),
          }}
        />
        {process.env.NEXT_PUBLIC_AGIXT_SHOW_CONVERSATION_BAR !== 'true' && (
          <Tooltip title='Reset Conversation (Forever)'>
            <IconButton
              color='info'
              onClick={() => {
                if (process.env.NEXT_PUBLIC_AGIXT_CONVERSATION_MODE == 'uuid') {
                  if (confirm('Are you sure you want to reset the conversation? This cannot be undone.')) {
                    const uuid = crypto.randomUUID();
                    setCookie('uuid', uuid, { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN, maxAge: 2147483647 });
                    state.mutate((oldState) => ({
                      ...oldState,
                      chatConfig: { ...oldState.chatConfig, conversationName: uuid },
                    }));
                  }
                } else {
                  alert('This feature is not available in this mode.');
                }
              }}
              disabled={Boolean(latestMessage)}
              sx={{ height: '56px', padding: '1rem' }}
            >
              <DeleteForever />
            </IconButton>
          </Tooltip>
        )}
        {process.env.NEXT_PUBLIC_AGIXT_SHOW_CHAT_THEME_TOGGLES === 'true' && (
          <Box display='flex' flexDirection='column' alignItems='center'>
            <SwitchDark />
            <SwitchColorblind />
          </Box>
        )}
      </Box>
      {process.env.NEXT_PUBLIC_AGIXT_FOOTER_MESSAGE && (
        <Box>
          <Typography
            variant='caption'
            align='center'
            style={{ width: '100%', display: 'inline-block', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            <Link style={{ textDecoration: 'none' }} href='https://github.com/Josh-XT/AGiXT'>
              {process.env.NEXT_PUBLIC_AGIXT_FOOTER_MESSAGE}
            </Link>{' '}
            • Built by{' '}
            <Link style={{ textDecoration: 'none' }} href='https://github.com/Josh-XT'>
              JoshXT
            </Link>{' '}
            and{' '}
            <Link style={{ textDecoration: 'none' }} href='https://github.com/jamesonrgrieve'>
              James G.
            </Link>{' '}
            &copy; 2023
          </Typography>
        </Box>
      )}
    </>
  );
}
