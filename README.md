# ☁️ Online Hobby & Skills Tracker with Community Sharing on Cloud

A cloud-based full-stack application for managing hobbies, learning goals, practice sessions, achievements, and skill development. The platform combines **cloud authentication, cloud database, object storage, analytics, serverless processing, and community sharing** into a single application.

Users can create and manage hobbies and skills, set goals, record practice sessions, monitor progress and streaks, upload achievement evidence, and share their achievements through a community feed.

---

## 📌 Overview

People often start learning a new skill or hobby but lose consistency because they lack structure, progress visibility, and accountability.

The **Online Hobby & Skills Tracker** addresses this problem by providing a centralized cloud platform where users can:

* Create personal profiles
* Add hobbies and skills
* Set learning goals
* Record practice sessions
* Track progress and streaks
* Achieve milestones and badges
* Upload images and certificates
* Share achievements with a community
* Like and comment on posts
* View analytics dashboards
* Access their data from multiple devices

The project is primarily designed as a **Cloud Computing project**, demonstrating practical concepts such as cloud databases, authentication, object storage, serverless functions, REST APIs, scalability, security, and cloud deployment.

---

## 🎯 Objectives

The major objectives are:

1. Build a cloud-hosted full-stack application.
2. Implement secure user authentication.
3. Store user information in a cloud database.
4. Store images and files using cloud object storage.
5. Track hobbies, skills, goals, and practice sessions.
6. Calculate progress and practice streaks.
7. Provide a community sharing platform.
8. Implement likes and comments.
9. Generate user progress analytics.
10. Demonstrate serverless cloud computing.
11. Implement cloud security and authorization.
12. Design the system for scalability.
13. Provide local development and cloud deployment options.

---

## ✨ Features

### 👤 User Management

* User registration and login
* Secure authentication
* User profiles
* Profile pictures
* Personal biography
* Interests
* Public profile

### 🎯 Hobby & Skill Management

Users can create skills and hobbies such as:

* Coding
* Photography
* Guitar
* Painting
* Fitness
* Cooking
* Chess
* Writing
* Video Editing
* Graphic Design

Each skill can contain:

* Skill name
* Category
* Current level
* Target level
* Start date
* Target date
* Status
* Description

Supported levels:

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

Supported statuses:

```text
ACTIVE
PAUSED
COMPLETED
```

---

## 📚 Goal & Milestone Tracking

Users can define measurable learning goals.

### Example

```text
Skill: Guitar

Goal: Practice 30 hours

Target: 30 hours
Completed: 18 hours

Progress:
60%
```

Progress is calculated as:

```text
Progress (%) = (Current Value / Target Value) × 100
```

Example milestones:

```text
5 Hours
10 Hours
20 Hours
30 Hours
```

---

## ⏱️ Practice Session Tracking

Users can record each practice session.

A practice session contains:

```text
Skill
Date
Duration
Activity
Notes
```

Example:

```text
Skill: Photography

Duration: 60 minutes

Activity:
Practiced portrait photography

Notes:
Worked on natural-light composition.
```

The system can calculate:

* Total practice time
* Weekly practice
* Monthly practice
* Goal progress
* Current streak
* Longest streak

---

## 🔥 Streak & Badge System

The platform converts practice logs into meaningful progress information.

Example badges:

```text
7-Day Streak
1000 Minutes Practiced
Goal Completed
First Achievement
```

A cloud function can automatically process a newly created practice log and update the user's statistics.

Example statistics:

```text
Total Practice Minutes
Current Streak
Weekly Practice
Badges
Last Practice Date
```

---

## 🏆 Community Sharing

Users can share achievements with the community.

Example:

> "Completed 30 hours of guitar practice! 🎸"

A post can contain:

* Text
* Skill/hobby
* Achievement
* Image
* Timestamp

The community feed supports:

* Posts
* Likes
* Comments
* User profiles
* Achievement sharing
* Optional following system

---

## ❤️ Likes & 💬 Comments

Users can interact with community posts.

Supported operations:

```text
Like Post
Unlike Post
Add Comment
Delete Own Comment
```

Security rules ensure users cannot modify another user's content.

Duplicate likes are prevented by using the user's unique ID as part of the like document.

---

## 📊 Analytics Dashboard

The personal dashboard provides insights into learning activity.

### Key metrics

