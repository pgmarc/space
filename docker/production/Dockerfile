# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/server

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and ./pnpm-lock.yaml to the container
COPY ./package.json .
COPY ./pnpm-lock.yaml .

# Install Node.js dependencies
RUN pnpm install 

# Copy the rest of the application source code to the container
COPY ./src/main .

# Copy tsconfig.json to the container
COPY ./tsconfig.build.json .

# Build your application
RUN pnpm run build --project tsconfig.build.json
RUN pnpx tsc-alias -p tsconfig.build.json

EXPOSE ${SERVER_PORT:-8080}

# Specify the command to start your React app
CMD [ "node", "dist/index.js"]