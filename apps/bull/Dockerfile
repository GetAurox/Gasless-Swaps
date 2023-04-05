# install stage
FROM node:16-alpine as builder

# set the working directory
WORKDIR /app

# install dependencies
RUN apk add --virtual mypacks git python3 build-base

# copy the JSON files
COPY out/json .

# copy the yarn lock
COPY out/yarn.lock .

# install the packages
RUN yarn install

# copy the rest of the package over
COPY out/full .

# build the app
RUN npx turbo run build --scope=@aurox-gasless-swaps/bull-worker --include-dependencies --no-deps

# remove dependencies
RUN apk del mypacks

# expose port 3000
EXPOSE 3000

CMD cd apps/bull && npm_config_yes=true npx dotenv-vault@latest pull --dotenvMe $DOTENV_ME && cd ../.. && PORT=3000 npx turbo run start --scope=@aurox-gasless-swaps/bull-worker

