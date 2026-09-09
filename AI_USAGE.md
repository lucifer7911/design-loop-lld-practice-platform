# AI usage

The prototype was developed with coding assistance, then reviewed and adjusted against the assignment requirements. The verification design separates deterministic evidence checks from a Gemini-powered verifier that explains design quality.

1. **Feedback split:** The initial suggestion was a single overall score. I kept a visible deterministic rubric instead, because learners should see which evidence was present and what to improve.
2. **AI verification role:** I assigned qualitative judgment to an AI verifier: it should assess responsibility boundaries, coupling, trade-offs, and next steps using the learner's evidence. The deterministic rubric remains the guardrail for required evidence.
3. **Submission format:** A diagram-first workflow was considered. I chose text-first because it is faster to complete and captures responsibility and trade-off reasoning; the design note keeps room for diagram or code submissions later.
4. **Evaluation language:** A reference class diagram was considered as the target. I rejected that framing because multiple LLD designs can be valid. Feedback therefore points to evidence in the learner's own submission.
5. **Evaluation delay:** A queue and worker model was considered for slow evaluation. I kept the prototype in-process for the two-day scope while documenting `submitted`, `feedback_pending`, `reviewed`, and `failed` lifecycle states.
6. **Testing:** Assistance helped identify sparse-input, broad-coverage, and score-cap cases. I kept those as deterministic tests because they protect stable product behavior without requiring brittle UI tests.

These decisions were reviewed manually to keep the MVP small, explainable, and aligned with the learner practice loop.
