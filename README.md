# Design Loop — LLD Practice Platform

Design Loop is a focused LLD practice prototype: select a prompt, describe an object-oriented design, submit it, get transparent feedback, and revisit the attempt history.

## Run

Run `npm start` and open `http://localhost:3000`. Run deterministic evaluation tests with `npm test`.

To enable external verification with Gemini, set `GEMINI_API_KEY` in the server environment before starting the app. Optionally set `GEMINI_MODEL`; the default is `gemini-3.6-flash`. The key is read only by `server.js` and is never sent to the browser. An OpenAI-compatible fallback can use `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_BASE_URL`. Without a provider key, the local rubric remains available as a fallback.

## MVP decisions

- Three prompts offer distinct complexity and focus areas.
- Text is deliberately low-friction while still eliciting objects, responsibilities, relationships, extensibility, and edge cases.
- Feedback combines visible deterministic checks with an AI-verifier boundary. The prototype uses a local coaching fallback; a configured model provider would perform the judgment-heavy verification.
- Browser local storage retains attempt history without adding auth or a database.

## Design at a glance

`Problem` holds prompt content. `Attempt` captures the selected problem, submission, lifecycle, report, and timestamp. `EvaluationService` coordinates `DeterministicRubric` checks and a replaceable `FeedbackCoach` interface. A future `Submission` interface can support code or diagrams alongside current text submissions.

## Evaluation and failure behaviour

The deterministic rubric has a stable, instant baseline. The AI verifier interprets trade-offs and must tie observations back to the submission. If AI verification is slow or fails, save the attempt first, retain the deterministic report, set `feedback_pending`/`failed`, and offer retry.

## Limitations

Keyword checks are intentionally simple; local storage is single-browser only. See [RESEARCH.md](RESEARCH.md), [DESIGN.md](DESIGN.md), and [AI_USAGE.md](AI_USAGE.md).
