FROM node:10.18.0 AS node_base

RUN echo "NODE Version:" && node --version
RUN echo "NPM Version:" && npm --version

FROM openjdk:8-alpine
COPY --from=node_base . .

# install Firebase CLI
RUN npm install -g firebase-tools
RUN firebase setup:emulators:firestore

ENTRYPOINT ["/usr/local/bin/firebase"]