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

RUN npm run build:refs \
    && npm run build:production \
    && npm run test:cloudbuild \
    && if [ "$CODECOV_TOKEN" != "" ]; \
        then curl -s https://codecov.io/bash | bash -s - -X gcov -X coveragepy -X fix; \
    fi

WORKDIR /functions

RUN npm run build

# Only keep our dist folder in the final docker image
FROM scratch
COPY --from=BUILDER /dist ./
COPY --from=BUILDER /functions/lib ./functions
