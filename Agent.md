# Janmabhoomi Civic Desk

## Overview
Janmabhoomi Civic Desk is a digital platform designed to simplify access to land records and civic services for citizens in rural and semi-urban areas. The platform provides a citizen portal for accessing records and submitting requests, along with an admin dashboard for managing records and service requests.

## Problem Statement
Citizens often face delays and inconvenience when accessing land records and civic services due to fragmented systems, paper-based processes, and manual follow-ups. This results in low transparency and inefficient service delivery.

## Solution
Janmabhoomi Civic Desk provides a unified platform where citizens can:

- Search land records
- Submit civic service requests
- Track request status

Administrators can:

- Manage land records
- Process service requests
- Update request status
- Upload and maintain civic data

## Features

- Land Record Search
- Civic Service Request Submission
- Request Status Tracking
- Admin Dashboard
- CRUD Operations for Records and Requests
- JSON Data Upload Support

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js

### Database
- JSON File Storage

### API
- REST API

## Project Structure

```bash
Janmabhoomi-Civic-Desk/
│
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── styles.css
│   └── script.js
│
├── data/
│   ├── land_records.json
│   └── service_requests.json
│
├── server.js
├── package.json
└── README.md
```

## How to Run

### Clone the Repository

```bash
git clone https://code.swecha.org/sandeepballeda/janmabhoomi.git
cd janmabhoomi-civic-desk
```

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
node server.js
```

### Open in Browser

```text
http://localhost:3000
```

## Project Status

🚧 Currently under development as part of a hackathon project.

## Future Enhancements

- User Authentication
- SMS/Email Notifications
- GIS-Based Land Mapping
- Mobile Application
- Multi-Language Support
- Cloud Database Integration

## Team

**Team Name:** Janmabhoomi Civic Desk

### Members
- Tanishq Sugandhi
- Sandeep Balleda

## License

This project was developed for hackathon and educational purposes.