# Enemies Data

This registry defines the base enemy types that can be encountered. For the MVP, these serve as templates for procedural generation.

| ID | Name | Element | Type | Base HP | Base Atk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `slime_green` | Green Slime | `neutral` | `beast` | 15 | 2 |
| `slime_fire` | Fire Slime | `fire` | `beast` | 20 | 3 |
| `goblin_scout` | Goblin Scout | `neutral` | `humanoid` | 25 | 4 |
| `skeleton_warrior`| Skeleton | `neutral` | `undead` | 30 | 5 |

## Level Scaling
Enemies scale their attributes by 10% per level above 1.
`Attribute = Base * (1 + 0.1 * (Level - 1))`
