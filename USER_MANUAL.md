# User Manual

## Purpose

Janmabhoomi Civic Desk helps citizens find local land records, submit civic service requests, and track the status of those requests. Administrators can manage demo records and request queues.

## Start the Streamlit App

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Citizen Workflow

1. Open the app in the browser.
2. Use the record search tab to search by owner, survey number, village, or status.
3. Open the request tab to submit a new civic service request.
4. Use the tracking tab to review submitted requests and their current status.

## Admin Workflow

1. Switch to the admin area in the Streamlit sidebar.
2. Add, edit, or delete land records.
3. Update request statuses as work moves from open to review to closed.
4. Import JSON data when demo records need to be refreshed.

## Import Format

Upload a JSON file with optional `records` and `requests` arrays:

```json
{
  "records": [],
  "requests": []
}
```

## Local Data

The app stores local demo data in `data/db.json`. This file is intended for development and demonstration only.

## Troubleshooting

- If the app starts with empty data, delete `data/db.json` and restart to regenerate seed data.
- If Streamlit is missing, run `pip install -r requirements.txt`.
- If the legacy Node server fails to start, check whether another process is already using port `3000`.
