import { NextResponse } from 'next/server';
import { generateStory } from '@/lib/lmstudio-client';
import type { GameTemplate } from '@/lib/types/template';

interface GenerateStoryRequest {
  description: string;
  prompt?: string;
  debugConfig?: {
    storyLength?: 'short' | 'medium' | 'long' | 'epic';
    choiceCount?: 2 | 3 | 4 | 5;
    enableVerboseLogging?: boolean;
    aiResponseTuning?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    };
  };
}

export async function POST(request: Request) {
  try {
    const { description, prompt, debugConfig: partialDebugConfig } = (await request.json()) as GenerateStoryRequest;

    // Allow either description (normal) or prompt (final story)
    if (!description && !prompt) {
      return NextResponse.json(
        { success: false, error: 'Description or prompt is required.' },
        { status: 400 }
      );
    }

    // Fill in missing debugConfig fields with defaults
    const defaultDebugConfig: GameTemplate['debugConfig'] = {
      storyLength: 'medium',
      storyLengthCustom: undefined,
      choiceCount: 3,
      enableVerboseLogging: false,
      summaryEnabled: false,
      performanceMetrics: {
        enabled: false,
        trackStoryGeneration: true,
        trackChoiceGeneration: true,
        trackImageAnalysis: true,
        trackDMReflection: true,
      },
      aiResponseTuning: {
        temperature: 0.85,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      userExperience: {
        storyPacing: 'medium',
        choiceComplexity: 'moderate',
        narrativeDepth: 'medium',
        characterDevelopment: 'medium',
        moralComplexity: 'medium',
      },
      testing: {
        enableMockMode: false,
        mockResponseDelay: 300,
        enableStressTesting: false,
        maxConcurrentRequests: 5,
      },
    };
    const safePartialDebugConfig = partialDebugConfig || {};
    const {
      temperature = defaultDebugConfig.aiResponseTuning.temperature,
      maxTokens = defaultDebugConfig.aiResponseTuning.maxTokens,
      topP = defaultDebugConfig.aiResponseTuning.topP,
      frequencyPenalty = defaultDebugConfig.aiResponseTuning.frequencyPenalty,
      presencePenalty = defaultDebugConfig.aiResponseTuning.presencePenalty,
    } = (safePartialDebugConfig.aiResponseTuning || {});
    const pdc = safePartialDebugConfig as Partial<GameTemplate['debugConfig']>;
    const debugConfig: GameTemplate['debugConfig'] = {
      storyLength: pdc.storyLength ?? defaultDebugConfig.storyLength,
      storyLengthCustom: pdc.storyLengthCustom,
      choiceCount: pdc.choiceCount ?? defaultDebugConfig.choiceCount,
      enableVerboseLogging: pdc.enableVerboseLogging ?? defaultDebugConfig.enableVerboseLogging,
      summaryEnabled: pdc.summaryEnabled ?? defaultDebugConfig.summaryEnabled,
      performanceMetrics: {
        enabled: pdc.performanceMetrics?.enabled ?? defaultDebugConfig.performanceMetrics.enabled,
        trackStoryGeneration: pdc.performanceMetrics?.trackStoryGeneration ?? defaultDebugConfig.performanceMetrics.trackStoryGeneration,
        trackChoiceGeneration: pdc.performanceMetrics?.trackChoiceGeneration ?? defaultDebugConfig.performanceMetrics.trackChoiceGeneration,
        trackImageAnalysis: pdc.performanceMetrics?.trackImageAnalysis ?? defaultDebugConfig.performanceMetrics.trackImageAnalysis,
        trackDMReflection: pdc.performanceMetrics?.trackDMReflection ?? defaultDebugConfig.performanceMetrics.trackDMReflection,
      },
      aiResponseTuning: {
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
      },
      userExperience: {
        storyPacing: pdc.userExperience?.storyPacing ?? defaultDebugConfig.userExperience.storyPacing,
        choiceComplexity: pdc.userExperience?.choiceComplexity ?? defaultDebugConfig.userExperience.choiceComplexity,
        narrativeDepth: pdc.userExperience?.narrativeDepth ?? defaultDebugConfig.userExperience.narrativeDepth,
        characterDevelopment: pdc.userExperience?.characterDevelopment ?? defaultDebugConfig.userExperience.characterDevelopment,
        moralComplexity: pdc.userExperience?.moralComplexity ?? defaultDebugConfig.userExperience.moralComplexity,
      },
      testing: {
        enableMockMode: pdc.testing?.enableMockMode ?? defaultDebugConfig.testing.enableMockMode,
        mockResponseDelay: pdc.testing?.mockResponseDelay ?? defaultDebugConfig.testing.mockResponseDelay,
        enableStressTesting: pdc.testing?.enableStressTesting ?? defaultDebugConfig.testing.enableStressTesting,
        maxConcurrentRequests: pdc.testing?.maxConcurrentRequests ?? defaultDebugConfig.testing.maxConcurrentRequests,
      },
    };

    const storyResult = await generateStory(description || '', prompt, debugConfig);

    if (!storyResult.success) {
      return NextResponse.json(
        { success: false, error: storyResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: storyResult.story,
    });

  } catch (error) {
    console.error('API /generate-story Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 