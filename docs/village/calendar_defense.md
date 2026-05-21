# Calendar & Defense Events (C5)

## Overview
The Calendar & Defense system adds a seasonal cycle and periodic raid events that threaten the village. Players must assign idle heroes to defense positions to protect against incoming raids. Raids are auto-resolved based on defense power vs raid power.

## Season System

### Seasons
- **Spring** (Days 1-30): +5% growth bonus
- **Summer** (Days 31-60): +10% farm production bonus
- **Autumn** (Days 61-90): +10% miner production bonus
- **Winter** (Days 91-120): -10% farm production penalty

### Cycle
- Each season lasts 30 days
- Year cycles every 120 days
- Season effects are applied passively during production calculations

## Raid Events

### Generation
- First raid occurs no earlier than Day 7
- Subsequent raids occur every 7-14 days (pseudo-random, deterministic per day seed)
- Events are generated 14 days in advance
- Old resolved events are cleaned up automatically

### Raid Scaling
- **Level**: `max(1, floor(day / 10) + floor(totalRegionClears / 5))`
- **Enemy Count**: `min(6, 2 + floor(day / 20))`
- **Enemy Pool**: Scales with day — basic enemies early, advanced at day 20+, bosses at day 40+

### Defense Assignment
- Up to 4 heroes can be assigned to defense at any time
- Only idle heroes with HP > 0 can be assigned
- Defense assignments persist until the raid is resolved
- After a raid, all defenders are automatically unassigned

### Defense Power Calculation
- Sum of each defender's `strength + defense + (maxHp / 10)`
- +10 power per Housing level
- +5 power per assigned Scout worker

### Raid Resolution (Auto)
- Win chance: `clamp(0.15, 0.5 + (defensePower - raidPower) / raidPower * 0.3, 0.95)`
- **Victory**: Gold reward = `raidLevel * 10 + random(0-20)`
- **Defeat**: 
  - Lose 3-8 wood and 3-8 stone
  - 15% chance to damage a random building (level -1)
- **Defender Damage**: 15% max HP on victory, 40% max HP on defeat (minimum 1 HP)

## UI Components

### Calendar Widget
- Shows current season with icon (🌸☀️🍂❄️)
- Shows day of season (e.g., "Spring (15/30)")
- Lists up to 5 upcoming events with day offset labels ("Today", "Tomorrow", "D+3")
- Raid events highlighted in red when within 2 days

### Defense Widget
- Shows assigned defenders as removable chips
- Shows count "(N/4)"
- Lists available idle heroes as assignable buttons
- Max 4 defenders; buttons disabled when full

### Daily Report Integration
- Raid results appear in the daily report
- Victory: green section with defense/raid power and gold earned
- Defeat: red section with losses and building damage

## Files

- `js/engine/calendar/services/CalendarService.js` — Core calendar & raid logic
- `js/engine/GameEngine.js` — Facade methods: `assignDefense`, `unassignDefense`, `getCalendarState`
- `js/presentation/ui/village/VillageView.js` — Calendar & defense UI rendering
- `js/presentation/adapters/EngineAdapter.js` — Event wiring for `assignDefense`/`unassignDefense`
- `pages/village.html` — Calendar & defense widget markup

## i18n Keys

| Key | Description |
|-----|-------------|
| `season_spring/summer/autumn/winter` | Season names |
| `ui_no_events` | Empty calendar state |
| `event_raid` | Raid event label |
| `ui_defense` | Defense widget title |
| `ui_no_defenders` | Empty defense state |
| `ui_assign_defender` | Assign button section label |
| `ui_remove` | Remove defender tooltip |
| `error_max_defenders` | Max 4 defenders error |
| `error_already_assigned` | Hero already on defense |
| `error_not_assigned` | Hero not on defense |
| `ui_today`/`ui_tomorrow` | Event day labels |
| `ui_report_raid_victory` | Victory report string |
| `ui_report_raid_defeat` | Defeat report string |
| `ui_report_raid_damaged` | Building damage suffix |

## Persistence

Calendar state is saved under key `calendar_state` with:
- `events`: Array of `{ day, type, resolved, data }`
- `defenseAssigned`: Array of hero IDs
