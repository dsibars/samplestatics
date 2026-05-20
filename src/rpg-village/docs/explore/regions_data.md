# Regions Data (The World Map)

Instead of a static list of missions, `rpg-village` uses a **Dynamic Region Discovery System**. Each Region acts as an "Expedition Factory" that populates a persistent branching tree of missions for the player to explore.

## 1. The Discovery System
When a Region is unlocked, it initializes with a "Starting Expedition". Completing missions within a region triggers the **Discovery Logic**.

### Discovery Logic (Ramifications)
Every time an expedition is completed, the Region evaluates if new paths should be discovered:
- **Linear Path**: Completing Exp A unlocks Exp B.
- **Branching Path**: Completing Exp A unlocks Exp B and Exp C.
- **Hidden Paths**: Some expeditions only appear if certain conditions are met (e.g., "Found a map in Exp A").

### Persistence
Once an expedition is generated (instantiated), it is **persistent**:
- It has a unique `id` and `dependencyId`.
- Its enemies, levels, and rewards are **fixed** based on the region's current scaling at the moment of generation.
- The history of all completed expeditions in a region is tracked.

## 2. Progression & Scaling
The difficulty of newly generated expeditions is governed by the Region's `Clears Count`.

- **Enemy Level**: `Base_Tier_Level + floor(Region.Clears / 3)`.
- **Stat Scaling**: Enemies scale by `Base_Stat * 1.1^(Level - 1)`. Speed remains flat to preserve turn-order feel.
- **Complexity Inflation**: As `Clears` increase, the generator favors more stages and higher boss frequency.
- **Explorer Guild Bonus**: Reduces stage count by 10% per Explorer Guild level (minimum 1 stage).

---

## 3. Region Registry (15 Places)

| ID | Name | Tier | Branching | Complexity | Thematic Rewards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `reg_greenfields` | Greenfields | 1 | Low (Linear) | 1-2 | Food, Wood |
| `reg_tiny_cave` | Tiny Cave | 1 | Medium (1->2) | 2 + Boss | Stone, Gems |
| `reg_calmed_beach` | Calmed Beach | 1 | Low | 3 | Food, Gold |
| `reg_whispering_forest`| Whisp. Forest | 2 | High (1->3) | 2-4 | Wood, Herbs |
| `reg_stony_foothills` | Stony Foothills | 2 | Medium | 3-5 | Stone, Iron |
| `reg_murky_swamp` | Murky Swamp | 2 | High (Hidden)| 4 | Rare Mat, Poison |
| `reg_forgotten_ruins` | Forgotten Ruins | 3 | High (Looping)| 4-6 | Gold, Artifacts |
| `reg_iron_peaks` | Iron Peaks | 3 | Medium | 5 | Iron, Steel |
| `reg_crystal_hollow` | Crystal Hollow | 3 | Medium | 3-5 | Magic Shards |
| `reg_great_desert` | Great Desert | 4 | High (Wide) | 6 | Gold, Rare Gems |
| `reg_obsidian_crater` | Obsidian Crater | 4 | Low (Deep) | 6-8 | Steel, Obsidian |
| `reg_ancient_library` | Ancient Library | 4 | High (Puzzle)| 8 | Blueprints |
| `reg_frostbite_tundra`| Frostbite Tundra| 5 | Medium | 8 | Fur, Mythril |
| `reg_sky_fortress` | Sky Fortress | 5 | Low (Vertical)| 10 | Unique Gear |
| `reg_dragon_maw` | The Dragon's Maw | 5 | Extreme | 12 | Dragon Scales |

---

## 4. Region Generation Patterns

### `reg_greenfields` (Tutorial Region)
- **Pattern**: Simple linear progression.
- **Complexity**: 1-2 stages.
- **Discovery**: 100% chance for 1 child node.
- **Enemies**: `slime_green`, `wild_boar`.

### `reg_tiny_cave` (The Burrow)
- **Pattern**: Short, branching paths.
- **Complexity**: 2 stages + guaranteed Boss.
- **Discovery**: 30% chance for 2 child nodes.
- **Enemies**: `bat_small`, `spider_minor`.

### `reg_calmed_beach` (Coastal Path)
- **Pattern**: Linear exploration of the coastline.
- **Complexity**: 3 stages.
- **Discovery**: 100% chance for 1 child node.
- **Enemies**: `crab_shell`, `water_spirit_minor`.