* Total Practice Hours
* Weekly Practice Hours
* Monthly Practice Hours
* Most Practiced Skill
* Current Streak
* Longest Streak
* Goals Completed
* Active Goals
* Milestones Achieved
* Posts Created
* Likes Received
* Comments Received

### Dashboard visualizations

```text
Practice Hours by Skill
Weekly Practice Trend
Monthly Progress
Goal Completion
Skill Distribution
```

---

# ☁️ Cloud Computing Architecture

The basic architecture is:

```text
                    ┌─────────────────┐
                    │      Users      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Authentication  │
                    │     Service     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Cloud / REST  │
                    │       API       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ Cloud DB   │ │   Object   │ │ Analytics  │
       │ Firestore  │ │  Storage   │ │  Service   │
       └────────────┘ └────────────┘ └────────────┘
              │
              ▼
       ┌────────────────┐
       │ Community Feed │
       └────────────────┘
```

---

# 🏗️ Advanced Cloud Architecture

For a more production-oriented deployment:

```text
                    ┌──────────────┐
                    │    Users     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     CDN      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Frontend   │
                    │    React     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ API Gateway  │
                    └──────┬───────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │ Backend / Serverless│
                 │      Functions      │
                 └──────────┬──────────┘
                            │
            ┌───────────────┼────────────────┐
            ▼               ▼                ▼
     ┌────────────┐  ┌────────────┐   ┌───────────┐
     │ Managed DB │  │   Object   │   │   Cache   │
     │            │  │  Storage   │   │           │
     └────────────┘  └────────────┘   └───────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Monitoring │
                    │  & Logging   │
                    └──────────────┘
```

---

# ☁️ Cloud Computing Concepts Demonstrated

| Cloud Concept             | Implementation                                       |
| ------------------------- | ---------------------------------------------------- |
| Cloud Computing           | Cloud-hosted application                             |
| SaaS                      | Users access the application through a web interface |
| PaaS                      | Firebase and managed cloud services                  |
| Authentication            | Firebase Authentication                              |
| Authorization             | Database security rules                              |
| Cloud Database            | Firestore                                            |
| Object Storage            | Firebase Storage                                     |
| REST API                  | Backend/application APIs                             |
| Serverless Computing      | Firebase Cloud Functions                             |
| Event-Driven Architecture | Functions triggered by database events               |
| Scalability               | Managed cloud services                               |
| Availability              | Cloud-hosted services                                |
| CDN                       | Optional production architecture                     |
| API Gateway               | Advanced deployment architecture                     |
| Caching                   | Optional performance layer                           |
| Environment Variables     | Secure configuration                                 |
| Secrets Management        | Credentials kept outside source code                 |
| Logging                   | Backend/cloud logs                                   |
| Monitoring                | Cloud monitoring services                            |
| Backup                    | Database/storage backup strategy                     |
| CI/CD                     | GitHub-based deployment pipeline                     |
| Cloud Deployment          | Firebase / Cloud Run / AWS / Azure / GCP             |

---

# 🛠️ Technology Stack

## Recommended Version

### Frontend

```text
React
JavaScript
HTML5
CSS3
```

### Cloud

```text
Firebase Authentication
Cloud Firestore
Firebase Storage
Firebase Cloud Functions
Firebase Hosting
```

### Optional Backend / AI

```text
Python
Flask / FastAPI
Cloud Run
Sentence-BERT
```

### Development

```text
Git
GitHub
VS Code
Node.js
npm
Python
```

---

# 🗄️ Database Design

The project uses a cloud database to store structured application data.

A simplified Firestore structure is:

```text
/users/{uid}
    └── profile

    └── hobbies/{hid}

    └── logs/{logId}

    └── stats/main

/posts/{postId}
    ├── likes/{uid}
    └── comments/{cid}
```

### User Profile

```text
/users/{uid}/profile

{
    name,
    bio,
    avatarUrl,
    interests,
    createdAt
}
```

### Hobby

```text
/users/{uid}/hobbies/{hid}

{
    title,
    category,
    goal_per_week,
    minutes_per_session,
    createdAt
}
```

### Practice Log

```text
/users/{uid}/logs/{logId}

{
    hid,
    date,
    minutes,
    notes,
    mediaUrl,
    createdAt
}
```

### Community Post

