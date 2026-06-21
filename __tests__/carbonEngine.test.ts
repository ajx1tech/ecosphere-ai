import {
  calculateFootprint,
  deriveCarbonDNA,
  calculateRiskScore,
  generateCarbonTwin,
  runWhatIfSimulation,
  rankRecommendations
} from '../src/lib/carbonEngine';
import { CarbonProfile, FootprintBreakdown } from '../src/lib/types';

describe('carbonEngine - calculateFootprint', () => {
  const baseProfile: CarbonProfile = {
    transportMode: 'car-solo', commuteDistanceKm: 10, flightsPerYear: 0,
    dietType: 'moderate-meat', foodDeliveryPerWeek: 0, onlineShoppingPerMonth: 0,
    fastFashionPerMonth: 0, electricityKwhPerMonth: 200, homeSize: 'medium',
    householdSize: 2, streamingHoursPerDay: 0, workMode: 'remote', region: 'NA'
  };

  it('transport mode ordering: bike-walk < public-transit < car-pool < car-solo', () => {
    const fBike = calculateFootprint({ ...baseProfile, transportMode: 'bike-walk' }).transport;
    const fTransit = calculateFootprint({ ...baseProfile, transportMode: 'public-transit' }).transport;
    const fCarpool = calculateFootprint({ ...baseProfile, transportMode: 'car-pool' }).transport;
    const fSolo = calculateFootprint({ ...baseProfile, transportMode: 'car-solo' }).transport;

    expect(fBike).toBeLessThan(fTransit);
    expect(fTransit).toBeLessThan(fCarpool);
    expect(fCarpool).toBeLessThan(fSolo);
  });

  it('flights add expected increment (250kg per flight)', () => {
    const f0 = calculateFootprint({ ...baseProfile, flightsPerYear: 0 }).transport;
    const f2 = calculateFootprint({ ...baseProfile, flightsPerYear: 2 }).transport;
    expect(f2 - f0).toBe(500);
  });

  it('diet ordering: vegan < vegetarian < pescatarian < moderate-meat < high-meat', () => {
    const dVegan = calculateFootprint({ ...baseProfile, dietType: 'vegan' }).diet;
    const dVeg = calculateFootprint({ ...baseProfile, dietType: 'vegetarian' }).diet;
    const dPesc = calculateFootprint({ ...baseProfile, dietType: 'pescatarian' }).diet;
    const dMod = calculateFootprint({ ...baseProfile, dietType: 'moderate-meat' }).diet;
    const dHigh = calculateFootprint({ ...baseProfile, dietType: 'high-meat' }).diet;

    expect(dVegan).toBeLessThan(dVeg);
    expect(dVeg).toBeLessThan(dPesc);
    expect(dPesc).toBeLessThan(dMod);
    expect(dMod).toBeLessThan(dHigh);
  });
});

describe('carbonEngine - deriveCarbonDNA', () => {
  const mockBreakdown = (overrides: Partial<FootprintBreakdown>): FootprintBreakdown => ({
    transport: 1000, diet: 1000, shopping: 1000, energy: 1000, digital: 1000, total: 5000, unit: 'kg CO2e/year', ...overrides
  });
  const mockProfile = (overrides: Partial<CarbonProfile>): CarbonProfile => ({
    transportMode: 'car-solo', commuteDistanceKm: 10, flightsPerYear: 0,
    dietType: 'moderate-meat', foodDeliveryPerWeek: 0, onlineShoppingPerMonth: 0,
    fastFashionPerMonth: 0, electricityKwhPerMonth: 200, homeSize: 'medium',
    householdSize: 2, streamingHoursPerDay: 0, workMode: 'remote', region: 'NA', ...overrides
  });

  it('identifies Frequent Flyer', () => {
    const dna = deriveCarbonDNA(mockProfile({ flightsPerYear: 4 }), mockBreakdown({ transport: 5000, total: 9000 }));
    expect(dna.archetype).toBe('Frequent Flyer');
  });

  it('identifies Convenience Consumer', () => {
    const dna = deriveCarbonDNA(mockProfile({}), mockBreakdown({ shopping: 6000, total: 10000 }));
    expect(dna.archetype).toBe('Convenience Consumer');
  });

  it('identifies Traditional Eater', () => {
    const dna = deriveCarbonDNA(mockProfile({ dietType: 'high-meat' }), mockBreakdown({ diet: 5000, total: 9000 }));
    expect(dna.archetype).toBe('Traditional Eater');
  });

  it('identifies Eco Minimalist', () => {
    const dna = deriveCarbonDNA(mockProfile({}), mockBreakdown({ total: 1500, energy: 600, shopping: 200, transport: 200, diet: 200, digital: 300 }));
    expect(dna.archetype).toBe('Eco Minimalist');
  });
});