### `reg_whispering_forest` (The Labyrinth)
- **Pattern**: High branching. The path is never the same.
- **Complexity**: 2-4 stages.
- **Discovery**: 50% chance for 2 child nodes, 10% chance for 3.
- **Enemies**: `giant_spider`, `harpy_scout`.

### `reg_stony_foothills` (The Ascent)
- **Pattern**: Steady climb.
- **Complexity**: 3-5 stages.
- **Discovery**: 100% chance for 1 child node.
- **Enemies**: `goblin_grunt`, `goblin_scout`.

### `reg_murky_swamp` (The Hidden Trails)
- **Pattern**: Intel-based discovery.
- **Complexity**: 4 stages.
- **Discovery**: Requires "Swamp Map" items to unlock deeper nodes.
- **Enemies**: `zombie_shambler`, `wraith_minor`.

### `reg_forgotten_ruins` (The Dead End)
- **Pattern**: Looping paths.
- **Complexity**: 4-6 stages + Boss at midpoint.
- **Discovery**: Nodes often loop back to previous sub-regions.
- **Enemies**: `skeleton_warrior`, `skeleton_archer`.

### `reg_iron_peaks` (Industrial Gauntlet)
- **Pattern**: Linear, resource-heavy missions.
- **Complexity**: 5 stages.
- **Discovery**: 100% chance for 1 child node.
- **Enemies**: `orc_grunt`, `rock_golem`.

### `reg_crystal_hollow` (Spectral Veins)
- **Pattern**: Unstable magic paths.
- **Complexity**: 3-5 stages.
- **Discovery**: 40% chance for a node to "Collapse" (disappear) after 3 days if not entered.
- **Enemies**: `elemental_earth`, `spirit_echo`.

### `reg_great_desert` (The Vast Nothing)
- **Pattern**: Wide branching, survival focus.
- **Complexity**: 6 stages.
- **Discovery**: 70% chance for 2 child nodes.
- **Enemies**: `sandworm`, `scorpion_giant`.

### `reg_obsidian_crater` (The Vertical Drop)
- **Pattern**: Narrow, deep progression.
- **Complexity**: 6-8 stages.
- **Discovery**: Always linear, but with high stat jumps.
- **Enemies**: `fire_elemental`, `magma_golem`.

### `reg_ancient_library` (The Puzzle Halls)
- **Pattern**: Logic-gated discovery.
- **Complexity**: 8 stages.
- **Discovery**: Nodes unlock in "Wings" (e.g., clear 3 in Wing A to open Wing B).
- **Enemies**: `ghost_scholar`, `construct_sentinel`.

### `reg_frostbite_tundra` (The Frozen Waste)
- **Pattern**: Long, grueling treks.
- **Complexity**: 8 stages.
- **Discovery**: 50% chance for 1 child node, 50% chance for 2.
- **Enemies**: `ice_wolf`, `frost_giant`.

### `reg_sky_fortress` (The Cloud Climb)
- **Pattern**: Strict vertical progression.
- **Complexity**: 10 stages (Bosses at 5 and 10).
- **Discovery**: Linear, no branching allowed.
- **Enemies**: `harpy_warrior`, `gryphon_knight`.

### `reg_dragon_maw` (The Final Gauntlet)
- **Pattern**: Extreme branching and depth.
- **Complexity**: 12 stages.
- **Discovery**: 60% chance for 2 child nodes, 20% chance for 3.
- **Enemies**: `dragonkin`, `fire_drake`.


---

## 5. Technical Spec: Generation Workflow

1. **Trigger**: Player completes Expedition `exp_01` in Region `R`.
2. **Evaluate**: 
   - Increment `R.clears`.
   - Roll for branching factor (based on `R.branching`).
3. **Instantiate**:
   - Create `exp_02` (and `exp_03` if branched).
   - Set `dependencyId = exp_01`.
   - **Roll Stages**: Determine stage count and enemy groups using `R.enemyPool`.
   - **Snap Levels**: Set enemy levels based on current `R.clears`.
   - **Bake Rewards**: Calculate gold and item rewards.
4. **Save**: The new expeditions are added to the region's `availableMissions` list.
