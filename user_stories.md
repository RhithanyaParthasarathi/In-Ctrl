# In-Ctrl: AI Verification Documentor

## Epic 1: Context Collection
### Story 1: Unified Input (GitHub + AI Chat)
As a developer, I want to provide my GitHub commit ID and paste my AI chat logs so that the system can analyze my code changes alongside the instructions I gave the AI.
**Acceptance Criteria:**
- User can input a GitHub repo/commit URL.
- User can paste long-form text (AI Chat history).
- Backend fetches the specific code changed in that commit.

## Epic 2: The Knowledge Audit
### Story 2: Per-File Logic Summary & Inventory
As a student-instructor, I want to see a plain-language summary of what was written and a list of technologies used in each file so that I can "re-learn" my own codebase.
**Acceptance Criteria:**
- System displays a card for each modified file.
- Lists libraries used (e.g., "Spring Data JPA," "HttpClient") and logical blocks (e.g., "Validation middleware").
- User must "check off" or confirm they understand these elements.

### Story 3: Path Comparison (The "Why Not" Analysis)
As an architect, I want the system to suggest two "Other Ways" this code could have been written (other than the AI's version) so I can understand why the current path was chosen.
**Acceptance Criteria:**
- For major logic blocks, display: AI Path vs. Alternative A vs. Alternative B.
- The user must document/select why the AI ignored the alternatives (e.g., "AI went for a quicker but less scalable path").

## Epic 3: Defensive Auditing
### Story 4: Fault Prediction & Stress Testing
As an engineer, I want the system to highlight potential points of failure (Faults) in the committed code so that I am prepared for what could go wrong.
**Acceptance Criteria:**
- System identifies at least 2 "Weak Spots" in the code (e.g., "No retry on API failure," "Risk of OutOfMemory with this list size").
- User must log a "Safety Plan" (Mitigation) for these faults before completing the audit.

## Epic 4: The Final Asset
### Story 5: Knowledge Ownership Report (Mastery Export)
As a user, I want all my summaries, alternative evaluations, and fault mitigations compiled into a single report so I have proof of my project ownership.
**Acceptance Criteria:**
- Generate a .md or .json file containing the per-file summaries, alternative justifications, and identified faults.
- The output acts as a "Verified Human-in-the-Loop" log for the repository.