```text
/posts/{postId}

{
    uid,
    hid,
    text,
    mediaUrl,
    createdAt,
    likes,
    comments,
    visibility
}
```

---

# 🗂️ Cloud Object Storage

Actual files are stored separately from database records.

### Stored files may include:

* Profile pictures
* Achievement images
* Certificates
* Project screenshots
* Hobby photographs
* Community post attachments
* Optional practice videos

Example:

```text
users/
└── user_001/
    ├── profile/
    │   └── profile.jpg
    │
    ├── skills/
    │   └── photography/
    │       └── achievement_001.jpg
    │
    └── posts/
        └── post_001/
            └── image.jpg
```

The database stores the metadata and reference URL, while object storage stores the actual file.

---

# 🔐 Authentication & Security

Security is an important component of the project.

The system should implement:

* User authentication
* Authorization
* HTTPS
* Secure password handling
* Database security rules
* Object-storage permissions
* File-type validation
* File-size validation
* Input validation
* XSS protection
* API protection
* Rate limiting
* Environment variables
* Secrets management
* Logging
* Monitoring
* Backup

### Important rule

Never commit:

```text
API keys
Passwords
Private keys
Cloud credentials
Secret tokens
.env files
```

Use:

```text
.env
.env.example
```

and environment variables instead.

---

# 🔒 Data Privacy

The application separates private user information from public community content.

Users should only be able to modify their own:

* Profile
* Skills
* Practice logs
* Goals
* Private files

Community content can be controlled through visibility settings such as:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

The system should also support future features such as:

* User blocking
* Content reporting
* Comment moderation
* Account deletion
* Data deletion
* Privacy settings

---

# 🚀 Scalability

The architecture can evolve from a small student project to a larger cloud application.

### 10 Users

```text
React
   ↓
Firebase
   ↓
Firestore + Storage
```

### 1,000 Users

Introduce:

```text
Database indexes
Pagination
Cloud Functions
Caching
CDN
```

### 100,000+ Users

Potential architecture:

```text
CDN
 ↓
Load Balancer / API Gateway
 ↓
Serverless Backend
 ↓
Managed Database
 ↓
Cache
 ↓
Object Storage
 ↓
Background Workers / Queues
```

The community feed becomes more challenging as the number of posts and users increases. Large-scale implementations may need strategies such as **fan-out on read** or **fan-out on write**, pagination, indexing, caching, and asynchronous processing.

---

# 🤖 Optional AI Module

An optional AI component can provide personalized hobby recommendations.

The proposed approach uses:

```text
Sentence-BERT
      ↓
User Interest Embedding
      ↓
Hobby Embeddings
      ↓
Cosine Similarity
      ↓
Recommended Hobbies
```

Example:

```text
User Interests:
music, programming, creativity

Possible Recommendations:
Guitar
Music Production
Creative Coding
Video Editing
```

The AI service can be deployed separately using Flask/FastAPI and Cloud Run.

---

# 📡 Optional IoT Extension

The project can also be extended with an **ESP32 + RC522 RFID/NFC** system.

Example:

```text
        RFID/NFC Tag
              │
              ▼
          ┌───────┐
          │ RC522 │
          └───┬───┘
              │ SPI
              ▼
          ┌───────┐
          │ ESP32 │
          └───┬───┘
              │ Wi-Fi
              ▼
       Cloud Function
              │
              ▼
       Firestore Log
              │
              ▼
       Practice Dashboard
```

A user could tap an NFC tag associated with a hobby to quickly record a practice session.

---

# 📁 Project Structure

```text
Cloud-Hobby-Skills-Tracker/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   └── utils/
│
├── cloud/
│   ├── database_service.py
│   ├── storage_service.py
│   └── auth_service.py
│
├── analytics/
│   └── progress_service.py
│
├── functions/
│   └── index.js
│
├── tests/
│
├── sample_data/
│
├── screenshots/
│
├── docs/
│
├── reports/
│
├── README.md
├── requirements.txt
├── package.json
├── .env.example
└── .gitignore
```

---

# ⚙️ Local Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Cloud-Hobby-Skills-Tracker.git

