# Hero Skills Data

This is the master registry for all skills defined in `GameConstants.js`.

## Physical Skills
| ID | Mult | MP | Tier | Type |
| :--- | :--- | :--- | :--- | :--- |
| `basic_attack` | 1.0 | 0 | 1 | `single_enemy` |
| `double_attack` | 0.7 | 10 | 2 | `single_enemy` |
| `triple_attack` | 0.6 | 20 | 3 | `single_enemy` |
| `whirlwind` | 0.6 | 15 | 2 | `all_enemies` |
| `blade_dance` | 0.4 | 35 | 3 | `all_enemies` |

## Magic Skills
| ID | Mult | MP | Tier | Element | Type | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `small_fire_ball` | 1.2 | 10 | 1 | `fire` | `single_enemy` | - |
| `medium_fire_ball` | 1.8 | 25 | 2 | `fire` | `single_enemy` | - |
| `meteor` | 2.2 | 50 | 3 | `fire` | `single_enemy` | 30% Splash |
| `small_water_ball` | 1.2 | 10 | 1 | `water` | `single_enemy` | - |
| `blizzard` | 1.0 | 30 | 2 | `water` | `all_enemies` | - |
| `tsunami` | 1.6 | 60 | 3 | `water` | `all_enemies` | - |
| `small_wind_ball` | 1.2 | 10 | 1 | `wind` | `single_enemy` | - |
| `medium_wind_ball` | 1.8 | 25 | 2 | `wind` | `single_enemy` | - |
| `big_wind_ball` | 2.5 | 45 | 3 | `wind` | `single_enemy` | - |
| `small_storm_ball` | 1.2 | 10 | 1 | `storm` | `single_enemy` | - |
| `chain_lightning` | 1.5 | 40 | 2 | `storm` | `single_enemy` | 80% Jump |
| `big_storm_ball` | 2.5 | 45 | 3 | `storm` | `single_enemy` | - |

## Support Skills
| ID | Power | MP | Tier | Type |
| :--- | :--- | :--- | :--- | :--- |
| `small_heal` | 0.2 | 8 | 1 | `single_ally` |
| `medium_heal` | 0.5 | 20 | 2 | `single_ally` |
| `high_heal` | 0.85| 40 | 3 | `single_ally` |
| `small_group_heal` | 0.1 | 15 | 1 | `all_allies` |
| `medium_group_heal`| 0.35| 35 | 2 | `all_allies` |
| `high_group_heal` | 0.65| 65 | 3 | `all_allies` |
| `haste` | - | 15 | 2 | `single_ally` |

## Trick Skills
| ID | Stat | Mult | MP | Tier | Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `poison_dart` | `strength` | 0.8 | 5 | 1 | `single_enemy` |
| `steal` | `speed` | 0.0 | 10 | 2 | `single_enemy` |
