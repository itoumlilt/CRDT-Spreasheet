# Multi-stage build for Git key handling
# build :
# docker build . --build-arg SSH_PRIVATE_KEY="$(cat ../id_rsa)"
#   id_rsa : unencrypted (passwordless) SSH key file for Git access
# Then delete intermediate image :
#   docker rmi -f $(docker images -q --filter label=stage=builder)
FROM node:latest as builder
LABEL stage=builder

# could use gitlab access token with
# git config gitlab.accesstoken {TOKEN_VALUE}
ARG SSH_PRIVATE_KEY
ENV REACT_APP_SERVERURL="http://admin:admin@127.0.0.1:5984/testdb" \
    REACT_APP_OFFLINE_FIRST=any

RUN mkdir /home/node/.ssh ;\
    ssh-keyscan gitlab.inria.fr >/home/node/.ssh/known_hosts ;\
    umask 077 ; echo "$SSH_PRIVATE_KEY" >/home/node/.ssh/id_rsa ;\
    chown -R node:node /home/node/.ssh

WORKDIR /app
COPY package*.json ./
RUN chown -R node:node .

USER node
RUN npm install

COPY . .
RUN npm run build ;\
    npm prune --production

##### Real image #####
FROM nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
