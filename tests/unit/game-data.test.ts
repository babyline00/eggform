import {
  EGG_TYPES,
  ANIMAL_TYPES,
  INCUBATOR_TYPES,
  MISSIONS,
  RARITY_LABEL,
  eggTypeBySlug,
  animalTypeBySlug,
  animalTypeForEgg,
} from '@/lib/game-data'

describe('game data', () => {
  describe('EGG_TYPES', () => {
    it('has 5 egg types', () => {
      expect(EGG_TYPES).toHaveLength(5)
    })
    it('has required slugs', () => {
      const slugs = EGG_TYPES.map((e) => e.slug)
      expect(slugs).toEqual(['basic', 'silver', 'golden', 'diamond', 'legendary'])
    })
    it('has escalating virtual values', () => {
      const values = EGG_TYPES.map((e) => e.virtualValue)
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1])
      }
    })
    it('has escalating formation durations', () => {
      const durations = EGG_TYPES.map((e) => e.formationDurationSec)
      for (let i = 1; i < durations.length; i++) {
        expect(durations[i]).toBeGreaterThan(durations[i - 1])
      }
    })
    it('all rarities are valid', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']
      EGG_TYPES.forEach((e) => {
        expect(validRarities).toContain(e.rarity)
      })
    })
    it('all eggs have required fields', () => {
      EGG_TYPES.forEach((e) => {
        expect(e.id).toBeDefined()
        expect(e.name).toBeDefined()
        expect(e.animalSlug).toBeDefined()
        expect(e.formationDurationSec).toBeGreaterThan(0)
        expect(e.virtualValue).toBeGreaterThan(0)
        expect(e.marketplaceAllowed).toBe(true)
      })
    })
  })

  describe('ANIMAL_TYPES', () => {
    it('has matching animal for each egg', () => {
      EGG_TYPES.forEach((egg) => {
        const animal = animalTypeForEgg(egg.slug)
        expect(animal).toBeDefined()
        expect(animal?.slug).toBe(egg.animalSlug)
      })
    })
    it('has production rate > 0 for all animals', () => {
      ANIMAL_TYPES.forEach((a) => {
        expect(a.baseProduction).toBeGreaterThan(0)
      })
    })
  })

  describe('INCUBATOR_TYPES', () => {
    it('has 4 tiers', () => {
      expect(INCUBATOR_TYPES).toHaveLength(4)
    })
    it('has escalating capacity and speed', () => {
      const capacities = INCUBATOR_TYPES.map((i) => i.capacity)
      const speeds = INCUBATOR_TYPES.map((i) => i.speedMultiplier)
      for (let i = 1; i < capacities.length; i++) {
        expect(capacities[i]).toBeGreaterThan(capacities[i - 1])
        expect(speeds[i]).toBeGreaterThan(speeds[i - 1])
      }
    })
  })

  describe('MISSIONS', () => {
    it('has at least 5 missions', () => {
      expect(MISSIONS.length).toBeGreaterThanOrEqual(5)
    })
    it('all missions have positive rewards', () => {
      MISSIONS.forEach((m) => {
        expect(m.rewardCoins).toBeGreaterThanOrEqual(0)
        expect(m.rewardGems).toBeGreaterThanOrEqual(0)
        expect(m.rewardXp).toBeGreaterThanOrEqual(0)
        expect(m.target).toBeGreaterThan(0)
      })
    })
    it('has daily, weekly, and one_time types', () => {
      const types = MISSIONS.map((m) => m.type)
      expect(types).toContain('daily')
      expect(types).toContain('weekly')
      expect(types).toContain('one_time')
    })
  })

  describe('RARITY_LABEL', () => {
    it('has all 5 rarities defined', () => {
      expect(Object.keys(RARITY_LABEL)).toEqual(
        expect.arrayContaining(['common', 'uncommon', 'rare', 'epic', 'legendary']),
      )
    })
    it('each rarity has label, color, bg, ring, glow', () => {
      Object.entries(RARITY_LABEL).forEach(([key, value]) => {
        expect(value.label).toBeDefined()
        expect(value.color).toBeDefined()
        expect(value.bg).toBeDefined()
        expect(value.ring).toBeDefined()
        expect(value.glow).toBeDefined()
      })
    })
  })

  describe('lookup functions', () => {
    it('eggTypeBySlug returns correct egg', () => {
      expect(eggTypeBySlug('golden')?.name).toBe('Golden Egg')
      expect(eggTypeBySlug('nonexistent')).toBeUndefined()
    })
    it('animalTypeBySlug returns correct animal', () => {
      expect(animalTypeBySlug('chicken-golden')?.name).toBe('Golden Chicken')
      expect(animalTypeBySlug('nonexistent')).toBeUndefined()
    })
    it('animalTypeForEgg returns matching animal', () => {
      expect(animalTypeForEgg('legendary')?.slug).toBe('animal-legendary')
      expect(animalTypeForEgg('nonexistent')).toBeUndefined()
    })
  })
})
