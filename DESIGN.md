# Design note

## MVP flow

1. Choose one of three scoped prompts.
2. Explain the object model and collaborations.
3. Save a submitted attempt, then evaluate it.
4. Show visible rubric checks plus a coaching review.
5. Save the report in history and give one focused revision step.

## Domain model

```text
Problem 1 --- * Attempt
Attempt --- 1 Submission
Attempt --- 0..1 EvaluationReport
EvaluationReport --- * RubricCheck
EvaluationService --> DeterministicRubric
EvaluationService --> FeedbackCoach (interface)
Submission (interface) <- TextSubmission | DiagramSubmission | CodeSubmission
```

`Problem` owns requirements, not evaluation. `Attempt` owns lifecycle (`draft`, `submitted`, `feedback_pending`, `reviewed`, `failed`) and never loses source material. `DeterministicRubric` checks minimum evidence; `FeedbackCoach` is replaceable by a local heuristic or human reviewer.

## Evaluation and trade-offs

Rules verify a stable baseline: objects, responsibilities, relationships, extension, and an edge case. A coaching provider is useful for judgement—misplaced allocation policy, premature abstraction, or unconsidered trade-offs. Its structured output should include criterion, evidence, concern, suggestion, and confidence; it must not claim a single ideal solution.

Future asynchronous evaluation saves the attempt as `submitted`, attaches rule feedback immediately, and advances to `reviewed`. A provider timeout gives `feedback_pending` or `failed` with retry. This prototype uses a short in-process delay to make status visible without unnecessary queue infrastructure.

Text is chosen over a diagram editor because it exposes reasoning. The submission and evaluator abstractions make later formats and evaluators additive, while the monolith remains the sensible two-day choice.
