# Elasticsearch Search Page

A Node.js/Express web application demonstrating full-text search using **Elasticsearch** with **PostgreSQL** as the primary data store. Shows how to build a search interface that queries Elasticsearch while data lives in PostgreSQL.

## Features

- **Full-Text Search** — Elasticsearch-powered search across documents
- **PostgreSQL Integration** — primary data storage, data sync to Elasticsearch
- **Search Suggestions** — auto-complete search suggestions
- **Multiple Search Modes** — SQL fallback search, Elasticsearch search, Bootstrap-based UI

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Search Engine | Elasticsearch |
| Database | PostgreSQL |
| View Engine | Handlebars (hbs) |
| UI | Bootstrap |

## Project Structure

```
├── app.js                   # Express application setup
├── config.js                # Configuration
├── elasticsearch.js         # Elasticsearch client and query helpers
├── postgres.js              # PostgreSQL client and queries
├── package.json             # Dependencies
├── routes/                  # Express route handlers
├── views/                   # Handlebars templates
└── public/                  # Static assets (CSS, JS, images)
```

**Key files:**
- `elasticsearch.js` — Elasticsearch client, index management, search queries
- `postgres.js` — PostgreSQL connection, data retrieval
- `routes/` — API endpoints for search, suggestions, and page rendering

## Getting Started

### Prerequisites
- Node.js 14+
- Elasticsearch 7.x or 8.x
- PostgreSQL

### Install Dependencies

```bash
npm install
```

### Configuration

Update `config.js` with your connection details:

```javascript
module.exports = {
  elasticsearch: {
    node: 'http://localhost:9200'
  },
  postgres: {
    connectionString: 'postgresql://user:password@localhost:5432/dbname'
  }
};
```

### Run

```bash
npm start
```

Navigate to `http://localhost:3000`

## Search Modes

The app demonstrates multiple search approaches:

| Mode | Route | Description |
|---|---|---|
| Elasticsearch | `/search` | Full-text search via Elasticsearch |
| PostgreSQL | `/search/sql` | SQL-based search fallback |
| Suggestions | `/suggest` | Auto-complete suggestions |

## Views

- `search.hbs` — main search interface
- `bootstrap_search.hbs` — Bootstrap-styled search page
- `suggest.hbs` — suggestions demo

---

**YRoss** · [LinkedIn](https://www.linkedin.com/in/ythalorossy/) · [GitHub Profile](https://github.com/ythalorossy)