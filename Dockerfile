# Install Node dependencies
FROM node:20-alpine AS node_install

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# Build cli tool
FROM node:20-alpine AS node_builder

WORKDIR /app
COPY . .
COPY --from=node_install /app/node_modules /app/node_modules
RUN npm run build

# Build mkcert
FROM golang:alpine AS mkcert_builder

RUN apk add --update git
RUN cd \
	&& git clone https://github.com/FiloSottile/mkcert \
	&& cd mkcert \
	&& go build -ldflags "-X main.Version=$(git describe --tags)" -o /usr/local/bin/mkcert

# Final context
FROM httpd:alpine
RUN mkdir -p /app
WORKDIR /app
RUN echo "" > /app/index.html

RUN apk add curl openssl

COPY --from=node_builder /app/dist/test-redirection /usr/local/bin/test-redirection

COPY ./docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

COPY --from=mkcert_builder /usr/local/bin/mkcert /usr/local/bin/mkcert
RUN mkcert -install

ENV DOMAINS='test.dev'
ENV DEBUG='false'

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
