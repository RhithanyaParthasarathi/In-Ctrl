# In-Ctrl
**In-Ctrl** is an AI Verification Documentor designed to address the "Hollow Commit" problem in AI-assisted software development. 

It acts as an Implementation Diary where developers verify AI-generated code, document alternative decisions, assess risk points, and ensure human mastery over the project's logic. Rather than just asking an AI to write code and blindly committing it, In-Ctrl forces the developer to understand *why* the code was written that way, what the alternatives were, and where it might fail.

## Tech Stack
*   **Backend:** Java 17, Spring Boot, Spring Web, Spring Data JPA
*   **Database:** H2 In-Memory Database
*   **Frontend:** Angular (TypeScript), RxJS, HTML/CSS
*   **AI Integration:** Google Gemini Pro API
*   **Version Control Integration:** GitHub REST API
*   **Deployment:** Docker, Docker Compose, Nginx Reverse Proxy
*   **CI/CD:** GitHub Actions (Automated AWS EC2 Deployment)

## Features & Verification
The core features revolve around syncing recent commits from GitHub, pasting the context of the AI conversation, and generating a detailed "Dev Log" that includes:
- **Per-File Logic Summary:** Lists libraries used and logical blocks. Users must confirm they understand these elements.
- **Path Comparison:** The AI suggests alternative ways the code *could* have been written. The user must document why the current path was chosen (the "Why Not" Analysis).
- **Stress Testing & Fault Prediction:** Highlights potential points of failure. The user must log a "Safety Plan".
- **Final Export:** A Master Knowledge Report assembling the entire audit.

For a detailed breakdown of the features and requirements, please see [user_stories.md](./user_stories.md).

---

## Docker Setup & Local Development

This repository contains `Dockerfile`s for both the frontend and backend, and the `.github/workflows/ci-cd.yml` pipeline is fully configured to automatically build and push these images to Docker Hub.

### Running the Application Locally
Anyone can download and run the entire dashboard locally using these simple commands. You do not need Java or Node.js installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RhithanyaParthasarathi/In-Ctrl.git
   cd In-Ctrl
   ```
2. **Configure your API Key:**
   Create a file named `.env` in the root directory (exactly where `docker-compose.yml` is) and paste your Gemini API key inside it:
   ```ini
   GEMINI_API_KEY="AIzaSyYourSecretKeyHere"
   ```
3. **Boot the Application:**
   ```bash
   docker-compose up -d
   ```
4. **Access the Dashboard:**
   Open your browser and navigate to **http://localhost**.

---

## Cloud Deployment (AWS EC2)

This project features a fully automated Continuous Deployment (CD) pipeline configured via GitHub Actions (`.github/workflows/ci-cd.yml`).

Upon pushing to the `main` branch, the pipeline automatically:
1. Compiles the Java backend and Angular frontend.
2. Builds Docker images and pushes them to Docker Hub.
3. Securely SSHs into the production AWS EC2 Ubuntu instance.
4. Installs Docker/Docker-Compose (if missing).
5. Injects the `PROD_GEMINI_API_KEY` from GitHub Secrets into an isolated `.env` file on the server.
6. Pulls the latest images and restarts the live server.

**Note:** The current deployment is a **Single-User Architecture**, meaning the AWS EC2 instance connects to a single unified H2 database representing the server owner's data.

---

## Future Enhancements (SaaS Roadmap)

To evolve In-Ctrl from a single-user hosted tool into a multi-tenant SaaS application, the fundamental next steps involve implementing **Multi-User Identity & Data Isolation**:

- **Authentication System:** Integrate Spring Security to provide `/api/login` and `/api/register` capabilities, utilizing stateless JWT (JSON Web Tokens) or OAuth2 (e.g., GitHub Login).
- **Database Schema Upgrades:** Migrate from the embedded H2 database to a robust relational DB like PostgreSQL. Add a `user_id` column to the `AuditedCommit` and `Note` tables.
- **Frontend Auth Guards:** Create Login UI screens in Angular, storing the session token securely and injecting it as an Authorization header in all `ApiService` calls.
- **Query Isolation:** Modify the backend JPA Repository queries to strictly filter `getHistory()` and `getNotes()` by the currently authenticated user session.