describe('carbonEngine - calculateRiskScore', () => {
  it('bounds score between 0 and 100', () => {
    expect(calculateRiskScore({ total: 0 } as FootprintBreakdown)).toBe(100);
    expect(calculateRiskScore({ total: 15000 } as FootprintBreakdown)).toBe(0);
  });

  it('higher footprint equals lower score', () => {
    const scoreLow = calculateRiskScore({ total: 2000 } as FootprintBreakdown);
    const scoreHigh = calculateRiskScore({ total: 8000 } as FootprintBreakdown);
    expect(scoreLow).toBeGreaterThan(scoreHigh);
  });
});

describe('carbonEngine - generateCarbonTwin', () => {
  const profile: CarbonProfile = {
    transportMode: 'car-solo', commuteDistanceKm: 20, flightsPerYear: 3,
    dietType: 'high-meat', foodDeliveryPerWeek: 2, onlineShoppingPerMonth: 5,
    fastFashionPerMonth: 2, electricityKwhPerMonth: 400, homeSize: 'large',
    householdSize: 2, streamingHoursPerDay: 5, workMode: 'office', region: 'NA'
  };

  it('twinFootprint is less than currentFootprint', () => {
    const breakdown = calculateFootprint(profile);
    const twin = generateCarbonTwin(profile, breakdown);
    expect(twin.twinFootprint).toBeLessThan(twin.currentFootprint);
    expect(twin.savingsKg).toBeGreaterThan(0);
  });

  it('equivalents are non-negative', () => {
    const breakdown = calculateFootprint(profile);
    const twin = generateCarbonTwin(profile, breakdown);
    expect(twin.equivalents.treesPlanted).toBeGreaterThanOrEqual(0);
    expect(twin.equivalents.phoneChargesSaved).toBeGreaterThanOrEqual(0);
    expect(twin.equivalents.carsOffRoad).toBeGreaterThanOrEqual(0);
  });
});

describe('carbonEngine - runWhatIfSimulation', () => {
  const profile: CarbonProfile = {
    transportMode: 'car-solo', commuteDistanceKm: 15, flightsPerYear: 1,
    dietType: 'moderate-meat', foodDeliveryPerWeek: 1, onlineShoppingPerMonth: 2,
    fastFashionPerMonth: 1, electricityKwhPerMonth: 250, homeSize: 'medium',
    householdSize: 2, streamingHoursPerDay: 3, workMode: 'hybrid', region: 'NA'
  };

  it('Full Transition projects lower than Business as Usual', () => {
    const scenarios = runWhatIfSimulation(profile, { dietType: 'vegan', transportMode: 'bike-walk' });
    const bau = scenarios.find(s => s.label === 'Business as Usual');
    const full = scenarios.find(s => s.label === 'Full Transition');
    expect(full!.year2050).toBeLessThan(bau!.year2050);
  });
});

describe('carbonEngine - rankRecommendations', () => {
  const profile: CarbonProfile = {
    transportMode: 'car-solo', commuteDistanceKm: 15, flightsPerYear: 1,
    dietType: 'high-meat', foodDeliveryPerWeek: 1, onlineShoppingPerMonth: 4,
    fastFashionPerMonth: 1, electricityKwhPerMonth: 250, homeSize: 'medium',
    householdSize: 2, streamingHoursPerDay: 3, workMode: 'hybrid', region: 'NA'
  };

  it('sorts descending by estimated savings', () => {
    const recs = rankRecommendations(profile);
    
    expect(recs.length).toBeGreaterThan(0);
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].estimatedSavingsKg).toBeGreaterThanOrEqual(recs[i + 1].estimatedSavingsKg);
    }
  });
});
