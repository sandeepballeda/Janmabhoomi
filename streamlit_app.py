import json
import uuid
from pathlib import Path

import streamlit as st


ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "db.json"

RECORD_STATUSES = ["Verified", "Needs survey", "Dispute review"]
REQUEST_STATUSES = ["Open", "Review", "Closed"]
SERVICE_TYPES = [
    "Land mutation",
    "Income certificate",
    "Crop damage claim",
    "Water supply issue",
    "Welfare eligibility",
]

SEED_DATA = {
    "records": [
        {"id": "rec-1", "owner": "A. Lakshmi", "survey": "142/B", "village": "Velpur", "extent": "2.4 acres", "status": "Verified"},
        {"id": "rec-2", "owner": "M. Ravi Kumar", "survey": "87/A", "village": "Kothapalli", "extent": "1.1 acres", "status": "Needs survey"},
        {"id": "rec-3", "owner": "S. Fathima", "survey": "211/C", "village": "Ramanapeta", "extent": "0.8 acres", "status": "Verified"},
        {"id": "rec-4", "owner": "G. Prasad", "survey": "19/D", "village": "Velpur", "extent": "3.0 acres", "status": "Dispute review"},
        {"id": "rec-5", "owner": "B. Kavya", "survey": "58/A", "village": "Mallaram", "extent": "1.7 acres", "status": "Verified"},
    ],
    "requests": [
        {"id": "req-1", "name": "A. Lakshmi", "village": "Velpur", "type": "Land mutation", "details": "Mutation pending after inheritance update.", "status": "Review"},
        {"id": "req-2", "name": "R. Narender", "village": "Mallaram", "type": "Water supply issue", "details": "Borewell repair request near ward 4.", "status": "Open"},
        {"id": "req-3", "name": "S. Fathima", "village": "Ramanapeta", "type": "Income certificate", "details": "Certificate needed for scholarship application.", "status": "Closed"},
    ],
}


def ensure_db() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    if not DB_PATH.exists():
        save_db(SEED_DATA)


def load_db() -> dict:
    ensure_db()
    with DB_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)
    data.setdefault("records", [])
    data.setdefault("requests", [])
    return data


