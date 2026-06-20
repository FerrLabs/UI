# Storybook statique du design-system FerrLabs (@ferrlabs/ui-showcase),
# servi en interne sur storybook.ferrlabs.internal (VPN-only).
#
# Build stage — monorepo pnpm. Le showcase dépend de packages workspace
# (@ferrlabs/ui-react, @ferrlabs/ui-foundation) buildés ici depuis la source ;
# aucun pull du registre privé n'est nécessaire (workspace:*).
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

# Manifests racine + toutes les packages (pnpm résout le graphe workspace).
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages ./packages

# Installe showcase + ses dépendances workspace, puis build (deps d'abord).
RUN pnpm install --frozen-lockfile --filter "...@ferrlabs/ui-showcase"
RUN pnpm --filter "...@ferrlabs/ui-showcase" build

# Runtime stage — nginx non-privilégié servant le bundle statique.
FROM docker.io/nginxinc/nginx-unprivileged:alpine

USER root
RUN apk upgrade --no-cache
USER nginx

COPY --from=builder /app/packages/showcase/dist /usr/share/nginx/html
COPY packages/showcase/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
