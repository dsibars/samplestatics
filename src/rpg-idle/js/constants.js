export const SKILLS_DATA = {
    // Physical
    basic_attack: {
        id: 'basic_attack',
        category: 'physical',
        group: 'multi_attack',
        tier: 1,
        unlockCost: 0, // Everyone starts with this
        enhanceCostBase: 1,
        baseMultiplier: 1.0,
        mpCost: 0,
        stat: 'strength'
    },
    double_attack: {
        id: 'double_attack',
        category: 'physical',
        group: 'multi_attack',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        baseMultiplier: 0.6, // Per hit (60% x 2 = 120%)
        mpCost: 10,
        stat: 'strength',
        dependency: 'basic_attack'
    },
    triple_attack: {
        id: 'triple_attack',
        category: 'physical',
        group: 'multi_attack',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        baseMultiplier: 0.45, // Per hit (45% x 3 = 135%)
        mpCost: 20,
        stat: 'strength',
        dependency: 'double_attack'
    },

    // Magic - Fire
    small_fire_ball: {
        id: 'small_fire_ball',
        category: 'magic',
        group: 'ball_fire',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.8,
        mpCost: 10,
        stat: 'magicPower'
    },
    medium_fire_ball: {
        id: 'medium_fire_ball',
        category: 'magic',
        group: 'ball_fire',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        baseMultiplier: 1.2,
        mpCost: 20,
        stat: 'magicPower',
        dependency: 'small_fire_ball'
    },
    big_fire_ball: {
        id: 'big_fire_ball',
        category: 'magic',
        group: 'ball_fire',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        baseMultiplier: 1.8,
        mpCost: 35,
        stat: 'magicPower',
        dependency: 'medium_fire_ball'
    },

    // Magic - Ice
    small_ice_ball: {
        id: 'small_ice_ball',
        category: 'magic',
        group: 'ball_ice',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.8,
        mpCost: 10,
        stat: 'magicPower'
    },
    medium_ice_ball: {
        id: 'medium_ice_ball',
        category: 'magic',
        group: 'ball_ice',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        baseMultiplier: 1.2,
        mpCost: 20,
        stat: 'magicPower',
        dependency: 'small_ice_ball'
    },
    big_ice_ball: {
        id: 'big_ice_ball',
        category: 'magic',
        group: 'ball_ice',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        baseMultiplier: 1.8,
        mpCost: 35,
        stat: 'magicPower',
        dependency: 'medium_ice_ball'
    },

    // Magic - Wind
    small_wind_ball: {
        id: 'small_wind_ball',
        category: 'magic',
        group: 'ball_wind',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.8,
        mpCost: 10,
        stat: 'magicPower'
    },
    medium_wind_ball: {
        id: 'medium_wind_ball',
        category: 'magic',
        group: 'ball_wind',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        baseMultiplier: 1.2,
        mpCost: 20,
        stat: 'magicPower',
        dependency: 'small_wind_ball'
    },
    big_wind_ball: {
        id: 'big_wind_ball',
        category: 'magic',
        group: 'ball_wind',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        baseMultiplier: 1.8,
        mpCost: 35,
        stat: 'magicPower',
        dependency: 'medium_wind_ball'
    },

    // Magic - Storm
    small_storm_ball: {
        id: 'small_storm_ball',
        category: 'magic',
        group: 'ball_storm',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.8,
        mpCost: 10,
        stat: 'magicPower'
    },
    medium_storm_ball: {
        id: 'medium_storm_ball',
        category: 'magic',
        group: 'ball_storm',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        baseMultiplier: 1.2,
        mpCost: 20,
        stat: 'magicPower',
        dependency: 'small_storm_ball'
    },
    big_storm_ball: {
        id: 'big_storm_ball',
        category: 'magic',
        group: 'ball_storm',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        baseMultiplier: 1.8,
        mpCost: 35,
        stat: 'magicPower',
        dependency: 'medium_storm_ball'
    },

    // Tricker (Placeholders)
    poison_dart: {
        id: 'poison_dart',
        category: 'tricker',
        group: 'poison',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.5,
        mpCost: 12,
        stat: 'strength'
    },
    steal: {
        id: 'steal',
        category: 'tricker',
        group: 'theft',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        baseMultiplier: 0.1,
        mpCost: 5,
        stat: 'speed'
    },

    // Support
    small_heal: {
        id: 'small_heal',
        category: 'support',
        group: 'healing',
        tier: 1,
        unlockCost: 1,
        enhanceCostBase: 1,
        power: 0.20,
        mpCost: 10,
        stat: 'magicPower',
        targetType: 'ally'
    },
    medium_heal: {
        id: 'medium_heal',
        category: 'support',
        group: 'healing',
        tier: 2,
        unlockCost: 20,
        enhanceCostBase: 2,
        power: 0.50,
        mpCost: 25,
        stat: 'magicPower',
        targetType: 'ally',
        dependency: 'small_heal'
    },
    high_heal: {
        id: 'high_heal',
        category: 'support',
        group: 'healing',
        tier: 3,
        unlockCost: 50,
        enhanceCostBase: 4,
        power: 0.85,
        mpCost: 45,
        stat: 'magicPower',
        targetType: 'ally',
        dependency: 'medium_heal'
    },
    small_group_heal: {
        id: 'small_group_heal',
        category: 'support',
        group: 'healing_group',
        tier: 1,
        unlockCost: 10,
        enhanceCostBase: 2,
        power: 0.10,
        mpCost: 20,
        stat: 'magicPower',
        targetType: 'all'
    },
    medium_group_heal: {
        id: 'medium_group_heal',
        category: 'support',
        group: 'healing_group',
        tier: 2,
        unlockCost: 35,
        enhanceCostBase: 4,
        power: 0.35,
        mpCost: 45,
        stat: 'magicPower',
        targetType: 'all',
        dependency: 'small_group_heal'
    },
    high_group_heal: {
        id: 'high_group_heal',
        category: 'support',
        group: 'healing_group',
        tier: 3,
        unlockCost: 75,
        enhanceCostBase: 8,
        power: 0.65,
        mpCost: 80,
        stat: 'magicPower',
        targetType: 'all',
        dependency: 'medium_group_heal'
    }
};
