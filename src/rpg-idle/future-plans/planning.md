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

### Phase 1: Identity & Customization (High Impact, Low Risk)
1.  [**hero_traits.md**](samplestatics/src/rpg-idle/future-plans/pending/hero_traits.md): Connect Origin to functional passives (+STR, +HP, etc.).
2.  [**hero_traits_v2.md**](samplestatics/src/rpg-idle/future-plans/pending/hero_traits_v2.md): UI for Trait descriptions (Transparency).

### Phase 2: Equipment & Economy (Mid Complexity)
3.  [**weapon_system.md**](samplestatics/src/rpg-idle/future-plans/pending/weapon_system.md): Weapon families, tiers, and dual-wielding constraints.
4.  [**armor_system.md**](samplestatics/src/rpg-idle/future-plans/pending/armor_system.md): Defensive archetypes (Light/Mid/Heavy) and shop expansion.

### Phase 3: Combat Evolution (High Complexity, Core Foundation)
5.  [**multiple_enemies.md**](samplestatics/src/rpg-idle/future-plans/pending/multiple_enemies.md): The transition to MvN combat (1-4 enemies per battle).
6.  [**aoe_skills.md**](samplestatics/src/rpg-idle/future-plans/pending/aoe_skills.md): Leverages multiple enemies to add Whirlwind/Meteor style attacks.

### Phase 4: Retention & Progression (Meta-Game)
7.  [**idle_training.md**](samplestatics/src/rpg-idle/future-plans/pending/idle_training.md): Real-time XP rewards for inactive heroes.
8.  [**idle_training_v2.md**](samplestatics/src/rpg-idle/future-plans/pending/idle_training_v2.md): Thematic quest assignments.

### Phase 5: Polish & Late Game (High Risk / Content)
9.  [**status_effects.md**](samplestatics/src/rpg-idle/future-plans/pending/status_effects.md): Poison, Sleep, and logic hooks.
10. [**adventure_events.md**](samplestatics/src/rpg-idle/future-plans/pending/adventure_events.md): Non-combat encounters (Shrines/Merchants).
11. [**the_forge_awakening.md**](samplestatics/src/rpg-idle/future-plans/pending/the_forge_awakening.md): Endgame Core sinking (Affixes).
