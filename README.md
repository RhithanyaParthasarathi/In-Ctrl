# In-Ctrl: AI Verification Documentor 

**In-Ctrl** is a specialized dashboard designed to solve the "Hollow Commit" problem in AI-assisted software development. 

With the rise of AI coding assistants, it is dangerously easy to generate code and blindly commit it without truly understanding the underlying logic. **In-Ctrl** acts as an Implementation Diary where developers verify AI-generated code, document alternative decisions, assess risk points, and ensure human mastery over the project's logic.

Rather than just asking an AI to write code, In-Ctrl forces the developer to understand *why* the code was written that way, what the alternatives were, and where it might fail.

---

## Tech Stack
*   **Backend:** Java 17, Spring Boot, Spring Web, Spring Data JPA
*   **Database:** H2 In-Memory Database
*   **Frontend:** Angular (TypeScript), RxJS, HTML/CSS
*   **AI Integration:** Google Gemini Pro API
*   **Version Control Integration:** GitHub REST API
*   **Deployment:** Docker, Docker Compose, GitHub Actions (CI/CD)

---

## Features & Capabilities

### 1. Unified Context Ingestion
Users provide their GitHub repository URL and paste their raw AI chat logs (from ChatGPT, Claude, etc.). The backend fetches the raw commit diffs via the GitHub API and merges them with the AI instructions to provide full context to the analysis engine.

### 2. The Knowledge Audit
The system forces the developer to "re-learn" their codebase by generating a plain-language summary of what was written. 
- **Per-File Logic Summary:** Lists libraries used (e.g., "Spring Data JPA") and logical blocks. Users must confirm they understand these elements.
- **Path Comparison:** The AI suggests two alternative ways the code *could* have been written. The user must document why the current path was chosen over the alternatives (the "Why Not" Analysis).

### 3. Defensive Auditing & Fault Prediction
The system acts as an architect, highlighting potential points of failure (Faults) in the committed code.
- **Stress Testing:** Identifies weak spots (e.g., "No retry on API failure" or "Risk of OutOfMemory").
- **Mitigation Planning:** The user must log a "Safety Plan" to address these faults before completing the audit.

### 4. Mastery Ownership Export
All summaries, alternative evaluations, and fault mitigations are compiled into a final Mastery Report. This output acts as a "Verified Human-in-the-Loop" log, proving the developer understands exactly what was merged into the repository.

---

## Running Locally (Docker Compose)

The easiest way to run the entire In-Ctrl stack (Frontend + Backend + Database) is using Docker. You do not need Java or Node.js installed on your machine.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running on your machine.
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/RhithanyaParthasarathi/In-Ctrl.git
```

**2. Navigate into the project directory**
```bash
cd In-Ctrl
```

**3. Configure the AI Brain**
After cloning and moving into the `In-Ctrl` directory, create a new file named `.env` right there in the root folder (exactly where `docker-compose.yml` is present). Paste your Gemini API key inside it:
```ini
GEMINI_API_KEY="AIzaSyYourSecretKeyHere"
```

**4. Boot the Application**
Run the following Docker Compose command to start the entire system:
```bash
docker-compose up -d
```
*(This will automatically pull the pre-built `rhithanya/in-ctrl-frontend` and `rhithanya/in-ctrl-backend` images from Docker Hub and link them together on port 80 and 8080).*

**5. Access the Dashboard**
Open your web browser and navigate to:
**http://localhost**

---

## 🛠 CI/CD Pipeline
This project utilizes **GitHub Actions** for continuous integration and delivery. 
Upon pushing code to the `main` branch, the `.github/workflows/ci-cd.yml` pipeline will automatically:
1. Check out the latest code.
2. Build the Java Spring Boot backend into a JAR file.
3. Build the Angular frontend.
4. Log into Docker Hub (using `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets).
5. Build the Docker images and push them to Docker Hub with the `:latest` tag.
