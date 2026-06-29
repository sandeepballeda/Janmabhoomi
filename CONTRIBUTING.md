# Contributing

Thank you for improving Janmabhoomi Civic Desk. This project is intended to stay easy to run, easy to review, and safe for public-service data demos.

## Development Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pre-commit install
```

Run the Streamlit app with:

```bash
streamlit run streamlit_app.py
```

Run the legacy Node prototype with:

```bash
node server.js
```

## Contribution Flow

1. Create a branch from `main`.
2. Keep changes focused on one feature, bug fix, or documentation update.
3. Add or update tests when behavior changes.
4. Run the quality checks before opening a merge request.
5. Use clear commit messages, preferably Conventional Commits such as `feat: add request filters`.

## Required Checks

```bash
ruff check .
ruff format --check .
mypy streamlit_app.py
bandit -r .
pytest --cov=. --cov-fail-under=70
```

Security-sensitive changes should also run:

```bash
gitleaks detect --source .
semgrep scan --config .semgrep.yml
```

## Data Safety

- Do not commit real citizen data, tokens, credentials, private keys, or production exports.
- Use `.env.example` for variable names and safe placeholder values.
- Keep demo data small and fictional.

## Review Expectations

Reviewers should check correctness, data safety, accessibility, documentation, and whether the implementation matches the relevant spec under `specs/`.
