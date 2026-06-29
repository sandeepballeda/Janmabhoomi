const state = {
  records: [],
  requests: [],
  role: "consumer"
};

const els = {
  apiStatus: document.querySelector("#apiStatus"),
  roleSelect: document.querySelector("#roleSelect"),
  consumerApp: document.querySelector("#consumerApp"),
  adminApp: document.querySelector("#adminApp"),
  consumerSearch: document.querySelector("#consumerSearch"),
  consumerRecordsList: document.querySelector("#consumerRecordsList"),
  consumerRequestsList: document.querySelector("#consumerRequestsList"),
  consumerRequestForm: document.querySelector("#consumerRequestForm"),
  adminRecordCount: document.querySelector("#adminRecordCount"),
  adminRequestCount: document.querySelector("#adminRequestCount"),
  adminOpenCount: document.querySelector("#adminOpenCount"),
  adminVerifiedCount: document.querySelector("#adminVerifiedCount"),
  adminFeed: document.querySelector("#adminFeed"),
  adminRecordsList: document.querySelector("#adminRecordsList"),
  adminRequestsList: document.querySelector("#adminRequestsList"),
  adminRecordSearch: document.querySelector("#adminRecordSearch"),
  adminRequestSearch: document.querySelector("#adminRequestSearch"),
  recordForm: document.querySelector("#recordForm"),
  adminRequestForm: document.querySelector("#adminRequestForm"),
  recordFormTitle: document.querySelector("#recordFormTitle"),
  requestFormTitle: document.querySelector("#requestFormTitle"),
  dataUpload: document.querySelector("#dataUpload"),
  toast: document.querySelector("#toast")
};

const recordStatuses = ["Verified", "Needs survey", "Dispute review"];
const requestStatuses = ["Open", "Review", "Closed"];

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function statusClass(value) {
  return String(value).toLowerCase().replace(/[^a-z]+/g, " ").trim().split(" ")[0] || "open";
}

async function loadData() {
  try {
    const data = await api("/api/data");
    state.records = data.records;
    state.requests = data.requests;
    els.apiStatus.textContent = "Backend online";
    els.apiStatus.className = "api-status ok";
    renderAll();
  } catch (error) {
    els.apiStatus.textContent = "Backend offline";
    els.apiStatus.className = "api-status fail";
    showToast("Start the backend with: node server.js");
  }
}

function setRole(role) {
  state.role = role;
  els.consumerApp.classList.toggle("active", role === "consumer");
  els.adminApp.classList.toggle("active", role === "admin");
  document.body.dataset.role = role;
}

function setAdminView(viewId) {
  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminView === viewId);
  });
  document.querySelectorAll(".admin-view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
}

function matchesQuery(item, query) {
  const normalized = query.trim().toLowerCase();
  return Object.values(item).some((value) => String(value).toLowerCase().includes(normalized));
}

function renderConsumer() {
  const query = els.consumerSearch.value;
  const records = state.records.filter((record) => matchesQuery(record, query));
  els.consumerRecordsList.innerHTML = records.length
    ? records
        .map(
          (record) => `
            <article class="record-card">
              <div>
                <strong>${record.owner}</strong>
                <span class="record-meta">${record.village}</span>
              </div>
              <span>Survey ${record.survey}</span>
              <span>${record.extent}</span>
              <span class="badge ${statusClass(record.status)}">${record.status}</span>
            </article>
          `
        )
        .join("")
    : `<article class="record-card"><strong>No matching records found</strong></article>`;

  els.consumerRequestsList.innerHTML = state.requests
    .slice(0, 6)
    .map(
      (request) => `
        <article class="request-card">
          <div>
            <strong>${request.type}</strong>
            <small>${request.name} - ${request.village}</small>
            <small>${request.details}</small>
          </div>
          <span class="badge ${statusClass(request.status)}">${request.status}</span>
        </article>
      `
    )
    .join("");
}

