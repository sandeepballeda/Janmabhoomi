# Feature Specification: Civic Desk Baseline

## User Goal

Citizens can search land records, submit civic service requests, and track request status. Administrators can maintain records and request queues for demos.

## Scope

### In Scope

- Local JSON persistence.
- Citizen record search.
- Citizen request creation.
- Request status tracking.
- Admin record and request management.

### Out of Scope

- Production authentication.
- Real citizen data.
- External database provisioning.
- SMS, email, or GIS integrations.

## Functional Requirements

- FR-001: The app must load demo data from `data/db.json`.
- FR-002: The citizen workflow must support record search.
- FR-003: The citizen workflow must create service requests with a generated identifier.
- FR-004: The admin workflow must update request status.
- FR-005: JSON import must merge records and requests by identifier.

## Acceptance Criteria

- [ ] A user can run `streamlit run streamlit_app.py` and access the app locally.
- [ ] A user can search seeded records by village or owner.
- [ ] A user can submit a request and see it in the request list.
- [ ] An admin can change request status.

## Risks

- Demo data could be confused for real records if not clearly maintained as fictional data.
- Local JSON storage is not suitable for concurrent production use.
