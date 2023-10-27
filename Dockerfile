# Install Node dependencies
FROM node:current-alpine AS node_install

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --no-dev --no-audit --no-fund

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

RUN apk add curl openssl nodejs-current

COPY . /var/www/
COPY --from=node_install /app/node_modules /var/www/node_modules
RUN ln -s /var/www/bin/test-redirection.js /usr/local/bin/test-redirection

COPY ./docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

COPY --from=mkcert_builder /usr/local/bin/mkcert /usr/local/bin/mkcert
RUN mkcert -install

ENV DOMAINS='test.dev'
ENV DEBUG='false'

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
