import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import React from 'react';
import ChatBar from './ChatBar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { screen } from '@storybook/testing-library';

// Extended args interface that includes options for stories
interface ChatBarStoryArgs {
  handleMessageOption?: 'action' | 'console';
}

const meta: Meta<React.ComponentProps<typeof ChatBar> & ChatBarStoryArgs> = {
  title: 'Components/ChatBar',
  component: ChatBar,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      const state = {
        mutate: action('mutate state'),
        overrides: {},
      };
  
      return (
        <InteractiveConfigContext.Provider value={state}>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
        </InteractiveConfigContext.Provider>
      );
    },
  ],
  argTypes: {
    onSend: {
      table: { disable: true },
    },
    setLoading: {
      table: { disable: true },
    },
    disabled: {
      control: 'boolean',
      table: {
        category: 'State',
      },
    },
    loading: {
      control: 'boolean',
      table: {
        category: 'State',
      },
    },
    clearOnSend: {
      control: 'boolean',
      defaultValue: true,
      table: {
        category: 'Behavior',
      },
    },
    showChatThemeToggles: {
      control: 'boolean',
      table: {
        category: 'UI Options',
      },
    },
    enableFileUpload: {
      control: 'boolean',
      table: {
        category: 'Features',
      },
    },
    enableVoiceInput: {
      control: 'boolean',
      table: {
        category: 'Features',
      },
    },
    showResetConversation: {
      control: 'boolean',
      table: {
        category: 'Features',
      },
    },
    showOverrideSwitchesCSV: {
      control: 'text',
      table: {
        category: 'Configuration',
      },
    },
    handleMessageOption: {
      control: 'radio',
      options: ['action', 'console'],
      description: 'Select the type of message handler',
      table: {
        category: 'Message Behavior',
      },
    },
  },
};

export default meta;
type Story = StoryObj<React.ComponentProps<typeof ChatBar> & ChatBarStoryArgs>;

// Default story
export const Default: Story = {
  args: {
    disabled: false,
    loading: false,
    clearOnSend: true,
    showChatThemeToggles: false,
    enableFileUpload: false,
    enableVoiceInput: false,
    showResetConversation: false,
    showOverrideSwitchesCSV: '',
    handleMessageOption: 'action',
  },
  render: (args) => {
    let handleSend;

    if (args.handleMessageOption === 'console') {
      handleSend = async (message: string | object, files?: { [x: string]: string }) => {
        console.log('Message sent via console:', message, files);
        return 'success';
      };
    } else {
      handleSend = async (message: string | object, files?: { [x: string]: string }) => {
        action('Message sent via action')(message, files);
        return 'success';
      };
    }

    const { handleMessageOption, ...componentProps } = args;

    return <ChatBar {...componentProps} onSend={handleSend} setLoading={action('setLoading')} />;
  },
};

// With file upload enabled
export const WithFileUpload: Story = {
  args: {
    ...Default.args,
    enableFileUpload: true,
  },
};

// With voice input enabled
export const WithVoiceInput: Story = {
  args: {
    ...Default.args,
    enableVoiceInput: true,
  },
};

// With theme toggles
export const WithThemeToggles: Story = {
  args: {
    ...Default.args,
    showChatThemeToggles: true,
  },
};

// With reset conversation button
export const WithResetConversation: Story = {
  args: {
    ...Default.args,
    showResetConversation: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
  play: async ({ canvasElement }) => {
    // Wait for a moment to allow the timer to initialize
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = within(canvasElement);

    // Verify timer is displayed when loading
    await waitFor(() => {
      const timerText = canvas.getByTestId('loading-timer');
      expect(timerText).toBeInTheDocument();
    });
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify textarea is disabled
    const textarea = canvas.getByPlaceholderText('Enter your message here...');
    expect(textarea).toBeDisabled();

    // Verify send button is disabled
    const sendButton = canvas.getByRole('button', { name: /Send Message/i });
    expect(sendButton).toBeDisabled();
  },
};

// All features enabled
export const AllFeaturesEnabled: Story = {
  args: {
    ...Default.args,
    showChatThemeToggles: true,
    enableFileUpload: true,
    enableVoiceInput: true,
    showResetConversation: true,
  },
};

// Interactive story
export const SendMessageInteraction: Story = {
  args: {
    ...Default.args,
    onSend: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Type a message
    const messageInput = canvas.getByPlaceholderText('Enter your message here...');
    await userEvent.type(messageInput, 'Hello, world!');

    // Click send button
    const sendButton = canvas.getByRole('button', { name: /Send Message/i });
    await userEvent.click(sendButton);

    // Verify the message was sent (by checking if the input is cleared)
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });
  },
};

// Reset Conversation Interaction
export const ResetConversationInteraction: Story = {
  args: {
    ...Default.args,
    showResetConversation: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click the reset button
    const resetButton = await canvas.findByTestId('reset-conversation-button');
    await userEvent.click(resetButton);

    // Use findByText which awaits the element to appear in the DOM
    const dialogTitle = await screen.findByText('Reset Conversation');
    expect(dialogTitle).toBeInTheDocument();

    const confirmButton = await screen.findByRole('button', { name: 'Reset' });
    await userEvent.click(confirmButton);
  },
};

// File Upload Interaction
export const FileUploadInteraction: Story = {
  args: {
    ...Default.args,
    enableFileUpload: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Type a message
    const messageInput = canvas.getByPlaceholderText('Enter your message here...');
    await userEvent.type(messageInput, 'Here is my file:');

    // Click the file upload button
    const uploadButton = canvas.getByRole('button', { name: /Upload Files/i });
    await userEvent.click(uploadButton);

    // Note: Actually uploading a file in Storybook tests is limited
    // This test just verifies the button is clickable
  },
};