function renderAdmin() {
  const openRequests = state.requests.filter((request) => request.status !== "Closed").length;
  els.adminRecordCount.textContent = state.records.length;
  els.adminRequestCount.textContent = state.requests.length;
  els.adminOpenCount.textContent = openRequests;
  els.adminVerifiedCount.textContent = state.records.filter((record) => record.status === "Verified").length;

  els.adminFeed.innerHTML = state.requests
    .slice(0, 5)
    .map(
      (request) => `
        <article class="request-card">
          <div>
            <strong>${request.type}</strong>
            <small>${request.name} - ${request.village}</small>
          </div>
          <span class="badge ${statusClass(request.status)}">${request.status}</span>
        </article>
      `
    )
    .join("");

  const recordQuery = els.adminRecordSearch.value;
  els.adminRecordsList.innerHTML = state.records
    .filter((record) => matchesQuery(record, recordQuery))
    .map(
      (record) => `
        <article class="admin-row">
          <div>
            <strong>${record.owner}</strong>
            <small>${record.village} - Survey ${record.survey} - ${record.extent} - ${record.status}</small>
          </div>
          <div class="row-actions">
            <select class="status-select" data-record-status="${record.id}" aria-label="Record status">
              ${recordStatuses.map((status) => `<option ${status === record.status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <button class="ghost-button" data-edit-record="${record.id}">Edit</button>
            <button class="danger-button" data-delete-record="${record.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  const requestQuery = els.adminRequestSearch.value;
  els.adminRequestsList.innerHTML = state.requests
    .filter((request) => matchesQuery(request, requestQuery))
    .map(
      (request) => `
        <article class="admin-row">
          <div>
            <strong>${request.type}</strong>
            <small>${request.name} - ${request.village} - ${request.status}</small>
            <small>${request.details}</small>
          </div>
          <div class="row-actions">
            <select class="status-select" data-request-status="${request.id}" aria-label="Request status">
              ${requestStatuses.map((status) => `<option ${status === request.status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <button class="ghost-button" data-edit-request="${request.id}">Edit</button>
            <button class="danger-button" data-delete-request="${request.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAll() {
  renderConsumer();
  renderAdmin();
}

function resetRecordForm() {
  els.recordForm.reset();
  els.recordForm.elements.id.value = "";
  els.recordFormTitle.textContent = "Create land record";
}

function resetRequestForm() {
  els.adminRequestForm.reset();
  els.adminRequestForm.elements.id.value = "";
  els.requestFormTitle.textContent = "Create request";
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function saveRecord(event) {
  event.preventDefault();
  const payload = formObject(els.recordForm);
  const id = payload.id;
  delete payload.id;
  if (id) {
    await api(`/api/records/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    showToast("Record updated");
  } else {
    await api("/api/records", { method: "POST", body: JSON.stringify(payload) });
    showToast("Record created");
  }
  resetRecordForm();
  await loadData();
}

async function saveRequest(event) {
  event.preventDefault();
  const payload = formObject(els.adminRequestForm);
  const id = payload.id;
  delete payload.id;
  if (id) {
    await api(`/api/requests/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    showToast("Request updated");
  } else {
    await api("/api/requests", { method: "POST", body: JSON.stringify(payload) });
    showToast("Request created");
  }
  resetRequestForm();
  await loadData();
}

els.roleSelect.addEventListener("change", (event) => setRole(event.target.value));
els.consumerSearch.addEventListener("input", renderConsumer);
els.adminRecordSearch.addEventListener("input", renderAdmin);
els.adminRequestSearch.addEventListener("input", renderAdmin);

document.querySelectorAll(".admin-tab").forEach((button) => {
  button.addEventListener("click", () => setAdminView(button.dataset.adminView));
});

document.body.addEventListener("change", async (event) => {
  const recordId = event.target.dataset.recordStatus;
  const requestId = event.target.dataset.requestStatus;

  if (recordId) {
    const record = state.records.find((item) => item.id === recordId);
    await api(`/api/records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify({ ...record, status: event.target.value })
    });
    showToast("Record status updated");
    await loadData();
  }

  if (requestId) {
    const request = state.requests.find((item) => item.id === requestId);
    await api(`/api/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify({ ...request, status: event.target.value })
    });
    showToast("Request status updated");
    await loadData();
  }
});

els.consumerRequestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { ...formObject(els.consumerRequestForm), status: "Open" };
  await api("/api/requests", { method: "POST", body: JSON.stringify(payload) });
  els.consumerRequestForm.reset();
  showToast("Request submitted");
  await loadData();
});

els.recordForm.addEventListener("submit", saveRecord);
els.adminRequestForm.addEventListener("submit", saveRequest);
document.querySelector("#cancelRecordEdit").addEventListener("click", resetRecordForm);
document.querySelector("#cancelRequestEdit").addEventListener("click", resetRequestForm);

document.body.addEventListener("click", async (event) => {
  const recordEditId = event.target.dataset.editRecord;
  const recordDeleteId = event.target.dataset.deleteRecord;
  const requestEditId = event.target.dataset.editRequest;
  const requestDeleteId = event.target.dataset.deleteRequest;

  if (recordEditId) {
    const record = state.records.find((item) => item.id === recordEditId);
    Object.entries(record).forEach(([key, value]) => {
      if (els.recordForm.elements[key]) els.recordForm.elements[key].value = value;
    });
    els.recordFormTitle.textContent = "Update land record";
  }

  if (requestEditId) {
    const request = state.requests.find((item) => item.id === requestEditId);
    Object.entries(request).forEach(([key, value]) => {
      if (els.adminRequestForm.elements[key]) els.adminRequestForm.elements[key].value = value;
    });
    els.requestFormTitle.textContent = "Update request";
  }

  if (recordDeleteId && window.confirm("Delete this land record?")) {
    await api(`/api/records/${recordDeleteId}`, { method: "DELETE" });
    showToast("Record deleted");
    await loadData();
  }

  if (requestDeleteId && window.confirm("Delete this request?")) {
    await api(`/api/requests/${requestDeleteId}`, { method: "DELETE" });
    showToast("Request deleted");
    await loadData();
  }
});

els.dataUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const data = JSON.parse(await file.text());
  await api("/api/import", { method: "POST", body: JSON.stringify(data) });
  event.target.value = "";
  showToast("Data uploaded");
  await loadData();
});

setRole("consumer");
loadData();
