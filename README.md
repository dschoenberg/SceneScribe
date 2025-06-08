# 📚 Book Scene Generator

This is a Node.js app that pulls a random book from your [Hardcover](https://hardcover.app) account and uses OpenAI to generate a vivid scene or character description from that book.

---

## 🚀 Features

- Queries your personal book list via Hardcover’s GraphQL API.
- Selects a random book.
- Sends the book’s info to OpenAI for a scene or character description.
- Uses `.env` for managing API keys securely.

---

## 🔧 Setup

### 1. Install `nvm` (Node Version Manager)

If you don’t already have `nvm`, install it:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
Then restart your terminal and verify:
```bash
nvm --version
```

```bash
nvm install
nvm use
```

```bash
npm install
```

## Configuration

```bash
cp env.example .env
```

Open `.env` and enter your API keys.

Get your Hardcover API key: https://hardcover.app/account/api
Get your OpenAI API key: https://platform.openai.com/account/api-keys

## Run the app

```bash
node index.js
```