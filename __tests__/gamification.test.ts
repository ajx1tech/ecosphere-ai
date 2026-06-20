import { calculateLevel, generateWeeklyMissions } from '../src/lib/gamification';
import { CarbonProfile, FootprintBreakdown } from '../src/lib/types';

describe('gamification - calculateLevel', () => {
  it('handles XP boundaries correctly', () => {
    expect(calculateLevel(0).level).toBe(1);
    expect(calculateLevel(99).level).toBe(1);
    expect(calculateLevel(100).level).toBe(2);
    expect(calculateLevel(299).level).toBe(2);
    expect(calculateLevel(300).level).toBe(3);
    expect(calculateLevel(599).level).toBe(3);
    expect(calculateLevel(600).level).toBe(4);
    expect(calculateLevel(1000).level).toBe(4);
  });
});

describe('gamification - generateWeeklyMissions', () => {
  const profile: CarbonProfile = {
    transportMode: 'car-solo', commuteDistanceKm: 15, flightsPerYear: 1,
    dietType: 'moderate-meat', foodDeliveryPerWeek: 1, onlineShoppingPerMonth: 2,
    fastFashionPerMonth: 1, electricityKwhPerMonth: 250, homeSize: 'medium',
    householdSize: 2, streamingHoursPerDay: 3, workMode: 'hybrid', region: 'NA'
  };

  it('returns exactly 3 missions', () => {
    const breakdown = { transport: 2000, diet: 1000, shopping: 500, energy: 500, digital: 200, total: 4200, unit: 'kg CO2e/year' } as FootprintBreakdown;
    const missions = generateWeeklyMissions(profile, breakdown);
    expect(missions).toHaveLength(3);
  });

  it('targets the dominant footprint category (transport)', () => {
    const breakdown = { transport: 5000, diet: 1000, shopping: 500, energy: 500, digital: 200, total: 7200, unit: 'kg CO2e/year' } as FootprintBreakdown;
    const missions = generateWeeklyMissions(profile, breakdown);
    // Should contain a transport mission since car-solo and high transport
    expect(missions[0].id).toBe('transport_carpool');
  });

  it('targets the dominant footprint category (diet)', () => {
    const breakdown = { transport: 1000, diet: 5000, shopping: 500, energy: 500, digital: 200, total: 7200, unit: 'kg CO2e/year' } as FootprintBreakdown;
    const missions = generateWeeklyMissions(profile, breakdown);
    expect(missions[0].id).toBe('diet_no_meat_3_days');
  });
});
