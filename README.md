# In-Ctrl

**In-Ctrl** is an AI Verification Documentor designed to address the "Hollow Commit" problem in AI-assisted software development. 

It acts as an Implementation Diary where developers verify AI-generated code, document alternative decisions, assess risk points, and ensure human mastery over the project's logic. Rather than just asking an AI to write code and blindly committing it, In-Ctrl forces the developer to understand *why* the code was written that way, what the alternatives were, and where it might fail.

## Tech Stack
*   **Backend:** Spring Boot, H2 In-Memory Database
*   **Frontend:** Angular
*   **Containerization:** Docker
*   **CI/CD:** GitHub Actions / Jenkins
*   **Cloud Deployment:** AWS EC2
*   **External APIs:** GitHub REST API, LLM API (OpenAI/Gemini)

## Features & Verification
The core features revolve around syncing recent commits from GitHub, pasting the context of the AI conversation, and generating a detailed "Dev Log" that includes:
- Per-file logic summaries and dependency lists.
- Architectural path comparisons (showing alternative implementations).
- Fault prediction and stress testing.
- A final exported Master Knowledge Report.

For a detailed breakdown of the features and requirements, please see [user_stories.md](./user_stories.md).

## Docker Setup & Deployment 🐳

This repository contains `Dockerfile`s for both the frontend and backend, and the `.github/workflows/ci-cd.yml` pipeline is fully configured to automatically build and push these images to Docker Hub.

### 1. Pushing to Docker Hub
To enable the automated push to Docker Hub when committing to `main`:
1. Go to your GitHub Repository Settings.
2. Navigate to **Secrets and variables > Actions**.
3. Add two new Repository Secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username.
   - `DOCKERHUB_TOKEN`: A Personal Access Token from Docker Hub.

### 2. Running the Application via Docker Compose
Anyone can download and run the entire dashboard locally using these three commands:

```bash
# 1. Clone the repository
git clone https://github.com/RhithanyaParthasarathi/In-Ctrl.git

# 2. Enter the project directory
cd In-Ctrl

# 3. Boot the Frontend and Backend together (Inject your Gemini API Key)
GEMINI_API_KEY="AIzaSyYourSecretKeyHere" docker-compose up -d
```
*(Note for Windows PowerShell: If setting the variable inline fails, simply create a `.env` file inside the `backend/` folder containing `GEMINI_API_KEY=your-key` and then just run `docker-compose up -d`)*

After running the commands, navigate to **http://localhost** in your browser to view the application!
