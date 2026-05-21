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
| **Tier 2 (Caves & Coast)** | | | | | | | |
| `bat_small` | Small Bat | `neutral` | `beast` | 22 | 4 | 2 | 7 |
| `spider_minor` | Minor Spider | `neutral` | `beast` | 28 | 5 | 3 | 4 |
| `crab_shell` | Shell Crab | `neutral` | `beast` | 35 | 5 | 5 | 2 |
| `water_spirit_minor` | Minor Water Spirit | `water` | `elemental` | 25 | 4 | 2 | 5 |
| **Tier 3 (Forest & Camps)** | | | | | | | |
| `goblin_brute` | Goblin Brute | `neutral` | `humanoid` | 55 | 7 | 5 | 1 |
| `goblin_shaman` | Goblin Shaman | `storm` | `humanoid` | 40 | 5 | 3 | 5 |
| `skeleton_warrior` | Skeleton Warrior | `neutral` | `undead` | 35 | 5 | 3 | 3 |
| `ghost_wisp` | Ghost Wisp | `wind` | `undead` | 20 | 3 | 1 | 8 |
| **Tier 4 (Ruins & Peaks)** | | | | | | | |
| `ice_elemental` | Ice Elemental | `water` | `elemental` | 45 | 6 | 5 | 2 |
| `young_drake` | Young Drake | `fire` | `dragon` | 70 | 8 | 6 | 4 |
| **Bosses** | | | | | | | |
| `goblin_king` | Goblin King | `neutral` | `humanoid` | 120 | 10 | 6 | 4 |
| `lich_apprentice` | Lich Apprentice | `storm` | `undead` | 180 | 25 | 8 | 5 |
| `mountain_troll` | Mountain Troll | `neutral` | `beast` | 400 | 30 | 15 | 2 |

## Level Scaling
Enemies scale their attributes by 10% per level above 1.
`Attribute = Base * (1 + 0.1 * (Level - 1))`