cd Cloud-Hobby-Skills-Tracker
```

## 2. Create Python environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

## 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

## 4. Install frontend dependencies

```bash
cd frontend
npm install
```

## 5. Configure environment variables

Create:

```text
.env
```

based on:

```text
.env.example
```

Never commit `.env` to GitHub.

---

# 🔥 Firebase Configuration

Create a Firebase project and configure:

```text
Authentication
Firestore Database
Storage
Cloud Functions
Hosting
```

The React application should initialize Firebase through environment variables.

Example:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    // Load configuration from environment variables
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

# ▶️ Running the Application

Start the backend:

```bash
python app.py
```

Start the React frontend:

```bash
cd frontend
npm run dev
```

The application can then be accessed through the local development URL displayed by Vite.

---

# 🧪 Testing

The project should test the complete application workflow.

### Core test cases

```text
User registration
Duplicate registration
Valid login
Invalid login
Profile update
Add skill
Update skill
Delete skill
Create goal
Log practice
Progress calculation
Milestone completion
File upload
Invalid file upload
Create post
Retrieve feed
Like post
Duplicate like prevention
Unlike post
Add comment
Unauthorized deletion
Analytics calculation
User-data isolation
Authentication expiry
Logout
```

---

# 🔄 End-to-End Workflow

The main demonstration workflow is:

```text
Register
   ↓
Login
   ↓
Create Profile
   ↓
Create Hobby
   ↓
Set Goal
   ↓
Log Practice
   ↓
Progress Updated
   ↓
Streak Updated
   ↓
Milestone Achieved
   ↓
Upload Achievement
   ↓
Create Community Post
   ↓
Community Feed
   ↓
Another User Likes
   ↓
Another User Comments
   ↓
Analytics Updated
```

---

# ☁️ Cloud Deployment

## Firebase Deployment

Build the React application:

```bash
npm run build
```

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

Login:

```bash
firebase login
```

Initialize the project:

```bash
firebase init
```

Select the required services:

```text
Hosting
Firestore
Functions
Storage
Emulators (optional)
```

Deploy:

```bash
firebase deploy
```

---

# 🐳 Optional Cloud Run AI Service

For the optional Flask AI service:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

ENV PORT=8080

CMD ["python", "-m", "flask", "--app", "app:app", "run",
     "--host=0.0.0.0", "--port=8080"]
```

This service can provide endpoints such as:

```text
POST /suggest
```

for personalized hobby recommendations.

---

# 📈 Development Roadmap

### Phase 1 — Foundation

* [ ] Create repository
* [ ] Configure React
* [ ] Configure Firebase
* [ ] Create application architecture

### Phase 2 — Authentication

* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Authorization

### Phase 3 — User Profiles

* [ ] Profile creation
* [ ] Profile editing
* [ ] Profile picture upload

### Phase 4 — Skill Tracking

* [ ] Add skill
* [ ] Update skill
* [ ] Delete skill
* [ ] Skill dashboard

### Phase 5 — Practice Tracking

* [ ] Practice sessions
* [ ] Total practice
* [ ] Weekly statistics
* [ ] Monthly statistics
* [ ] Streak calculation

### Phase 6 — Goals

* [ ] Goals
* [ ] Milestones
* [ ] Progress calculation
* [ ] Badges

### Phase 7 — Cloud Storage

* [ ] Image upload
* [ ] Achievement upload
* [ ] File validation
* [ ] Storage security

### Phase 8 — Community

* [ ] Create posts
* [ ] Feed
* [ ] Likes
* [ ] Comments

### Phase 9 — Analytics

* [ ] Dashboard
* [ ] Charts
* [ ] Statistics
* [ ] Progress visualization

### Phase 10 — Cloud Deployment

* [ ] Firebase Hosting
* [ ] Cloud Functions
* [ ] Cloud Storage
* [ ] Production security
* [ ] Monitoring

### Phase 11 — Advanced Features

* [ ] AI recommendations
* [ ] Following
* [ ] Weekly recap
* [ ] NFC practice logging
* [ ] Content moderation

---

# 📸 Recommended Screenshots

For the GitHub repository, include screenshots such as:

```text
screenshots/
├── architecture.png
├── registration.png
├── login.png
├── profile.png
├── add-skill.png
├── skill-dashboard.png
├── goal.png
├── practice-session.png
├── progress.png
├── milestone.png
├── analytics.png
├── firebase-database.png
├── storage.png
├── create-post.png
├── community-feed.png
├── likes-comments.png
├── api-response.png
├── automated-tests.png
└── deployed-app.png
```

