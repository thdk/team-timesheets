FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y curl \
    && curl --silent --location https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y \
        nodejs \
        build-essential \
        openjdk-11-jdk \
        git \
    && npm install -g firebase-tools && \
    firebase setup:emulators:firestore
