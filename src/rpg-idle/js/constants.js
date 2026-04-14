export const SKILLS_DATA = {
    basic_attack: {
        id: 'basic_attack',
        category: 'physical',
        stat: 'strength',
        baseMultiplier: 1.0,
        mpCost: 0,
        tier: 1,
        unlockCost: 0,
        targetType: 'single_enemy'
    },
    double_attack: {
        id: 'double_attack',
        category: 'physical',
        stat: 'strength',
        baseMultiplier: 0.7,
        mpCost: 10,
        tier: 2,
        unlockCost: 2,
        dependency: 'basic_attack',
        targetType: 'single_enemy'
    },
    triple_attack: {
        id: 'triple_attack',
        category: 'physical',
        stat: 'strength',
        baseMultiplier: 0.6,
        mpCost: 20,
        tier: 3,
        unlockCost: 5,
        dependency: 'double_attack',
        targetType: 'single_enemy'
    },
    whirlwind: {
        id: 'whirlwind',
        category: 'physical',
        stat: 'strength',
        baseMultiplier: 0.6,
        mpCost: 15,
        tier: 2,
        unlockCost: 3,
        dependency: 'basic_attack',
        targetType: 'all_enemies'
    },
    blade_dance: {
        id: 'blade_dance',
        category: 'physical',
        stat: 'strength',
        baseMultiplier: 0.4,
        mpCost: 35,
        tier: 3,
        unlockCost: 7,
        dependency: 'whirlwind',
        targetType: 'all_enemies'
    },
    small_fire_ball: {
        id: 'small_fire_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.2,
        mpCost: 10,
        element: 'fire',
        tier: 1,
        unlockCost: 1,
        targetType: 'single_enemy'
    },
    medium_fire_ball: {
        id: 'medium_fire_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.8,
        mpCost: 25,
        element: 'fire',
        tier: 2,
        unlockCost: 3,
        dependency: 'small_fire_ball',
        targetType: 'single_enemy'
    },
    meteor: {
        id: 'meteor',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 2.2,
        mpCost: 50,
        element: 'fire',
        tier: 3,
        unlockCost: 10,
        dependency: 'medium_fire_ball',
        targetType: 'single_enemy',
        splash: 0.3
    },
    small_water_ball: {
        id: 'small_water_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.2,
        mpCost: 10,
        element: 'water',
        tier: 1,
        unlockCost: 1,
        targetType: 'single_enemy'
    },
    blizzard: {
        id: 'blizzard',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.0,
        mpCost: 30,
        element: 'water',
        tier: 2,
        unlockCost: 5,
        dependency: 'small_water_ball',
        targetType: 'all_enemies'
    },
    tsunami: {
        id: 'tsunami',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.6,
        mpCost: 60,
        element: 'water',
        tier: 3,
        unlockCost: 10,
        dependency: 'blizzard',
        targetType: 'all_enemies'
    },
    small_wind_ball: {
        id: 'small_wind_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.2,
        mpCost: 10,
        element: 'wind',
        tier: 1,
        unlockCost: 1,
        targetType: 'single_enemy'
    },
    medium_wind_ball: {
        id: 'medium_wind_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.8,
        mpCost: 25,
        element: 'wind',
        tier: 2,
        unlockCost: 3,
        dependency: 'small_wind_ball',
        targetType: 'single_enemy'
    },
    big_wind_ball: {
        id: 'big_wind_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 2.5,
        mpCost: 45,
        element: 'wind',
        tier: 3,
        unlockCost: 8,
        dependency: 'medium_wind_ball',
        targetType: 'single_enemy'
    },
    small_storm_ball: {
        id: 'small_storm_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.2,
        mpCost: 10,
        element: 'storm',
        tier: 1,
        unlockCost: 1,
        targetType: 'single_enemy'
    },
    chain_lightning: {
        id: 'chain_lightning',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 1.5,
        mpCost: 40,
        element: 'storm',
        tier: 2,
        unlockCost: 6,
        dependency: 'small_storm_ball',
        targetType: 'single_enemy',
        jump: 0.8
    },
    big_storm_ball: {
        id: 'big_storm_ball',
        category: 'magic',
        stat: 'magicPower',
        baseMultiplier: 2.5,
        mpCost: 45,
        element: 'storm',
        tier: 3,
        unlockCost: 8,
        dependency: 'chain_lightning',
        targetType: 'single_enemy'
    },
    poison_dart: {
        id: 'poison_dart',
        category: 'tricker',
        stat: 'strength',
        baseMultiplier: 0.8,
        mpCost: 5,
        tier: 1,
        unlockCost: 2,
        targetType: 'single_enemy'
    },
    steal: {
        id: 'steal',
        category: 'tricker',
        stat: 'speed',
        baseMultiplier: 0,
        mpCost: 10,
        tier: 2,
        unlockCost: 4,
        dependency: 'poison_dart',
        targetType: 'single_enemy'
    },
    haste: {
        id: 'haste',
        category: 'support',
        stat: 'speed',
        mpCost: 15,
        tier: 2,
        unlockCost: 4,
        targetType: 'single_ally'
    },
    basic_heal: {
        id: 'basic_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.3,
        mpCost: 10,
        tier: 1,
        unlockCost: 1,
        targetType: 'single_ally'
    },
    small_heal: {
        id: 'small_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.2,
        mpCost: 8,
        tier: 1,
        unlockCost: 1,
        targetType: 'single_ally'
    },
    medium_heal: {
        id: 'medium_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.5,
        mpCost: 20,
        tier: 2,
        unlockCost: 3,
        dependency: 'small_heal',
        targetType: 'single_ally'
    },
    high_heal: {
        id: 'high_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.85,
        mpCost: 40,
        tier: 3,
        unlockCost: 7,
        dependency: 'medium_heal',
        targetType: 'single_ally'
    },
    small_group_heal: {
        id: 'small_group_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.1,
        mpCost: 15,
        tier: 1,
        unlockCost: 2,
        targetType: 'all_allies'
    },
    medium_group_heal: {
        id: 'medium_group_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.35,
        mpCost: 35,
        tier: 2,
        unlockCost: 5,
        dependency: 'small_group_heal',
        targetType: 'all_allies'
    },
    high_group_heal: {
        id: 'high_group_heal',
        category: 'support',
        stat: 'magicPower',
        power: 0.65,
        mpCost: 65,
        tier: 3,
        unlockCost: 10,
        dependency: 'medium_group_heal',
        targetType: 'all_allies'
    }
};

