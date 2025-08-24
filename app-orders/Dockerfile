FROM node:lts-alpine AS base

# -------------------- install dependencies ----------
  # This stage does not copy the source code yet → this allows dependency caching whenever only the code changes.

FROM base AS deps 

WORKDIR /app

COPY package*.json ./

RUN  npm install --omit=dev

#-------------------- only cody and dependencies -----

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Creates the nodejs group and the api user (UID/GID 1001).
# Gives the user permissions to /app.
# Reason: Do not run as root inside the container → security practice.

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

RUN chown api:nodejs .

# Copies all code from the repository to /app, already with the owner api:nodejs.
# Copies node_modules from the deps stage.
# This ensures that the final container only contains production code and dependencies, without cache or build garbage.

COPY --chown=api:nodejs . .
COPY --from=deps /app/node_modules ./node_modules

# From here on, all processes in the container run as api (non-root)
USER api

EXPOSE 3333

ENV PORT=3333
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["npm", "run", "start"]


