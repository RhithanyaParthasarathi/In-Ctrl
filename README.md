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
