# RPG Idle: Feature Implementation Planning

## 1. Instructions for Agents

This folder contains the roadmap for implementing new features into the **RPG Idle** application. Each feature is documented in its own Markdown file detailing functional requirements, technical integration, and product goals.

### Workflow
1.  **Status Check**: All planned features are located in the [`pending/`](samplestatics/src/rpg-idle/future-plans/pending/) directory.
2.  **Pick in Order**: Agents must pick the next feature according to the **Sorted Backlog** below. This ensures that dependencies (like Multiple Enemies coming before AoE Skills) are respected and that high-impact/low-risk features are prioritized.
3.  **Implement**: Follow the detailed specs in the picked `.md` file to implement the functionality into the base code (`src/rpg-idle/`).
4.  **Move to Implemented**: Once a feature is fully completed and verified, **move the corresponding file** from `pending/` to the [`implemented/`](samplestatics/src/rpg-idle/future-plans/implemented/) directory.
5.  **Clean pending Feature**: Remove from this planning.md file the feature you just implemented in the "Sorted Backlog (Pending Features)" section.




---

## 2. Sorted Backlog (Pending Features)

The following features are sorted by functional dependency, impact, and implementation risk.

### Phase 5: Polish & Late Game (High Risk / Content)
*All features implemented.*
