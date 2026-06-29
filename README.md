# Janmabhoomi Civic Desk

Janmabhoomi Civic Desk is a civic-services prototype for searching village land records, submitting public-service requests, and helping administrators manage local records with a lightweight JSON data store.

## Description

The project provides two runnable prototypes:

- A Streamlit app for citizen and admin workflows.
- A legacy static frontend with a small Node.js API server.

The local database is stored in `data/db.json`, which makes the project easy to run for demos, hackathons, and classroom review without provisioning an external database.

## Features

- Search land records by owner, survey number, village, or status.
- Submit civic service requests from a citizen portal.
- Track request status.
- Manage records and service requests from an admin interface.
- Import records and requests from JSON.

## Tech Stack

- Python 3.11+
- Streamlit
- Node.js 20+
- HTML, CSS, and JavaScript
- JSON file storage

## Quick Start

### Streamlit app

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

### Legacy Node prototype

```bash
node server.js
```

Open `http://localhost:3000`.

## Data Format

```json
{
  "records": [
    {
      "id": "rec-1",
      "owner": "A. Lakshmi",
      "survey": "142/B",
      "village": "Velpur",
      "extent": "2.4 acres",
      "status": "Verified"
    }
  ],
  "requests": [
    {
      "id": "req-1",
      "name": "A. Lakshmi",
      "village": "Velpur",
      "type": "Land mutation",
      "details": "Mutation pending after inheritance update.",
      "status": "Review"
    }
  ]
}
```

## Quality Checks

```bash
ruff check .
ruff format --check .
mypy streamlit_app.py
bandit -r .
pytest --cov=. --cov-fail-under=70
```

Additional tools are configured through `pyproject.toml`, `.pre-commit-config.yaml`, `.semgrep.yml`, and `.gitlab-ci.yml`.

## Documentation

- [Contributing guide](CONTRIBUTING.md)
- [User manual](USER_MANUAL.md)
- [Agent guide](AGENTS.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

This project is licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
