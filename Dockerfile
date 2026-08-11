# syntax=docker/dockerfile:1

# L'application est entièrement statique une fois construite : Node ne sert qu'à
# produire dist/, et n'a rien à faire dans l'image finale. D'où deux étapes —
# l'image livrée ne contient ni node_modules, ni sources, ni chaîne de build.

# --- Construction ------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Le manifeste est copié seul d'abord : tant que package.json et le lockfile ne
# changent pas, Docker réutilise cette couche et saute complètement le npm ci.
COPY package.json package-lock.json ./

# `npm ci` et non `npm install` : installation reproductible, strictement
# conforme au lockfile, et échoue si les deux fichiers divergent.
RUN npm ci

COPY . .
RUN npm run build

# --- Service -----------------------------------------------------------------
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# wget est fourni par le busybox d'Alpine, inutile d'installer curl.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost/ || exit 1
