# Magic Adventure: Gesture System Proposal

This document outlines a proposed expansion for the gesture recognition and spell system in Magic Adventure, focusing on variety, physical/magical combinations, and multi-stroke mechanics.

## 1. Core Elements (Base Shapes)

The current base shapes represent elemental affinities:
- **Circle**: Water (Fluid, defensive/versatile)
- **Square**: Earth (Solid, high damage, expensive)
- **Plus (+)**: Utility / Modifier (Multi-target, area of effect)

## 2. New Physical Gestures (The Sword System)

A new "Neutral" element category focused on "Sword" skills:

### Slashing
- **Horizontal Line (-)**: `Slash`. A basic neutral attack. Fast and low MP cost.
- **Two Horizontal Lines (=)**: `Double Slash`. Increased damage, higher MP cost.
- **Three Horizontal Lines (≡)**: `Triple Slash`. High physical damage.
- **Vertical Line (|)**: `Downward Cleave`. High critical chance.

### Special Attacks
- **Cross (X)**: `Cross-Cut`. A special physical attack with high intensity.
- **V-Shape (V)**: `Riposte`. A counter-attack style spell.

## 3. Composition & Combinations

The system should recognize multi-stroke compositions where shapes interact:

### Elemental Infusions
- **Circle + Horizontal Line**: `Water Blade`. A slash attack infused with water. Mix of physical and magical damage.
- **Square + Cross**: `Quake Strike`. Earth-infused cross attack. High impact area damage.
- **Plus (+) + Horizontal Line**: `Wide Slash`. Hits multiple targets with a physical cut.

### Advanced Conjurations
- **Triangle (Δ)**: `Fire` (Proposal for new base shape).
- **Triangle + Horizontal Line**: `Fire Brand`. A burning blade attack.
- **Circle + Circle**: `Great Bubble`. Enhanced defense or high-volume water attack.

## 4. Proportional Scaling

As implemented, the system uses a diagonal-based intensity scaling:
- **Small Gestures**: "Quick-casts". Low MP, low damage. Useful for finishing off weak enemies.
- **Medium Gestures**: Standard output.
- **Large Gestures**: "Grand Spells". Consumes significant MP but delivers massive damage.

## 5. Implementation Roadmap

1.  **LineDetector**: Implement a detector for straight lines (Horizontal, Vertical, Diagonal).
2.  **Composition Logic**: Enhance `RecognitionEngine` to detect spatial relationships between strokes (e.g., "Line is inside Circle").
3.  **Stateful Spells**: Allow the `SpellService` to maintain a "building" state where multiple strokes add up to a single final spell before "launching".
