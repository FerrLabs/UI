# Storybook statique du design-system FerrLabs (@ferrlabs/ui-showcase),
# servi en interne sur storybook.ferrlabs.internal (VPN-only).
#
# Build stage — monorepo pnpm. Le showcase dépend de packages workspace
# (@ferrlabs/ui-react, @ferrlabs/ui-foundation) buildés ici depuis la source ;
# aucun pull du registre privé n'est nécessaire (workspace:*).
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

# Manifests racine + tsconfig de base (showcase/tsconfig.json l'étend) +
# toutes les packages (pnpm résout le graphe workspace).
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY packages ./packages

# Install complet du workspace : le build Storybook importe des deps non
# déclarées par showcase (ex. @fontsource/* via preview.css), hissées par un
# install complet en local. Un install filtré les manquerait. Build filtré.
RUN pnpm install --frozen-lockfile
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
