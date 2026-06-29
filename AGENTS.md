# Agent Guide

This file gives AI coding agents and automation tools project-specific operating guidance.

## Project Shape

- `streamlit_app.py` is the primary Python/Streamlit app.
- `server.js`, `index.html`, `styles.css`, and `app.js` form the legacy Node/static prototype.
- `data/db.json` is local demo persistence.
- `specs/` contains feature specifications.
- `.specify/` contains Spec-Kit governance and templates.

## Working Rules

- Keep demo data fictional.
- Do not commit secrets or real citizen records.
- Prefer small, reviewable changes.
- Update `README.md`, `USER_MANUAL.md`, or a spec when user-facing behavior changes.
- Preserve the JSON data shape unless a spec explicitly changes it.

## Verification

Run relevant checks before handing work back:

```bash
ruff check .
ruff format --check .
mypy streamlit_app.py
bandit -r .
pytest --cov=. --cov-fail-under=70
```

For frontend changes, also run the app and visually inspect the affected workflow.

## Release Notes

Update `CHANGELOG.md` for visible changes. Conventional Commits are preferred because `git-cliff` can generate changelog entries from commit history.