export const WEAPON_FAMILIES = {
    dagger: {
        id: 'dagger',
        spdBonus: 2,
        evaBonus: 5,
        dmgMult: 0.8
    },
    broadsword: {
        id: 'broadsword',
        spdBonus: 0,
        evaBonus: 0,
        dmgMult: 1.0
    },
    battle_axe: {
        id: 'battle_axe',
        spdBonus: -2,
        evaBonus: 0,
        dmgMult: 1.5
    },
    wand: {
        id: 'wand',
        spdBonus: 0,
        evaBonus: 0,
        dmgMult: 0.4,
        magBonus: 5,
        mpCostReduction: 0.1
    }
};

export const MATERIAL_TIERS = {
    wooden: { id: 'wooden', levelReq: 1, mult: 1.0 },
    iron: { id: 'iron', levelReq: 2, mult: 1.5 },
    steel: { id: 'steel', levelReq: 3, mult: 2.2 },
    gold: { id: 'gold', levelReq: 4, mult: 3.5 },
    mythril: { id: 'mythril', levelReq: 5, mult: 5.0 }
};

export const ARMOR_ARCHETYPES = {
    plate: { id: 'plate', defMult: 2.0, hpMult: 1.2, spdPenalty: -3, evaPenalty: -10 },
    leather: { id: 'leather', defMult: 1.0, evaBonus: 10, spdPenalty: 0 },
    robes: { id: 'robes', defMult: 0.5, mpMult: 1.5, magMult: 1.2, spdPenalty: 0 }
};
