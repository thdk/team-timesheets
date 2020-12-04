# Pull base image.
FROM gcr.io/team-timesheets/builder as BUILDER

# Install dependencies
WORKDIR /functions

## Install dependencies for functions first
COPY functions/package*.json ./

RUN npm ci

## Install app dependencies next
WORKDIR /
COPY package*.json ./

RUN npm ci

# Copy all app source files
COPY . .

RUN npm run build:refs && npm run build:production

ARG VCS_COMMIT_ID
ARG VCS_BRANCH_NAME
ARG VCS_PULL_REQUEST
ARG CI_BUILD_ID
ARG CODECOV_TOKEN

ENV VCS_COMMIT_ID=$VCS_COMMIT_ID
ENV VCS_BRANCH_NAME=$VCS_BRANCH_NAME
ENV VCS_PULL_REQUEST=$VCS_PULL_REQUEST
ENV CI_BUILD_ID=$CI_BUILD_ID
ENV CODECOV_TOKEN=$CODECOV_TOKEN

RUN npm run test:cloudbuild \
    && if [ "$CODECOV_TOKEN" != "" ]; \
        then curl -s https://codecov.io/bash | bash -s - -X gcov -X coveragepy -X fix -s coverage; \
    fi

WORKDIR /functions

RUN npm run build

WORKDIR /

ARG FIREBASE_PROJECT_ID
ARG FIREBASE_TOKEN

RUN if [ "$FIREBASE_TOKEN" != "" ]; \
       then firebase deploy --project $FIREBASE_PROJECT_ID --token $FIREBASE_TOKEN; \
    fi
