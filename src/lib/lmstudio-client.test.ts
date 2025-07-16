import { generateStory, generateBattleCommentary } from './lmstudio-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('generateStory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use custom prompt as-is when provided', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            sceneTitle: 'Test Scene',
            summary: 'A test story summary',
            dilemmas: ['Test dilemma'],
            cues: 'Test cues',
            consequences: ['Test consequence']
          })
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const customPrompt = `Custom prompt with character stats: INT 15, CRE 12, PER 8, WIS 10
Turn: 2
Previous story: The adventure began in a mysterious forest.
Moral Alignment Context:
Alignment Level: good
Moral Score: 25
Reputation: Respected hero
Recent Moral Choices: Helped villagers, Protected innocent

Image Description: A hidden cave entrance with ancient symbols`;

    await generateStory('A hidden cave entrance with ancient symbols', customPrompt);

    // Check that the custom prompt is included in the user message content
    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.messages[1].content).toContain(customPrompt);
    expect(callBody.messages[1].content).toContain('Moral Alignment Context:');
    expect(callBody.messages[1].content).toContain('Alignment Level: good');
    expect(callBody.messages[1].content).toContain('Image Description: A hidden cave entrance with ancient symbols');
  });

  it('should use default prompt with description when no custom prompt provided', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            sceneTitle: 'Test Scene',
            summary: 'A test story summary',
            dilemmas: ['Test dilemma'],
            cues: 'Test cues',
            consequences: ['Test consequence']
          })
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const description = 'A hidden cave entrance with ancient symbols';

    await generateStory(description);

    // Verify the default prompt is used with description appended
    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.messages[1].content).toContain(description);
    expect(callBody.messages[1].content).toContain('Create an engaging interactive story scene');
  });
});

describe('generateBattleCommentary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate attack commentary successfully', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Godzilla unleashes a devastating atomic breath attack at Bruce Lee!' } }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await generateBattleCommentary('Godzilla', 'Bruce Lee', 1, true, 10);

    expect(result.startsWith('Godzilla unleashes a devastating atomic breath attack at Bruce Lee')).toBe(true);
    expect(['.', '!']).toContain(result.trim().slice(-1));
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:1234/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('attack')
      })
    );
  });

  it('should generate defense commentary successfully', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Bruce Lee dodges with lightning-fast reflexes!' } }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await generateBattleCommentary('Godzilla', 'Bruce Lee', 1, false, 5);

    expect(result.startsWith('Bruce Lee dodges with lightning-fast reflexes')).toBe(true);
    expect(['.', '!']).toContain(result.trim().slice(-1));
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:1234/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('defense')
      })
    );
  });

  it('should fallback to template commentary on API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await generateBattleCommentary('Godzilla', 'Bruce Lee', 1, true, 10);

    expect(result).toContain('Godzilla');
    expect(result).toContain('Bruce Lee');
  });

  it('should fallback to template commentary on empty response', async () => {
    const mockResponse = { choices: [{ message: { content: '' } }] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await generateBattleCommentary('Godzilla', 'Bruce Lee', 1, true, 10);

    expect(result).toContain('Godzilla');
    expect(result).toContain('Bruce Lee');
  });

  it('should include damage in the prompt when provided', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Godzilla strikes with incredible force!' } }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await generateBattleCommentary('Godzilla', 'Bruce Lee', 1, true, 15);

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.messages[1].content).toContain('(15 damage)');
  });
}); 