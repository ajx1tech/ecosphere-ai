import { askSustainabilityCoach } from '../src/lib/geminiService';
import { CarbonProfile, FootprintBreakdown } from '../src/lib/types';

// Mock the GoogleGenerativeAI module
jest.mock('@google/generative-ai', () => {
  const mockSendMessage = jest.fn();
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        startChat: () => ({
          sendMessage: mockSendMessage
        })
      })
    })),
    __mockSendMessage: mockSendMessage
  };
});

describe('geminiService - askSustainabilityCoach', () => {
  const profile = {} as CarbonProfile;
  const breakdown = { total: 5000, transport: 1000, diet: 1000, shopping: 1000, energy: 1000, digital: 1000 } as FootprintBreakdown;
  const riskScore = 50;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { __mockSendMessage: mockSendMessage } = require('@google/generative-ai');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sanitizes HTML from input before sending', async () => {
    mockSendMessage.mockResolvedValueOnce({ response: { text: () => 'Mock response' } });
    
    await askSustainabilityCoach('<script>alert("xss")</script>Hello', profile, breakdown, riskScore, []);
    
    // HTML tags should be stripped, leaving "alert("xss")Hello"
    expect(mockSendMessage).toHaveBeenCalledWith('alert("xss")Hello');
  });

  it('enforces rate limiting (minimum 800ms between calls)', async () => {
    mockSendMessage.mockResolvedValue({ response: { text: () => 'Mock response' } });
    
    const start = Date.now();
    
    // First call should be immediate
    await askSustainabilityCoach('First', profile, breakdown, riskScore, []);
    
    // Second call should wait for rate limit
    await askSustainabilityCoach('Second', profile, breakdown, riskScore, []);
    
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(800);
  });

  it('returns graceful fallback message on API failure', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('API Down'));
    
    const response = await askSustainabilityCoach('Test', profile, breakdown, riskScore, []);
    expect(response).toContain("having trouble analyzing your data right now");
  });
});
