# PDF Annotation System

A collaborative web application for uploading PDF documents, adding annotations with role-based visibility controls, and managing documents. Built with React, Node.js, and MongoDB.

---

## 🎯 Project Overview

This application enables users to:
- ✅ Upload and manage PDF documents
- ✅ Add text annotations with visual markers on PDFs
- ✅ Control annotation visibility (everyone or specific users)
- ✅ Download documents
- ✅ Delete documents (admin only)
- ✅ Switch between different user roles
- ✅ View annotations with real-time updates

**Key Feature:** Annotations appear as blue dots on the PDF, with full visibility controls based on user roles.

---

## 🚀 Live Deployment

- Frontend: https://pdf-annotation-frontend.vercel.app
- Backend API: https://pdf-annotation-system.onrender.com
- GitHub Repository: https://github.com/DhananjayGanjam/PDF-Annotation-System

> Deployment Status:It is deployed but the backend is deployed on a free version of render and according to their policies the backend service is stopped if not used for 15 mins.

---

## 📋 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI Framework |
| TypeScript | Latest | Type Safety |
| Vite | Latest | Build Tool & Dev Server |
| Ant Design | 5+ | UI Components Library |
| CSS3 | Native | Styling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | v20.9.0+ | Runtime Environment |
| Express.js | 4+ | Web Framework |
| MongoDB | Latest | NoSQL Database |
| Mongoose | 7+ | ODM (Object Data Modeling) |
| Multer | 1.4+ | File Upload Handling |
| CORS | Latest | Cross-Origin Resource Sharing |

### Database
| Component | Details |
|-----------|---------|
| Database | MongoDB |
| Connection | MongoDB Atlas (Cloud) |
| Models | Document, Annotation |

---

## 📁 Project Structure

```
pdf-annotation-system/
│
├── frontend/                          # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── documentlist.tsx       # Document listing with search
│   │   │   ├── uploadpanel.tsx        # Single/Multiple PDF upload
│   │   │   ├── userswitcher.tsx       # User role switcher
│   │   │   └── PDFViewer.tsx          # PDF viewer with annotations
│   │   ├── App.tsx                    # Main application component
│   │   ├── main.tsx                   # React entry point
│   │   ├── index.ts                   # Axios configuration
│   │   └── styles/                    # Global styles
│   ├── public/                        # Static assets
│   ├── package.json                   # Frontend dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite configuration
│   └── .env.example                   # Environment variables template
│
├── backend/                           # Node.js API Server
│   ├── models/
│   │   ├── Document.js                # Document schema and model
│   │   └── Annotations.js             # Annotation schema and model
│   ├── routes/
│   │   ├── DocumentsUpload.js         # Document CRUD endpoints
│   │   └── CreateAnnotation.js        # Annotation CRUD endpoints
│   ├── middleware/
│   │   └── RolBasAcc.js               # Role-based access control
│   ├── uploads/                       # PDF storage directory
│   ├── server.js                      # Express server setup
│   ├── package.json                   # Backend dependencies
│   └── .env.example                   # Environment variables template
│
├── .gitignore                         # Git ignore rules
├── README.md                          # This file
└── .git/                              # Git repository
```

---

## 🛠️ Project Setup & Installation

### Prerequisites

Before starting, ensure you have:
- **Node.js:** v20.9.0 or higher
- **npm:** v10.2.3 or higher
- **MongoDB:** MongoDB Atlas account (free tier available)
- **Git:** For version control
- **Code Editor:** VS Code recommended

### Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.fgyxtha.mongodb.net/pdf-annotator?retryWrites=true&w=majority
NODE_ENV=development
```

#### Step 4: Start Backend Server
```bash
node server.js
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected
```

✅ Backend is now running on `http://localhost:5000`

---

### Frontend Setup

#### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 4: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v4.x.x build 0.00s

➜  Local:   http://localhost:5173/
```

✅ Frontend is now running on `http://localhost:5173`

---

## 👥 User Roles & Permissions

### Role-Based Access Control (RBAC)

#### Admin (A1)
```javascript
{
  role: 'admin',
  permissions: ['upload', 'view', 'annotate', 'edit_all', 'delete_all']
}
```
- Can upload documents
- Can view all documents
- Can add annotations
- Can edit/delete any annotation
- Can delete any document

#### Default User (D1, D2)
```javascript
{
  role: 'default',
  permissions: ['view', 'annotate', 'edit_own', 'delete_own']
}
```
- Can view all documents
- Can add annotations
- Can only edit/delete their own annotations
- Cannot delete documents