def save_db(data: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with DB_PATH.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def matches_query(item: dict, query: str) -> bool:
    query = query.strip().lower()
    if not query:
        return True
    return any(query in str(value).lower() for value in item.values())


def upsert_item(collection: str, item: dict) -> None:
    data = load_db()
    items = data[collection]
    for index, existing in enumerate(items):
        if existing["id"] == item["id"]:
            items[index] = item
            save_db(data)
            return
    items.insert(0, item)
    save_db(data)


def delete_item(collection: str, item_id: str) -> None:
    data = load_db()
    data[collection] = [item for item in data[collection] if item["id"] != item_id]
    save_db(data)


def merge_by_id(existing: list[dict], incoming: list[dict], prefix: str) -> list[dict]:
    merged = {item["id"]: item for item in existing if item.get("id")}
    for item in incoming:
        clean_item = dict(item)
        clean_item["id"] = clean_item.get("id") or new_id(prefix)
        merged[clean_item["id"]] = clean_item
    return list(merged.values())


def import_data(uploaded_file) -> tuple[int, int]:
    payload = json.loads(uploaded_file.getvalue().decode("utf-8"))
    data = load_db()
    record_count = len(payload.get("records", [])) if isinstance(payload.get("records"), list) else 0
    request_count = len(payload.get("requests", [])) if isinstance(payload.get("requests"), list) else 0

    if record_count:
        data["records"] = merge_by_id(data["records"], payload["records"], "rec")
    if request_count:
        data["requests"] = merge_by_id(data["requests"], payload["requests"], "req")

    save_db(data)
    return record_count, request_count


def apply_theme() -> None:
    st.markdown(
        """
        <style>
          .stApp { background: #f5f7f1; color: #17211b; }
          [data-testid="stSidebar"] { background: #101820; }
          [data-testid="stSidebar"] * { color: #eef6f8; }
          .metric-card {
            border: 1px solid #dfe7df;
            border-radius: 8px;
            padding: 18px;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(39, 61, 48, 0.08);
          }
          .consumer-hero {
            border: 1px solid #dfe7df;
            border-radius: 8px;
            padding: 28px;
            background: linear-gradient(110deg, #dceee2, #ffffff);
            margin-bottom: 18px;
          }
          .admin-band {
            border: 1px solid #30414e;
            border-radius: 8px;
            padding: 18px;
            background: #17232d;
            color: #eef6f8;
          }
          .status-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            color: white;
            font-weight: 800;
            background: #236c47;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )


def status_pill(status: str) -> str:
    color = {
        "Open": "#215f89",
        "Review": "#b87217",
        "Closed": "#236c47",
        "Verified": "#236c47",
        "Needs survey": "#215f89",
        "Dispute review": "#b87217",
    }.get(status, "#607068")
    return f'<span class="status-pill" style="background:{color}">{status}</span>'


def render_consumer(data: dict) -> None:
    st.markdown(
        """
        <div class="consumer-hero">
          <p style="font-weight:900;color:#236c47;margin:0;">CONSUMER PORTAL</p>
          <h1 style="margin:8px 0 10px;">Find land records and request civic services without standing in line.</h1>
          <p style="margin:0;color:#405048;">Search verified village records, submit a certificate or grievance request, and track what the office is doing next.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    records_tab, request_tab, tracker_tab = st.tabs(["Search records", "Create request", "Track requests"])

    with records_tab:
        st.subheader("Land record search")
        query = st.text_input("Search by owner, survey number, village, or status", placeholder="Example: Lakshmi, 142/B, Velpur")
        records = [record for record in data["records"] if matches_query(record, query)]
        if records:
            for record in records:
                st.markdown(
                    f"**{record['owner']}**  \n"
                    f"Village: {record['village']} | Survey: {record['survey']} | Extent: {record['extent']}  \n"
                    f"{status_pill(record['status'])}",
                    unsafe_allow_html=True,
                )
                st.divider()
        else:
            st.info("No matching records found.")

    with request_tab:
        st.subheader("Create service request")
        with st.form("consumer_request_form", clear_on_submit=True):
            name = st.text_input("Citizen name")
            village = st.text_input("Village")
            service_type = st.selectbox("Service type", SERVICE_TYPES)
            details = st.text_area("Details")
            submitted = st.form_submit_button("Submit request", type="primary")

        if submitted:
            if not all([name.strip(), village.strip(), details.strip()]):
                st.error("Please complete citizen name, village, and details.")
            else:
                upsert_item(
                    "requests",
                    {
                        "id": new_id("req"),
                        "name": name.strip(),
                        "village": village.strip(),
                        "type": service_type,
                        "details": details.strip(),
                        "status": "Open",
                    },
                )
                st.success("Request submitted.")
                st.rerun()

    with tracker_tab:
        st.subheader("Request tracker")
        for request in data["requests"]:
            st.markdown(
                f"**{request['type']}**  \n"
                f"{request['name']} - {request['village']}  \n"
                f"{request['details']}  \n"
                f"{status_pill(request['status'])}",
                unsafe_allow_html=True,
            )
            st.divider()


def render_admin_overview(data: dict) -> None:
    st.markdown('<div class="admin-band"><h2 style="margin:0;">Admin operations dashboard</h2></div>', unsafe_allow_html=True)
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total records", len(data["records"]))
    col2.metric("Total requests", len(data["requests"]))
    col3.metric("Open workload", len([item for item in data["requests"] if item["status"] != "Closed"]))
    col4.metric("Verified parcels", len([item for item in data["records"] if item["status"] == "Verified"]))

    st.subheader("Operations feed")
    for request in data["requests"][:5]:
        st.write(f"{request['type']} | {request['name']} - {request['village']} | {request['status']}")


def render_record_admin(data: dict) -> None:
    st.subheader("Records CRUD")
    create_col, manage_col = st.columns([0.9, 1.4])

    with create_col:
        st.markdown("#### Create record")
        with st.form("create_record_form", clear_on_submit=True):
            owner = st.text_input("Owner")
            survey = st.text_input("Survey number")
            village = st.text_input("Village")
            extent = st.text_input("Extent", placeholder="2.4 acres")
            status = st.selectbox("Status", RECORD_STATUSES)
            submitted = st.form_submit_button("Create record", type="primary")
        if submitted:
            if not all([owner.strip(), survey.strip(), village.strip(), extent.strip()]):
                st.error("Please complete every record field.")
            else:
                upsert_item(
                    "records",
                    {
                        "id": new_id("rec"),
                        "owner": owner.strip(),
                        "survey": survey.strip(),
                        "village": village.strip(),
                        "extent": extent.strip(),
                        "status": status,
                    },
                )
                st.success("Record created.")
                st.rerun()

    with manage_col:
        st.markdown("#### Read, update, delete")
        query = st.text_input("Filter records")
        records = [record for record in data["records"] if matches_query(record, query)]
        for record in records:
            with st.expander(f"{record['owner']} | Survey {record['survey']} | {record['status']}"):
                with st.form(f"record_form_{record['id']}"):
                    owner = st.text_input("Owner", value=record["owner"], key=f"owner_{record['id']}")
                    survey = st.text_input("Survey number", value=record["survey"], key=f"survey_{record['id']}")
                    village = st.text_input("Village", value=record["village"], key=f"village_{record['id']}")
                    extent = st.text_input("Extent", value=record["extent"], key=f"extent_{record['id']}")
                    status = st.selectbox("Status", RECORD_STATUSES, index=RECORD_STATUSES.index(record["status"]) if record["status"] in RECORD_STATUSES else 0, key=f"status_{record['id']}")
                    save_clicked = st.form_submit_button("Save changes")
                delete_clicked = st.button("Delete record", key=f"delete_record_{record['id']}")

                if save_clicked:
                    upsert_item("records", {"id": record["id"], "owner": owner, "survey": survey, "village": village, "extent": extent, "status": status})
                    st.success("Record updated.")
                    st.rerun()
                if delete_clicked:
                    delete_item("records", record["id"])
                    st.success("Record deleted.")
                    st.rerun()


def render_request_admin(data: dict) -> None:
    st.subheader("Requests CRUD")
    create_col, manage_col = st.columns([0.9, 1.4])

    with create_col:
        st.markdown("#### Create request")
        with st.form("create_request_form", clear_on_submit=True):
            name = st.text_input("Citizen name")
            village = st.text_input("Village")
            service_type = st.selectbox("Service type", SERVICE_TYPES)
            status = st.selectbox("Status", REQUEST_STATUSES)
            details = st.text_area("Details")
            submitted = st.form_submit_button("Create request", type="primary")
        if submitted:
            if not all([name.strip(), village.strip(), details.strip()]):
                st.error("Please complete citizen name, village, and details.")
            else:
                upsert_item("requests", {"id": new_id("req"), "name": name.strip(), "village": village.strip(), "type": service_type, "details": details.strip(), "status": status})
                st.success("Request created.")
                st.rerun()

    with manage_col:
        st.markdown("#### Read, update, delete")
        query = st.text_input("Filter requests")
        requests = [request for request in data["requests"] if matches_query(request, query)]
        for request in requests:
            with st.expander(f"{request['type']} | {request['name']} | {request['status']}"):
                with st.form(f"request_form_{request['id']}"):
                    name = st.text_input("Citizen name", value=request["name"], key=f"name_{request['id']}")
                    village = st.text_input("Village", value=request["village"], key=f"village_req_{request['id']}")
                    type_index = SERVICE_TYPES.index(request["type"]) if request["type"] in SERVICE_TYPES else 0
                    service_type = st.selectbox("Service type", SERVICE_TYPES, index=type_index, key=f"type_{request['id']}")
                    status_index = REQUEST_STATUSES.index(request["status"]) if request["status"] in REQUEST_STATUSES else 0
                    status = st.selectbox("Status", REQUEST_STATUSES, index=status_index, key=f"req_status_{request['id']}")
                    details = st.text_area("Details", value=request["details"], key=f"details_{request['id']}")
                    save_clicked = st.form_submit_button("Save changes")
                delete_clicked = st.button("Delete request", key=f"delete_request_{request['id']}")

                if save_clicked:
                    upsert_item("requests", {"id": request["id"], "name": name, "village": village, "type": service_type, "details": details, "status": status})
                    st.success("Request updated.")
                    st.rerun()
                if delete_clicked:
                    delete_item("requests", request["id"])
                    st.success("Request deleted.")
                    st.rerun()


def render_upload_admin() -> None:
    st.subheader("Upload data")
    st.write("Upload a JSON file containing `records`, `requests`, or both. Existing items are replaced only when IDs match.")
    uploaded = st.file_uploader("Choose JSON data file", type=["json"])
    if uploaded and st.button("Import uploaded data", type="primary"):
        try:
            record_count, request_count = import_data(uploaded)
            st.success(f"Imported {record_count} records and {request_count} requests.")
            st.rerun()
        except Exception as error:
            st.error(f"Import failed: {error}")

    st.code(
        json.dumps(
            {
                "records": [{"owner": "Name", "survey": "12/A", "village": "Velpur", "extent": "1 acre", "status": "Verified"}],
                "requests": [{"name": "Citizen", "village": "Velpur", "type": "Income certificate", "details": "Need certificate", "status": "Open"}],
            },
            indent=2,
        ),
        language="json",
    )


def render_admin(data: dict) -> None:
    st.sidebar.markdown("## Admin console")
    page = st.sidebar.radio("Admin section", ["Overview", "Records CRUD", "Requests CRUD", "Upload data"])

    if page == "Overview":
        render_admin_overview(data)
    elif page == "Records CRUD":
        render_record_admin(data)
    elif page == "Requests CRUD":
        render_request_admin(data)
    else:
        render_upload_admin()


def main() -> None:
    st.set_page_config(page_title="Janmabhoomi Civic Desk", page_icon="JB", layout="wide")
    apply_theme()
    data = load_db()

    st.sidebar.markdown("# Janmabhoomi")
    role = st.sidebar.selectbox("Select interface", ["Consumer", "Admin"])

    if role == "Consumer":
        render_consumer(data)
    else:
        render_admin(data)


if __name__ == "__main__":
    main()
