FROM oven/bun:slim
WORKDIR /usr/src/app

COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

USER bun
ENV HOST="0.0.0.0"
ENTRYPOINT [ "sh", "-c", "exec bun ./dist/server/entry.mjs" ]
