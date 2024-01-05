FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat git
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/var/cache/npm,sharing=locked \
    npm ci

FROM node:20-alpine AS themes
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/JamesonRGrieve/jrgcomponents-themes themes

FROM node:20-alpine AS builder
WORKDIR /app
ARG APP_NAME
ARG APP_DESCRIPTION
ARG APP_URI
ARG AGIXT_SERVER
ARG AUTH_WEB
ARG AGIXT_AGENT
ARG AGIXT_INSIGHT_AGENT
ARG AGIXT_MODE
ARG AGIXT_PROMPT_NAME
ARG AGIXT_PROMPT_CATEGORY
ARG AGIXT_CHAIN
ARG AGIXT_USE_SELECTED_AGENT
ARG AGIXT_CHAIN_ARGS
ARG AGIXT_FILE_UPLOAD_ENABLED
ARG AGIXT_SHOW_APP_BAR
ARG AGIXT_SHOW_CONVERSATION_BAR
ARG AGIXT_CONVERSATION_NAME
ARG AGIXT_REQUIRE_API_KEY
ARG AGIXT_RLHF
ARG AGIXT_FOOTER_MESSAGE
ARG AGIXT_SHOW_AGENT_BAR
ARG ADSENSE_ACCOUNT
ARG THEME_NAME
ARG LOG_VERBOSITY_SERVER
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    APP_NAME=${APP_NAME} \
    APP_DESCRIPTION=${APP_DESCRIPTION} \
    APP_URI=${APP_URI} \
    AGIXT_SERVER=${AGIXT_SERVER} \
    AUTH_WEB=${AUTH_WEB} \
    AGIXT_AGENT=${AGIXT_AGENT} \
    AGIXT_INSIGHT_AGENT=${AGIXT_INSIGHT_AGENT} \
    AGIXT_MODE=${AGIXT_MODE} \
    AGIXT_PROMPT_NAME=${AGIXT_PROMPT_NAME} \
    AGIXT_PROMPT_CATEGORY=${AGIXT_PROMPT_CATEGORY} \
    AGIXT_CHAIN=${AGIXT_CHAIN} \
    AGIXT_USE_SELECTED_AGENT=${AGIXT_USE_SELECTED_AGENT} \
    AGIXT_CHAIN_ARGS=${AGIXT_CHAIN_ARGS} \
    AGIXT_FILE_UPLOAD_ENABLED=${AGIXT_FILE_UPLOAD_ENABLED} \
    AGIXT_SHOW_APP_BAR=${AGIXT_SHOW_APP_BAR} \
    AGIXT_SHOW_CONVERSATION_BAR=${AGIXT_SHOW_CONVERSATION_BAR} \
    AGIXT_CONVERSATION_NAME=${AGIXT_CONVERSATION_NAME} \
    AGIXT_REQUIRE_API_KEY=${AGIXT_REQUIRE_API_KEY} \
    AGIXT_RLHF=${AGIXT_RLHF} \
    AGIXT_FOOTER_MESSAGE=${AGIXT_FOOTER_MESSAGE} \
    AGIXT_SHOW_AGENT_BAR=${AGIXT_SHOW_AGENT_BAR} \
    THEME_NAME=${THEME_NAME} \
    LOG_VERBOSITY_SERVER=${LOG_VERBOSITY_SERVER} \
    ADSENSE_ACCOUNT=${ADSENSE_ACCOUNT}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=themes /app/themes/${THEME_NAME} ./app

# Hacky af
RUN echo "AGIXT_SERVER=${AGIXT_SERVER}" >> .env \
    && echo "APP_NAME=${APP_NAME}" >> .env \
    && echo "APP_DESCRIPTION=${APP_DESCRIPTION}" >> .env \
    && echo "APP_URI=${APP_URI}" >> .env \
    && echo "AUTH_WEB=${AUTH_WEB}" >> .env \
    && echo "AGIXT_AGENT=${AGIXT_AGENT}" >> .env \
    && echo "AGIXT_INSIGHT_AGENT=${AGIXT_INSIGHT_AGENT}" >> .env \
    && echo "AGIXT_MODE=${AGIXT_MODE}" >> .env \
    && echo "AGIXT_PROMPT_NAME=${AGIXT_PROMPT_NAME}" >> .env \
    && echo "AGIXT_PROMPT_CATEGORY=${AGIXT_PROMPT_CATEGORY}" >> .env \
    && echo "AGIXT_CHAIN=${AGIXT_CHAIN}" >> .env \
    && echo "AGIXT_USE_SELECTED_AGENT=${AGIXT_USE_SELECTED_AGENT}" >> .env \
    && echo "AGIXT_CHAIN_ARGS=${AGIXT_CHAIN_ARGS}" >> .env \
    && echo "AGIXT_FILE_UPLOAD_ENABLED=${AGIXT_FILE_UPLOAD_ENABLED}" >> .env \
    && echo "AGIXT_SHOW_APP_BAR=${AGIXT_SHOW_APP_BAR}" >> .env \
    && echo "AGIXT_SHOW_CONVERSATION_BAR=${AGIXT_SHOW_CONVERSATION_BAR}" >> .env \
    && echo "AGIXT_CONVERSATION_NAME=${AGIXT_CONVERSATION_NAME}" >> .env \
    && echo "AGIXT_REQUIRE_API_KEY=${AGIXT_REQUIRE_API_KEY}" >> .env \
    && echo "AGIXT_RLHF=${AGIXT_RLHF}" >> .env \
    && echo "AGIXT_FOOTER_MESSAGE=${AGIXT_FOOTER_MESSAGE}" >> .env \
    && echo "AGIXT_SHOW_AGENT_BAR=${AGIXT_SHOW_AGENT_BAR}" >> .env \
    && echo "THEME_NAME=${THEME_NAME}" >> .env \
    && echo "LOG_VERBOSITY_SERVER=${LOG_VERBOSITY_SERVER}" >> .env \
    && echo "ADSENSE_ACCOUNT=${ADSENSE_ACCOUNT}" >> .env

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -D -u 1001 -G nodejs nextjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
USER nextjs
EXPOSE 24498

CMD ["npm", "start"]
