FROM node:latest AS node_base

RUN echo "NODE Version:" && node --version
RUN echo "NPM Version:" && npm --version

FROM openjdk:8-alpine
COPY --from=node_base . .

# install Firebase CLI
RUN npm install -g firebase-tools

ENTRYPOINT ["/usr/local/bin/firebase"]