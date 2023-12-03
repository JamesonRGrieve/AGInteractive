/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Options
    NEXT_PUBLIC_AGIXT_SERVER: process.env.NEXT_PUBLIC_AGIXT_SERVER || process.env.AGIXT_SERVER || 'http://localhost:7437',
    NEXT_PUBLIC_AGIXT_AGENT: process.env.NEXT_PUBLIC_AGIXT_AGENT || process.env.AGIXT_AGENT || 'gpt4free',
    NEXT_PUBLIC_AGIXT_INSIGHT_AGENT:
      process.env.NEXT_PUBLIC_AGIXT_INSIGHT_AGENT || process.env.AGIXT_INSIGHT_AGENT || 'gpt4free',
    NEXT_PUBLIC_AGIXT_MODE: process.env.NEXT_PUBLIC_AGIXT_MODE || process.env.AGIXT_MODE || 'prompt',
    // Prompt Mode Options
    NEXT_PUBLIC_AGIXT_PROMPT_NAME: process.env.NEXT_PUBLIC_AGIXT_PROMPT_NAME || process.env.AGIXT_PROMPT_NAME || 'Chat',
    NEXT_PUBLIC_AGIXT_PROMPT_CATEGORY:
      process.env.NEXT_PUBLIC_AGIXT_PROMPT_CATEGORY || process.env.AGIXT_PROMPT_CATEGORY || 'Default',
    // Chain Mode Options
    NEXT_PUBLIC_AGIXT_CHAIN: process.env.NEXT_PUBLIC_AGIXT_CHAIN || process.env.AGIXT_CHAIN || 'Postgres Chat',
    NEXT_PUBLIC_AGIXT_USE_SELECTED_AGENT:
      process.env.NEXT_PUBLIC_AGIXT_USE_SELECTED_AGENT || process.env.AGIXT_USE_SELECTED_AGENT || 'true',
    NEXT_PUBLIC_AGIXT_CHAIN_ARGS: process.env.NEXT_PUBLIC_AGIXT_CHAIN_ARGS || process.env.AGIXT_CHAIN_ARGS || '{}',
    // UI Options
    NEXT_PUBLIC_AGIXT_FILE_UPLOAD_ENABLED:
      process.env.NEXT_PUBLIC_AGIXT_FILE_UPLOAD_ENABLED || process.env.AGIXT_FILE_UPLOAD_ENABLED || 'false',
    NEXT_PUBLIC_AGIXT_SHOW_CONVERSATION_BAR:
      process.env.NEXT_PUBLIC_AGIXT_SHOW_CONVERSATION_BAR || process.env.AGIXT_AGIXT_SHOW_CONVERSATION_BAR || 'true',
    NEXT_PUBLIC_AGIXT_SHOW_APP_BAR:
      process.env.NEXT_PUBLIC_AGIXT_SHOW_APP_BAR || process.env.AGIXT_AGIXT_SHOW_APP_BAR || 'true',
    NEXT_PUBLIC_AGIXT_CONVERSATION_NAME:
      process.env.NEXT_PUBLIC_AGIXT_CONVERSATION_NAME || process.env.AGIXT_CONVERSATION_NAME || 'AGiXT Conversation',
    NEXT_PUBLIC_APP_URI: process.env.APP_URI ?? 'http://localhost:3000',
    NEXT_PUBLIC_COOKIE_DOMAIN: `.${((process.env.APP_URI ?? 'http://localhost:3000').split('://')[1] ?? '')
      .split(':')[0]
      .split('.')
      .reverse()
      .slice(0, 2)
      .reverse()
      .join('.')}`
  }
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true
});
module.exports = process.env.NEXT_ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig;
