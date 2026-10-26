# Crypto-graph

Crypto-graph is a web application for viewing cryptocurrency market charts and
managing a personal watchlist. The React client gets market data from the NestJS
API; the API uses CoinGecko for market data and MongoDB for user accounts and
watchlists.

## Project structure

- `client/crypto-g/` — React client.
- `server/crypto-graph-serv/` — NestJS API.
- `docker-compose.yml` — current Docker Compose configuration.

## Run locally with Docker Compose

1. Install Docker Desktop with the Compose plugin.
2. Copy `.env.example` to `.env` and replace the development-only JWT secrets
   and database password if needed. Keep the database password URL-safe because
   it is embedded in the MongoDB connection URI.
3. From the repository root, run `docker compose up --build`.
4. Open the client at <http://localhost:4000>. The API is available at
   <http://localhost:4100>, with Swagger documentation at
   <http://localhost:4100/api-doc>.

If the build fails with a BuildKit error such as `failed to stat active key`,
build the API with Compose and the frontend with a separate Buildx builder,
then start the services. In PowerShell:

```powershell
docker buildx create --name crypto-graph-recovery --driver docker-container --use
docker compose build server
docker buildx build --builder crypto-graph-recovery --load -t projectmath-client:latest -f client/crypto-g/docker/cli/Dockerfile client/crypto-g
docker compose up -d
```

If that builder already exists, skip the `docker buildx create` command. The
workaround avoids exporting both Compose images through the separate builder,
which can be very slow on this setup.

Compose starts MongoDB with persistent data in the `mongo-data` volume and
waits for its health check before starting the API. The database port is not
published to the host. The Compose defaults and example secrets are for local
development only, not production. Docker serves a prebuilt React production
bundle with Nginx and runs the compiled NestJS API rather than starting
development watchers inside resource-constrained containers.

To stop the services, run `docker compose down`. To also delete the local
database data, run `docker compose down --volumes`.

The client uses Create React App 5 with an older `loader-utils` dependency that
still requests the MD4 hash algorithm. Its local start and build scripts set
Node's legacy OpenSSL provider for compatibility. The frontend Docker image
installs dependencies with Node 14 and compiles the production bundle with
Node 16, where the legacy hash is supported without that flag.

## Requirements

The recovery environment has been checked with Node.js 24, npm 11, Docker
Desktop, WSL2, and Ubuntu. The Docker images use Node.js 14 to retain
compatibility with the project's older native dependencies.

The application also requires access to the CoinGecko API. `.env.example`
contains local development placeholders; do not commit `.env` or real
credentials.

## Verification notes

The NestJS server and React client compile. The focused server market-data tests
and client landing-page test pass. Server authentication tests cover password
validation, access-token identity lookup, refresh-token verification, and
hashed refresh-token storage; client tests cover login and registration session
handling and API error feedback. The market-data API requests the top 15
CoinGecko markets and their 7-day price sparklines in one request; historical
market-cap averages are not returned because this CoinGecko endpoint provides
only the current market cap. The client currently charts prices only.
