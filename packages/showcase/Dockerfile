# Storybook statique du design-system FerrLabs (@ferrlabs/ui-showcase),
# servi en interne sur storybook.ferrlabs (VPN-only).
#
# Build stage — monorepo pnpm. Le showcase consomme @ferrlabs/ui-ng et
# @ferrlabs/ui-foundation depuis la source (workspace:*) ; aucun pull du
# registre privé n'est nécessaire.
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY packages ./packages

# Install complet du workspace : le build Storybook importe des deps non
# déclarées par showcase (les .woff2 de @fontsource via preview.src.css),
# hissées par un install complet. Un install filtré les manquerait.
RUN pnpm install --frozen-lockfile

# @ferrlabs/ui-ng est résolu via tsconfig paths vers packages/ui-ng/dist :
# il faut builder les libs AVANT le showcase. Ordre explicite (vérifié).
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm --filter @ferrlabs/ui-foundation build \
 && pnpm --filter @ferrlabs/ui-ng build \
 && pnpm --filter @ferrlabs/ui-showcase build

# Runtime stage — nginx non-privilégié servant le bundle statique.
FROM docker.io/nginxinc/nginx-unprivileged:alpine

USER root
RUN apk upgrade --no-cache
USER nginx

COPY --from=builder /app/packages/showcase/dist /usr/share/nginx/html
COPY packages/showcase/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