#### Read-only User (R1)
```javascript
{
  role: 'readonly',
  permissions: ['view']
}
```
- Can only view documents and annotations
- Cannot upload, annotate, or delete

---

## 📡 API Endpoints

### Documents API

#### Upload Single Document
```http
POST /api/documents/upload
```
- **Permission Required:** `upload`
- **Headers:** `x-user-id: A1`
- **Response:** Document object with ID, name, size, upload date

#### Upload Multiple Documents
```http
POST /api/documents/upload-multiple
```
- **Permission Required:** `upload`
- **Response:** Array of uploaded documents

#### Get All Documents
```http
GET /api/documents
```
- **Permission Required:** `view`
- **Response:** Array of all documents

#### Get Single Document
```http
GET /api/documents/:id
```
- **Permission Required:** `view`
- **Response:** Single document object

#### Download Document
```http
GET /api/documents/:id/download
```
- **Permission Required:** `view`
- **Response:** PDF file as attachment

#### Delete Document
```http
DELETE /api/documents/:id
```
- **Permission Required:**`annotate`
- Response: Success message


📝 Annotation Logic
How Annotations Work
Creating an Annotation

User clicks "Add Annotation" button in PDF viewer
Form appears with text input and visibility options
User selects visibility:

everyone: All users with view permission see it
specific: Only selected users see it


User clicks on PDF to set position (X%, Y% coordinates)
Position is stored as percentages for responsive design
Annotation saved to database with:

Creator ID (createdBy)
Document ID reference
Timestamps (createdAt, updatedAt)
Visibility settings



Storing Position Data
javascript// Position stored as percentage values
position: {
  x: 37.38,  // 37.38% from left
  y: 49.45   // 49.45% from top
}
Why percentages?

Works across different screen sizes
Consistent across zoom levels
Responsive design compatible

Displaying Annotations

Fetch annotations for current document
Filter by visibility:

Show if visibility = "everyone"
Show if visibility = "specific" AND user in visibleTo array


Render blue dots at stored positions on PDF
Blue dot properties:

Color: Blue (#1890ff) for normal, Red (#ff4d4f) when selected
Size: 20px diameter
Hover shows tooltip with creator and text
Click to highlight and view in sidebar



Visibility Control
javascript// Example: Filtering visible annotations
const visibleAnnotations = annotations.filter(ann => {
  if (ann.visibility === 'everyone') return true;
  if (ann.visibility === 'specific' && ann.visibleTo.includes(currentUser)) return true;
  return false;
});

🔐 Authentication & Authorization
Header-Based User Identification
Every API request must include:
Header: x-user-id: A1  // Must be uppercase
Role-Based Access Control (RBAC) Middleware
Located in backend/middleware/RolBasAcc.js:
javascriptconst ROLES = {
  A1: { role: 'admin', permissions: ['upload', 'view', 'annotate', 'edit_all', 'delete_all'] },
  D1: { role: 'default', permissions: ['view', 'annotate', 'edit_own', 'delete_own'] },
  D2: { role: 'default', permissions: ['view', 'annotate', 'edit_own', 'delete_own'] },
  R1: { role: 'readonly', permissions: ['view'] }
};

🚀 Deployment Guide
Deploy Backend (Render)

Push code to GitHub
Go to render.com
Create new Web Service
Connect GitHub repository
Configure Root Directory as backend
Add environment variables (MONGODB_URI, NODE_ENV, PORT)
Deploy

Deploy Frontend (Vercel)

Go to vercel.com
Import GitHub project
Configure Root Directory as frontend
Add environment variable (VITE_API_URL)
Deploy


📚 Database Schema
Document Model
javascript{
  _id: ObjectId,
  name: String,
  filename: String,
  filepath: String,
  uploader: String,
  size: Number,
  uploadDate: Date
}
Annotation Model
javascript{
  _id: ObjectId,
  documentId: ObjectId (ref: Document),
  createdBy: String,
  text: String,
  page: Number,
  position: {
    x: Number,    // Percentage
    y: Number     // Percentage
  },
  visibility: String,  // 'everyone' or 'specific'
  visibleTo: [String], // Array of user IDs
  createdAt: Date,
  updatedAt: Date
}

✅ Features Checklist

✅ User role selection (A1, D1, D2, R1)
✅ PDF upload (single & multiple)
✅ PDF viewer with iframe
✅ Add annotations with text
✅ Visual annotation markers (blue dots)
✅ Annotation visibility control
✅ Role-based access control
✅ Download documents
✅ Delete documents (admin)
✅ Search documents
✅ Real-time updates
✅ Error handling
✅ Responsive design
✅ Environment-based configuration

