# Agent interface coverage

This pass focuses on questions, plans, capacity and loading: the points where an agent needs to explain what is happening or hand a decision back to a person.

| Need                                             | Component                                                             | Responsibility                                                                                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clarify intent before continuing                 | **AskUser — added**                                                   | Single/multiple choices, written alternatives, required/optional questions, pending submission, errors, retry and sent state. The runtime receives structured answers. |
| Review a proposed sequence                       | **AgentPlan — added**                                                 | Numbered steps, approval and revision requests. The runtime owns the recorded decision and execution.                                                                  |
| Explain remaining context capacity               | **ContextUsage — added**                                              | Measured token counts, capacity thresholds, unavailable state and a compaction request. Never estimates missing counts.                                                |
| Show unknown work                                | **Progress — improved**, **CircularProgress and LoadingDots — added** | Moving indeterminate bar, spinning arc, thinking/typing dots; no invented percentage.                                                                                  |
| Hold layout while content loads                  | **Skeleton — improved**                                               | Pulse, shimmer and static variants. New loading animations respect reduced motion.                                                                                     |
| Follow device appearance and customize a product | **ThemeProvider — added**, theme tokens/editor improved               | System/light/dark, local persistence, tab synchronization, nine accents, custom color, radius, control density and CSS export.                                         |
| Follow execution and interrupt it                | AgentRun                                                              | Queued/running/waiting/paused/completed/failed/canceled states and pause/resume/cancel/retry callbacks.                                                                |
| Approve an individual side effect                | ToolApproval                                                          | Explicit approve/deny decisions with a pending state.                                                                                                                  |
| Inspect tool input and output                    | ToolCall                                                              | Collapsible arguments, result, error and duration.                                                                                                                     |
| Read explanations and supporting material        | Reasoning, Source, Markdown                                           | Expandable reasoning summaries, citations and safe rendered content.                                                                                                   |
| Supply input and attachments                     | Composer, Attachment, VoiceRecorder                                   | Drafts, streaming interruption, files and recorded input.                                                                                                              |
| Recover connectivity                             | ConnectionStatus                                                      | Connection state and retry messaging.                                                                                                                                  |

## Remaining product-level gaps

These need additional workflow design or runtime contracts; the existing components do not pretend to implement them:

- **Artifact and change review:** a file list, accessible text diff, accepted/rejected changes and a concrete apply action.
- **Checkpoint recovery:** what will be restored, what work is lost, and acknowledgement from the runtime before reporting success.
- **Delegation and handoff:** agent ownership, related runs, delivery acknowledgements and failures. AgentRun can show each run, but is not a team coordinator.
- **Queued messages and approvals:** cancellation, edited requests, expired decisions and concurrency. AskUser handles a single request; the application keys it by request ID.
- **Usage and budgets:** authoritative token/cost accounting, pricing provenance, limits and provider-specific warnings. ContextUsage only measures context capacity.
- **Model and tool configuration:** available providers, capability constraints, credentials and persistence belong to the host app.

No component executes a tool, resumes an agent, writes a file or compacts context automatically. Callbacks request those operations; the app reports their actual result.
