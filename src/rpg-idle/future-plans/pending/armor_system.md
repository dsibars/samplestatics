# Feature Proposal: The Armor System (Defensive Archetypes)

## Goal
Fill the "Armor Shop" with gear that provides significant defensive trade-offs, allowing for "Tank", "Evasion", and "Glass Cannon" builds.

## Armor Slots
- **Head**: Primary source of MP/Spirit (Resistance).
- **Body**: Primary source of Defense (DEF) and HP.
- **Legs**: Primary source of Speed (SPD) and Evasion.

## Armor Archetypes
| Type | Stat Focus | Penalty |
| :--- | :--- | :--- |
| **Plate (Heavy)** | +++ DEF, + HP | - SPD, - Evasion |
| **Leather (Mid)** | + DEF, ++ Evasion | None |
| **Robes (Magic)** | +++ MP, + Magic Power | --- DEF |

## Tiered Materials
The Armor Shop level determines available materials:
1. **Padded/Cloth**: Initial.
2. **Hard Leather**: Shop Lvl 2.
3. **Chainmail**: Shop Lvl 3.
4. **Knight Plate**: Shop Lvl 4.
5. **Mythril/Ethereal**: Shop Lvl 5.

## Technical Integration
- **Equipment Logic**:
    - Update `Hero.recalculateStats()` to sum up DEF, HP, and Speed modifiers from the `equipment` object.
- **Shop UI**:
    - Implement the "Armor Shop" tab mirroring the Weapon Shop logic but for defensive gear.

## Product Logic
Armor gives the player a "Gold Sink" that feels rewarding because it directly increases the "Time to Live" (TTL) of their heroes in infinite adventure, allowing them to push higher milestones without dying.
