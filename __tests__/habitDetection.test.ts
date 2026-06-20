import { detectHabitChanges } from '../src/lib/habitDetection';

describe('habitDetection - detectHabitChanges', () => {
  const mockDate = new Date();
  
  it('detects positive changePercent on increasing values', () => {
    const history = [
      { profile: {} as any, breakdown: { transport: 1200, diet: 1000, shopping: 1000, energy: 1000, digital: 1000, total: 5200 } as any, timestamp: new Date(mockDate.getTime()) },
      { profile: {} as any, breakdown: { transport: 1000, diet: 1000, shopping: 1000, energy: 1000, digital: 1000, total: 5000 } as any, timestamp: new Date(mockDate.getTime() - 1000) }
    ];
    const insights = detectHabitChanges(history);
    const transportInsight = insights.find(i => i.category === 'transport');
    expect(transportInsight).toBeDefined();
    expect(transportInsight!.changePercent).toBe(20);
    expect(transportInsight!.insight).toContain('rose 20%');
  });

  it('returns empty array when history has only 1 entry', () => {
    const history = [
      { profile: {} as any, breakdown: {} as any, timestamp: mockDate }
    ];
    const insights = detectHabitChanges(history);
    expect(insights).toHaveLength(0);
  });

  it('excludes changes <= 10%', () => {
    const history = [
      { profile: {} as any, breakdown: { transport: 1050, diet: 1000, shopping: 1000, energy: 1000, digital: 1000, total: 5050 } as any, timestamp: new Date(mockDate.getTime()) },
      { profile: {} as any, breakdown: { transport: 1000, diet: 1000, shopping: 1000, energy: 1000, digital: 1000, total: 5000 } as any, timestamp: new Date(mockDate.getTime() - 1000) }
    ];
    const insights = detectHabitChanges(history);
    expect(insights).toHaveLength(0);
  });

  it('generates string insight for negative change > 10%', () => {
    const history = [
      { profile: {} as any, breakdown: { shopping: 800, transport: 1000, diet: 1000, energy: 1000, digital: 1000 } as any, timestamp: new Date(mockDate.getTime()) },
      { profile: {} as any, breakdown: { shopping: 1000, transport: 1000, diet: 1000, energy: 1000, digital: 1000 } as any, timestamp: new Date(mockDate.getTime() - 1000) }
    ];
    const insights = detectHabitChanges(history);
    const shoppingInsight = insights.find(i => i.category === 'shopping');
    expect(shoppingInsight).toBeDefined();
    expect(shoppingInsight!.changePercent).toBe(-20);
    expect(shoppingInsight!.insight).toContain('dropped 20%');
  });
});
