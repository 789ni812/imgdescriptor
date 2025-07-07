import { generateStory } from './lmstudio-client';

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