# Enemies Data

This registry defines the base enemy types that can be encountered. For the MVP, these serve as templates for procedural generation.

| ID | Name | Element | Type | Base HP | Base Atk | Base Def | Speed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Forest & Meadows)** | | | | | | | |
| `slime_green` | Green Slime | `neutral` | `beast` | 20 | 3 | 2 | 2 |
| `slime_fire` | Fire Slime | `fire` | `beast` | 30 | 5 | 3 | 3 |
| `wild_boar` | Wild Boar | `neutral` | `beast` | 40 | 6 | 4 | 4 |
| `goblin_scout` | Goblin Scout | `neutral` | `humanoid` | 25 | 4 | 2 | 6 |
| `goblin_grunt` | Goblin Grunt | `neutral` | `humanoid` | 35 | 5 | 4 | 2 |
| **Tier 2 (Caves & Ruins)** | | | | | | | |
| `giant_spider` | Giant Spider | `neutral` | `beast` | 50 | 9 | 5 | 6 |
| `skeleton_warrior`| Skeleton | `neutral` | `undead` | 55 | 8 | 5 | 3 |
| `skeleton_archer` | Skel. Archer | `wind` | `undead` | 45 | 10 | 3 | 4 |
| `wraith_minor` | Minor Wraith | `storm` | `undead` | 40 | 14 | 3 | 7 |
| `zombie_shambler` | Zombie | `neutral` | `undead` | 70 | 7 | 6 | 1 |
| **Tier 3 (Mountains & Fortress)** | | | | | | | |
| `orc_grunt` | Orc Grunt | `neutral` | `humanoid` | 90 | 16 | 8 | 3 |
| `orc_shaman` | Orc Shaman | `fire` | `humanoid` | 75 | 20 | 5 | 4 |
| `rock_golem` | Rock Golem | `neutral` | `construct` | 170 | 14 | 12 | 1 |
| `harpy_scout` | Harpy | `wind` | `beast` | 80 | 15 | 5 | 10 |
| **Bosses** | | | | | | | |
| `goblin_king` | Goblin King | `neutral` | `humanoid` | 120 | 10 | 6 | 4 |
| `lich_apprentice` | Lich Apprentice | `storm` | `undead` | 180 | 25 | 8 | 5 |
| `mountain_troll` | Mountain Troll | `neutral` | `beast` | 400 | 30 | 15 | 2 |

## Level Scaling
Enemies scale their attributes by 10% per level above 1.
`Attribute = Base * (1 + 0.1 * (Level - 1))`
