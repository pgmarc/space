# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/client

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and ./pnpm-lock.yaml to the container
COPY ./package.json .
COPY ./pnpm-lock.yaml .

# Install Node.js dependencies
RUN pnpm install 

# Copy the rest of the application source code to the container
RUN mkdir src
COPY ./src ./src

# Copy tsconfig.json to the container
COPY ./tsconfig.json .
COPY ./tsconfig.app.json .
COPY ./tsconfig.node.json .

# Build your application
RUN pnpm run build
# Arregla los imports relativos en la salida ESM usando tsc-alias
RUN pnpx tsc-alias --project="./tsconfig.json" --resolve-full-paths

# Specify the command to start the server
CMD [ "node", "dist/index.js"]