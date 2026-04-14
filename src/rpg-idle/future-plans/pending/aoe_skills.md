# Feature: AoE Skills (Area of Effect)

## Goal
Implement skills that can damage all enemies or heal all allies in a single turn.

## Skill Ideas
### Physical (Family: Multi-Strike)
- **Whirlwind**: Spin around, hitting all enemies for 60% damage each. Low MP cost.
- **Blade Dance**: Tier 3 physical skill. Targets all enemies with multiple small hits.

### Magic (Family: Elemental Storm)
- **Meteor**: (Fire) Massive damage to one target + 30% splash to all others.
- **Blizzard**: (Water) Medium damage to all enemies.
- **Tsunami**: (Water) Tier 3 magic. High power AoE.
- **Chain Lightning**: (Storm) High damage to first target, jumping to others with 20% reduced damage each jump.

### Support (Family: Group Prayer)
- **Holy Rain**: Already exists as `small_group_heal`, but expanded to include `Group Regen` (restores HP over time).

## Technical Integration
- **SKILLS_DATA**: 
    - `targetType: 'all_enemies'`
    - `targetType: 'all_allies'`
- **CombatAttackCalculator**: 
    - Add logic to calculate "Splash" or "Falloff" damage.
- **CombatManager**:
    - Update `handleSkillAction` to loop through the determined `targets`.
    - Ensure visual elements (particle effects) trigger for each target.

## Balance
- AoE skills should generally have a higher MP cost and lower *per-target* damage than single-target skills.
- **Efficiency**: AoE is more efficient against groups, while single-target is better for focused takedowns (eliminating threats faster).

## v1.5 Extension
- **Random Multi-Target**: Skills that hit 2-3 random enemies (useful for intermediate milestones).