---

# 🧑‍💻 GitHub Workflow

Initialize Git:

```bash
git init
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Initialize cloud hobby and skills tracker"
```

Rename branch:

```bash
git branch -M main
```

Add remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Cloud-Hobby-Skills-Tracker.git
```

Push:

```bash
git push -u origin main
```

---

# 📝 Recommended Commit History

Use meaningful commits such as:

```text
Create cloud application architecture
Implement user authentication
Add user profile management
Implement hobby and skill tracking
Add practice session tracking
Implement goals and milestones
Integrate cloud database
Add cloud object storage
Build community sharing module
Implement likes and comments
Add progress analytics dashboard
Add cloud security controls
Add automated tests
Deploy application to cloud
Complete README and documentation
```

This makes the repository demonstrate the actual development process rather than appearing as a single uploaded project.

---

# 🔐 Security Checklist

Before making the repository public:

* [ ] Remove `.env`
* [ ] Remove API keys
* [ ] Remove service-account credentials
* [ ] Remove private keys
* [ ] Use `.env.example`
* [ ] Validate file uploads
* [ ] Configure Firestore rules
* [ ] Configure Storage rules
* [ ] Test authorization
* [ ] Test user-data isolation
* [ ] Enable HTTPS
* [ ] Review public API endpoints
* [ ] Use synthetic/demo users only

---

# ⚠️ Limitations

Current limitations may include:

* Cloud-service dependency
* Free-tier resource limitations
* Basic community moderation
* Simplified recommendation system
* Basic streak calculation
* Limited large-scale feed optimization
* Advanced caching not implemented in the basic version
* Enterprise-level monitoring not included in the MVP
* AI functionality is optional

---

# 🚀 Future Improvements

Potential future enhancements include:

* Mobile application
* AI-powered hobby recommendations
* AI learning-plan generation
* Practice buddy matching
* Following system
* Private groups
* Instructor/coach dashboard
* Weekly progress reports
* Push notifications
* Email notifications
* CSV/PDF progress reports
* Advanced moderation
* Recommendation engine
* Gamification
* Leaderboards
* NFC-based practice logging
* Advanced analytics
* Multi-region deployment
* CDN and distributed caching

---

# 🎓 Learning Outcomes

This project provides practical experience in:

* Cloud Computing
* Full-Stack Development
* React
* Firebase
* Firestore
* Cloud Storage
* Authentication
* Authorization
* REST APIs
* Serverless Computing
* Event-Driven Architecture
* Cloud Security
* Database Design
* Object Storage
* Data Analytics
* Git
* GitHub
* Cloud Deployment
* Testing
* Scalability

---

# 💼 Project Value

This project demonstrates more than frontend development.

It shows practical understanding of:

```text
Cloud Architecture
       +
Authentication
       +
Cloud Database
       +
Object Storage
       +
Serverless Functions
       +
REST APIs
       +
Analytics
       +
Security
       +
Scalability
       +
Deployment
```

The architecture is therefore suitable as a **Cloud Computing course project, academic project, portfolio project, and GitHub proof-of-work project**.

---

# 📄 Project Information

**Project:** Online Hobby & Skills Tracker with Community Sharing on Cloud

**Repository:** `Cloud-Hobby-Skills-Tracker`

**Primary Domain:** Cloud Computing

**Architecture:** Full-Stack Cloud Application

**Frontend:** React

**Cloud Platform:** Firebase

**Database:** Cloud Firestore

**Storage:** Firebase Cloud Storage

**Authentication:** Firebase Authentication

**Serverless:** Firebase Cloud Functions

**Optional AI:** Python + Sentence-BERT + Cloud Run

**Optional IoT:** ESP32 + RC522

---

# 👨‍💻 Author

**Your Name**

Abhishek Basu — Embedded Systems Student GitHub: [DevAbhay2003](https://github.com/DevAbhay2003?tab=repositories) · LinkedIn: [Abhishek Basu](https://www.linkedin.com/in/abhishek-basu-68b1b1342/)

---

# ⭐ Acknowledgement

This project was developed as an educational Cloud Computing project to demonstrate practical implementation of cloud services, distributed application concepts, authentication, cloud storage, database management, analytics, security, and scalable application architecture.

---

## ⭐ If you find this project useful

Consider giving the repository a ⭐ and exploring the implementation.
