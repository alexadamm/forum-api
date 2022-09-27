# Forum Back-End
Node.js back-end with clean architecture

## Project Structure

```
forum-api/                  → Project's root.
├─ .github/workflows        → Workflows directory, used for implementation of Continuous Integration and Continuous Deployment.
├─ config/                  → Configuration directory, used for configure node-pg-migrate on database testing.
├─ migrations/              → Database migrations directory.
├─ src/                     → Source code of the application.
│  ├─ Applications/         → Application Business Rules
│  │  ├─ security/          → Abstract/interface from security tools and helper that used on use case. e.g. AuthTokenManager and EncryptionHelper
│  │  ├─ use_cases/         → App business flow.
│  ├─ Commons/              → Shared folder.
│  │  ├─ exceptions/        → Custom exceptions.
│  ├─ Domains/              → Enterprise Business Rules.
│  │  ├─ authentications/   → Authentications Subdomain, contains domain model (entities) and abstract/interface of AuthenticationsRepository.
│  │  ├─ users/             → Users Subdomain, contains domain model (entities) and abstract/interface of UsersRepository.
│  ├─ Infrastructures/      → External agent, such as Framework and External Tools.
│  │  ├─ database/          → Database driver.
│  │  ├─ http/              → HTTP Server that use Hapi.js.
│  │  ├─ repositories/      → Object concrete/implementation of domains repository.
│  │  ├─ security/          → Object concrete/implementation of security helper.
│  │  ├─ container.js       → Container of all of instances of application services.
│  ├─ Interfaces/           → Interface Adapter, where the routes configuration and handler define using Hapi Plugin.
│  ├─ app.js                → Entry point of the application.
├─ tests/                   → Utility needs for testing.
├─ .env                     → Environment variable.
├─ package.json             → Project Manifest.

```

## Getting Started

### Step 1: Set up the development environment

You need to set up your development environment before you can do anything.

Install [Node.js and npm](https://nodejs.org/en/download/).

Install [PostgreSQL](https://www.postgresql.org/download/).

Set up the [database](https://github.com/alexadamm/forum-api#database-configuration) and the [development environment](https://github.com/alexadamm/forum-api#development-environment).

### Step 2: Install dependencies

- Install all dependencies with `npm install`.

### Step 3: Run database migrations

- Create database tables by migration with `npm run migrate up`.

### Step 4: Run in dev mode

- Run `npm run start:dev`.
- The server address will be displayed to you as `http://0.0.0.0:{PORT}`.


### Database configuration

This app using node-pg-migration which automatically create tables on the database. You need to create database first on PostgreSQL before run the database migrations.

### Development environment

To run the development migrations and server, you should define the development environment with `.env` file on the root directory.

`.env` file contains:

```
# HTTP SERVER
HOST                → Hostname of http server.
PORT                → Port of http server.

# POSTGRES
PGHOST              → Hostname of postgresql server.
PGUSER              → Username of postgresql database admin.
PGDATABASE          → Name of postgresql database.
PGPASSWORD          → Password of postgresql database admin.
PGPORT              → Port of postgresql server.

# POSTGRES TEST
PGHOST_TEST         → Hostname of postgresql test server.
PGUSER_TEST         → Username of postgresql test database admin.
PGDATABASE_TEST     → Name of postgresql test database.
PGPASSWORD_TEST     → Password of postgresql test database admin.
PGPORT_TEST         → Port of postgresql test server.

# TOKENIZE
ACCESS_TOKEN_KEY    → Secret token key for access token on authentication.
REFRESH_TOKEN_KEY   → Secret token key Refresh token on authentication.
ACCCESS_TOKEN_AGE   → Access token age (seconds) on authentication.
```