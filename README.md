# Design Loop — LLD Practice Platform

Design Loop is a focused LLD practice prototype: select a prompt, describe an object-oriented design, submit it, get transparent feedback, and revisit the attempt history.

## Run

Open `index.html` in a browser, or run `npm start`. Run deterministic evaluation tests with `npm test`.

## MVP decisions

- Three prompts offer distinct complexity and focus areas.
- Text is deliberately low-friction while still eliciting objects, responsibilities, relationships, extensibility, and edge cases.
- Feedback combines visible deterministic checks with a replaceable coaching layer. The prototype runs coaching locally.
- Browser local storage retains attempt history without adding auth or a database.

## Design at a glance

`Problem` holds prompt content. `Attempt` captures the selected problem, submission, lifecycle, report, and timestamp. `EvaluationService` coordinates `DeterministicRubric` checks and a replaceable `FeedbackCoach` interface. A future `Submission` interface can support code or diagrams alongside current text submissions.

## Evaluation and failure behaviour

The deterministic rubric has a stable, instant baseline. A future coaching provider can interpret trade-offs and must tie observations back to the submission. If coaching is slow or fails, save the attempt first, retain the deterministic report, set `feedback_pending`/`failed`, and offer retry.

## Limitations

Keyword checks are intentionally simple; local storage is single-browser only. See [RESEARCH.md](RESEARCH.md), [DESIGN.md](DESIGN.md), and [AI_USAGE.md](AI_USAGE.md).
