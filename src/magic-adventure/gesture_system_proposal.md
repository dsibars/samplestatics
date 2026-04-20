# Magic Adventure: The Magic Circle System (Finalized)

The spellcasting system revolves around a "Magic Circle" UI. Each spell is a composition of a central **Core** and up to four **Complements**.

## 🏗 The Magic Circle UI

The drawing area is divided into two main zones:

### 1. The Core (Inner Circle)
- **Visual**: A central circle with a red semi-transparent background.
- **Function**: Determines the base element and nature of the spell.
- **Rule**: Exactly ONE gesture must be drawn here (can be multi-stroke).

### 2. The Complements (Outer Ring)
- **Visual**: Four colored sections surrounding the core.
- **Function**: Modifies the base spell using absolute multipliers.
- **Rule**: Each section can stack the SAME symbol, but mixing different symbols in a single section will cause a "Failure to Cast".

## 📜 Symbol Library & Math

### Core Symbols (Elements)
| Symbol | Element | Base Damage | Base MP Cost | Special Effect |
| :--- | :--- | :--- | :--- | :--- |
| `^` / `V` | **Fire** | 20 | 10 | Burning |
| `S` | **Water** | 12 | 8 | Fluid |
| `Square` | **Earth** | 15 | 12 | Impact |
| `Circle` | **Light** | 8 | 15 | Defense |
| `Z` | **Neutral** | 0 | 20 | Sleep |
| `X` | **Poison** | 4 | 10 | Poison DoT |

### Complementary Symbols (Modifiers)
| Symbol | Type | Effect Modifier | MP Cost Modifier |
| :--- | :--- | :--- | :--- |
| `+` | **Boost** | +25% | +25% |
| `-` | **Reduce** | -25% | -25% |
| `∞` | **All** | 1.0x | +50% |
| `>` | **Pierce** | 1.0x | +20% |

## 🧪 Composition Examples

- **Fire** + `+` = **Greater Fireball** (25 Damage, 13 MP)
- **Fire** + `+` + `+` = **Greater Greater Fireball** (31 Damage, 16 MP)
- **Water** + `∞` = **Echoing Aqua Wave** (12 Damage, 12 MP)
- **Poison** + `-` = **Minor Venom Cloud** (3 Damage, 8 MP)

## 🛠 Strategic Progression
As players increase their maximum MP, they can cast more complex compositions. A novice might only cast a basic **Fireball** (10 MP), while a master could cast a **Piercing Greater Echoing Fireball** with three `+` modifiers, creating a devastating but very expensive area attack.
