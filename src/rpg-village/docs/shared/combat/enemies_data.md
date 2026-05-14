# Enemies Data

This registry defines the base enemy types that can be encountered. For the MVP, these serve as templates for procedural generation.

| ID | Name | Element | Type | Base HP | Base Atk | Speed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Forest & Meadows)** | | | | | | |
| `slime_green` | Green Slime | `neutral` | `beast` | 15 | 2 | 1 |
| `slime_fire` | Fire Slime | `fire` | `beast` | 20 | 3 | 2 |
| `wild_boar` | Wild Boar | `neutral` | `beast` | 25 | 4 | 3 |
| `goblin_scout` | Goblin Scout | `neutral` | `humanoid` | 22 | 4 | 5 |
| `goblin_grunt` | Goblin Grunt | `neutral` | `humanoid` | 30 | 5 | 2 |
| **Tier 2 (Caves & Ruins)** | | | | | | |
| `giant_spider` | Giant Spider | `neutral` | `beast` | 40 | 8 | 6 |
| `skeleton_warrior`| Skeleton | `neutral` | `undead` | 45 | 7 | 3 |
| `skeleton_archer` | Skel. Archer | `wind` | `undead` | 35 | 9 | 4 |
| `wraith_minor` | Minor Wraith | `storm` | `undead` | 30 | 12 | 7 |
| `zombie_shambler` | Zombie | `neutral` | `undead` | 60 | 6 | 1 |
| **Tier 3 (Mountains & Fortress)** | | | | | | |
| `orc_grunt` | Orc Grunt | `neutral` | `humanoid` | 80 | 15 | 3 |
| `orc_shaman` | Orc Shaman | `fire` | `humanoid` | 65 | 18 | 4 |
| `rock_golem` | Rock Golem | `neutral` | `construct` | 150 | 12 | 1 |
| `harpy_scout` | Harpy | `wind` | `beast` | 70 | 14 | 10 |
| **Bosses** | | | | | | |
| `goblin_king` | Goblin King | `neutral` | `humanoid` | 120 | 10 | 4 |
| `lich_apprentice` | Lich Apprentice | `storm` | `undead` | 180 | 25 | 5 |
| `mountain_troll` | Mountain Troll | `neutral` | `beast` | 400 | 30 | 2 |

## Level Scaling
Enemies scale their attributes by 10% per level above 1.
`Attribute = Base * (1 + 0.1 * (Level - 1))`
