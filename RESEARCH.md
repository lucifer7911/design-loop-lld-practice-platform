# Research note: the LLD practice gap

## Learner problem

LLD learners do not mainly lack prompts. They lack a fast way to test whether a design tells a coherent story: which objects exist, who owns each decision, where change is isolated, and how unhappy paths behave. A class diagram alone can conceal weak responsibility boundaries; code can conceal intended relationships. A useful attempt needs a short written rationale alongside a model.

## Existing approaches and gaps

Hello Interview offers a path from lessons to guided practice, while Educative offers structured, interactive system-design courses. Both validate the value of curated prompts and practice, but they are broadly interview-prep products rather than an LLD-specific repeated-revision loop. Generic architecture critique can be opaque, inconsistent, and disconnected from prior attempts.

The gap is a deliberate-practice loop: prompt → explicit rationale → feedback with a visible basis → saved attempt → targeted revision. The product should reward trade-offs, not enforce a canonical Parking Lot diagram.

### Sources consulted

- [Hello Interview: preparation workflow and guided practice](https://www.hellointerview.com/learn/system-design/in-a-hurry/how-to-prepare)
- [Hello Interview: common evaluation rubric themes](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction)
- [Educative: interactive system-design course catalogue](https://www.educative.io/)

## Product direction

Design Loop starts text-first because it is quick to author and captures reasoning. Prompts focus on domain objects, responsibility boundaries, relationships, extension seams, and failure paths. Feedback combines observable coverage checks with coaching. The first version stores attempts locally and evaluates in-process—appropriate for validating learner behaviour before investing in accounts, diagram parsers, or a large content library.
