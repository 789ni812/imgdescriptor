import { PartialTemplate, TemplateCompleteness } from '../types/partialTemplate';

// Template Analysis Result
export interface TemplateAnalysisResult {
  completeness: TemplateCompleteness;
  progress: number;
  completedTurns: number;
  totalTurns: number;
  missingData: string[];
  canResume: boolean;
  resumePoint: string;
  hasFinalStory: boolean;
  estimatedCompletionTime: number; // minutes
  confidence: 'low' | 'medium' | 'high';
}

// Resume Point Information
export interface ResumePointInfo {
  turnNumber: number;
  phase: 'not-started' | 'image-uploaded' | 'story-complete' | 'choice-complete' | 'final';
  nextAction: string;
  missingData: string[];
  estimatedTime: number; // minutes
}

// Resume Capability Validation
export interface ResumeCapabilityValidation {
  canResume: boolean;
  confidence: 'none' | 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
  risks: string[];
  recommendations: string[];
}

// Template Progress Information
export interface TemplateProgress {
  percentage: number;
  completedTurns: number;
  totalTurns: number;
  remainingTurns: number;
  phase: 'not-started' | 'early' | 'middle' | 'late' | 'final';
  milestones: string[];
  estimatedTimeRemaining: number; // minutes
}

// Missing Data Analysis
export interface MissingDataAnalysis {
  critical: string[];
  warnings: string[];
  suggestions: string[];
  isComplete: boolean;
  repairSuggestions: string[];
}

// Template Report
export interface TemplateReport {
  summary: string;
  progress: number;
  estimatedCompletionTime: string;
  recommendations: string[];
  risks: string[];
  missingData: string[];
  resumeCapability: ResumeCapabilityValidation;
  lastUpdated: string;
}

// Template Repair Result
export interface TemplateRepairResult {
  success: boolean;
  repairedTemplate: PartialTemplate;
  fixesApplied: string[];
  errors: string[];
  warnings: string[];
}

// Template Comparison Result
export interface TemplateComparisonResult {
  similarity: number; // percentage
  differences: string[];
  commonElements: string[];
  recommendations: string[];
}

// Completion Time Estimate
export interface CompletionTimeEstimate {
  minutes: number;
  status: 'not-started' | 'in-progress' | 'complete';
  nextSteps: string[];
  remainingTurns: number;
  confidence: 'low' | 'medium' | 'high';
}

// Template Analysis Functions

export function analyzeTemplateCompleteness(template: PartialTemplate): TemplateAnalysisResult {
  // Defensive defaults
  const images = template.images || [];
  const storyHistory = template.storyHistory || [];
  const choiceHistory = template.choiceHistory || [];
  const finalStory = template.finalStory;
  const maxTurns = template.config?.maxTurns || 3;

  // Calculate progress - a turn is completed when it has image, story, and choice
  const completedTurns = Math.min(images.length, storyHistory.length, choiceHistory.length);

  // Determine completeness
  let completeness = TemplateCompleteness.EMPTY;
  if (finalStory) {
    completeness = TemplateCompleteness.FINISHED;
  } else if (completedTurns === maxTurns && maxTurns > 0) {
    completeness = TemplateCompleteness.COMPLETE;
  } else if (images.length > 0 || storyHistory.length > 0 || choiceHistory.length > 0) {
    completeness = TemplateCompleteness.PARTIAL;
  }

  // Identify missing data
  const missingData: string[] = [];
  if (images.length === 0) {
    missingData.push('No images uploaded');
  }
  if (storyHistory.length === 0) {
    missingData.push('No stories generated');
  }
  if (choiceHistory.length === 0) {
    missingData.push('No choices made');
  }

  // Check for specific missing data per turn
  for (let turn = 1; turn <= maxTurns; turn++) {
    const hasImage = images.some(img => img.turn === turn);
    const hasStory = storyHistory.some(story => story.turnNumber === turn);
    const hasChoice = choiceHistory.some(choice => choice.turnNumber === turn);

    if (hasImage && !hasStory) {
      missingData.push(`Story not generated for Turn ${turn}`);
    }
    if (hasStory && !hasChoice) {
      missingData.push(`Choice not made for Turn ${turn}`);
    }
  }

  // Determine resume point
  let resumePoint = 'No game progress to resume';
  let canResume = false;

  if (finalStory) {
    canResume = false;
    resumePoint = 'Game finished';
  } else if (completedTurns > 0) {
    canResume = true;
    if (completedTurns === maxTurns) {
      resumePoint = `Turn ${maxTurns} - Complete, ready for final story`;
    } else {
      const lastTurn = completedTurns;
      const hasStory = storyHistory.some(story => story.turnNumber === lastTurn);
      const hasChoice = choiceHistory.some(choice => choice.turnNumber === lastTurn);

      if (hasStory && !hasChoice) {
        resumePoint = `Turn ${lastTurn} - Story generated, waiting for choices`;
      } else if (hasChoice) {
        resumePoint = `Turn ${lastTurn} - Complete, ready for Turn ${lastTurn + 1}`;
      }
    }
  } else if (images.length > 0) {
    canResume = true;
    const lastImageTurn = Math.max(...images.map(img => img.turn));
    resumePoint = `Turn ${lastImageTurn} - Image uploaded, waiting for story generation`;
  }

  // Estimate completion time
  const estimatedCompletionTime = estimateCompletionTimeFromAnalysis(completedTurns, maxTurns, missingData);

  // Determine confidence
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (completeness === TemplateCompleteness.COMPLETE || completeness === TemplateCompleteness.FINISHED) {
    confidence = 'high';
  } else if (completeness === TemplateCompleteness.PARTIAL) {
    confidence = 'medium';
  }

  return {
    completeness,
    progress: Math.round((completedTurns / maxTurns) * 100),
    completedTurns,
    totalTurns: maxTurns,
    missingData,
    canResume,
    resumePoint,
    hasFinalStory: !!finalStory,
    estimatedCompletionTime,
    confidence
  };
}

export function getResumePoint(template: PartialTemplate): ResumePointInfo {
  const { images, storyHistory, choiceHistory } = template;
  const maxTurns = template.config.maxTurns;

  let turnNumber = 1;
  let phase: ResumePointInfo['phase'] = 'not-started';
  let nextAction = 'Start a new game';
  const missingData: string[] = [];
  let estimatedTime = 0;

  if (images.length === 0) {
    missingData.push('No images uploaded');
    nextAction = 'Upload an image to begin';
  } else {
    const lastImageTurn = Math.max(...images.map(img => img.turn));
    turnNumber = lastImageTurn;
    
    const storiesForLastImage = storyHistory.filter(story => story.turnNumber === lastImageTurn);
    if (storiesForLastImage.length === 0) {
      phase = 'image-uploaded';
      missingData.push(`Story not generated for Turn ${lastImageTurn}`);
      nextAction = 'Generate story for uploaded image';
      estimatedTime = 2; // minutes
    } else {
      const choicesForLastImage = choiceHistory.filter(choice => choice.turnNumber === lastImageTurn);
      if (choicesForLastImage.length === 0) {
        phase = 'story-complete';
        missingData.push(`Choice not made for Turn ${lastImageTurn}`);
        nextAction = 'Make a choice to continue';
        estimatedTime = 1; // minutes
      } else {
        if (lastImageTurn < maxTurns) {
          phase = 'choice-complete';
          nextAction = 'Upload image for next turn';
          estimatedTime = 3; // minutes
        } else {
          phase = 'final';
          nextAction = 'Generate final story';
          estimatedTime = 5; // minutes
        }
      }
    }
  }

  return {
    turnNumber,
    phase,
    nextAction,
    missingData,
    estimatedTime
  };
}

export function validateResumeCapability(template: PartialTemplate): ResumeCapabilityValidation {
  const analysis = analyzeTemplateCompleteness(template);
  const resumePoint = getResumePoint(template);

  const risks: string[] = [];
  const recommendations: string[] = [];

  if (!analysis.canResume) {
    return {
      canResume: false,
      confidence: 'none',
      estimatedTime: 0,
      risks: ['No game progress to resume'],
      recommendations: ['Start a new game']
    };
  }

  // Assess risks based on missing data
  if (analysis.missingData.includes('No DM configuration')) {
    risks.push('May need to reconfigure DM settings');
    recommendations.push('Review DM configuration before continuing');
  }

  if (analysis.missingData.some(msg => msg.includes('Story not generated'))) {
    risks.push('Story generation may take longer than expected');
    recommendations.push('Ensure stable internet connection for AI generation');
  }

  if (analysis.missingData.some(msg => msg.includes('Choice not made'))) {
    risks.push('May need to regenerate choices');
    recommendations.push('Review story context before making choices');
  }

  // Determine confidence level
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (analysis.completeness === TemplateCompleteness.COMPLETE) {
    confidence = 'high';
    recommendations.push('Ready for final story generation');
  } else if (analysis.completedTurns > 0) {
    confidence = 'medium';
    recommendations.push('Review current progress before continuing');
  }

  return {
    canResume: true,
    confidence,
    estimatedTime: resumePoint.estimatedTime,
    risks,
    recommendations
  };
}

export function calculateTemplateProgress(template: PartialTemplate): TemplateProgress {
  const images = template.images || [];
  const storyHistory = template.storyHistory || [];
  const choiceHistory = template.choiceHistory || [];
  const maxTurns = template.config?.maxTurns || 3;

  const completedTurns = Math.min(images.length, storyHistory.length, choiceHistory.length);
  const remainingTurns = maxTurns - completedTurns;

  // Determine phase
  let phase: TemplateProgress['phase'] = 'not-started';
  if (completedTurns === maxTurns) {
    phase = 'final';
  } else if (completedTurns >= Math.ceil(maxTurns * 0.7)) {
    phase = 'late';
  } else if (completedTurns >= Math.ceil(maxTurns * 0.3)) {
    phase = 'middle';
  } else if (completedTurns > 0) {
    phase = 'early';
  }

  // Generate milestones
  const milestones: string[] = [];
  if (completedTurns === 0) {
    milestones.push('Ready to begin');
  } else {
    milestones.push(`${completedTurns} turn${completedTurns > 1 ? 's' : ''} completed`);
  }

  if (images.length > 0) {
    milestones.push('Images uploaded');
  }
  if (storyHistory.length > 0) {
    milestones.push('Stories generated');
  }
  if (choiceHistory.length > 0) {
    milestones.push('Choices made');
  }
  if (completedTurns === maxTurns) {
    milestones.push('All turns completed');
  }

  const estimatedTimeRemaining = estimateCompletionTimeFromAnalysis(completedTurns, maxTurns, []);

  return {
    percentage: Math.round((completedTurns / maxTurns) * 100),
    completedTurns,
    totalTurns: maxTurns,
    remainingTurns,
    phase,
    milestones,
    estimatedTimeRemaining
  };
}

export function identifyMissingData(template: PartialTemplate): MissingDataAnalysis {
  const { images, storyHistory, choiceHistory, dmConfig, gameStateAnalysis } = template;
  const maxTurns = template.config.maxTurns;

  const critical: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const repairSuggestions: string[] = [];

  // Check for critical missing data
  if (images.length === 0) {
    critical.push('No images uploaded');
    repairSuggestions.push('Upload at least one image to begin');
  }

  if (storyHistory.length === 0) {
    critical.push('No stories generated');
    repairSuggestions.push('Generate story for uploaded images');
  }

  if (choiceHistory.length === 0) {
    critical.push('No choices made');
    repairSuggestions.push('Make choices for generated stories');
  }

  // Check for turn-specific missing data
  for (let turn = 1; turn <= maxTurns; turn++) {
    const hasImage = images.some(img => img.turn === turn);
    const hasStory = storyHistory.some(story => story.turnNumber === turn);
    const hasChoice = choiceHistory.some(choice => choice.turnNumber === turn);

    if (hasImage && !hasStory) {
      critical.push(`Story not generated for Turn ${turn}`);
      repairSuggestions.push(`Generate story for Turn ${turn} image`);
    }
    if (hasStory && !hasChoice) {
      critical.push(`Choice not made for Turn ${turn}`);
      repairSuggestions.push(`Make choice for Turn ${turn} story`);
    }
  }

  // Check for warnings
  if (!dmConfig) {
    warnings.push('No DM configuration');
    suggestions.push('Consider adding DM personality and style');
  }

  if (!gameStateAnalysis) {
    warnings.push('No game state analysis');
    suggestions.push('Game state analysis will be generated automatically');
  }

  // Check for suggestions
  if (images.length > 0 && storyHistory.length === 0) {
    suggestions.push('Ready to generate stories');
  }
  if (storyHistory.length > 0 && choiceHistory.length === 0) {
    suggestions.push('Ready to make choices');
  }
  if (choiceHistory.length > 0 && choiceHistory.length < storyHistory.length) {
    suggestions.push('Continue making choices for remaining stories');
  }

  return {
    critical,
    warnings,
    suggestions,
    isComplete: critical.length === 0,
    repairSuggestions
  };
}

export function generateTemplateReport(template: PartialTemplate): TemplateReport {
  const analysis = analyzeTemplateCompleteness(template);
  const missingData = identifyMissingData(template);
  const resumeCapability = validateResumeCapability(template);

  // Generate summary
  let summary = '';
  switch (analysis.completeness) {
    case TemplateCompleteness.EMPTY:
      summary = 'Empty template - no game progress';
      break;
    case TemplateCompleteness.PARTIAL:
      summary = `Partial template - ${analysis.completedTurns}/${analysis.totalTurns} turns completed`;
      break;
    case TemplateCompleteness.COMPLETE:
      summary = 'Complete template - ready for final story';
      break;
    case TemplateCompleteness.FINISHED:
      summary = 'Finished template - adventure complete';
      break;
  }

  // Format completion time
  const estimatedCompletionTime = analysis.estimatedCompletionTime === 0 
    ? '0 minutes' 
    : `${analysis.estimatedCompletionTime} minutes`;

  // Generate recommendations
  const recommendations: string[] = [];
  if (analysis.canResume) {
    recommendations.push(analysis.resumePoint);
  }
  if (missingData.suggestions.length > 0) {
    recommendations.push(...missingData.suggestions.slice(0, 3));
  }
  if (resumeCapability.recommendations.length > 0) {
    recommendations.push(...resumeCapability.recommendations.slice(0, 2));
  }

  return {
    summary,
    progress: analysis.progress,
    estimatedCompletionTime,
    recommendations,
    risks: resumeCapability.risks,
    missingData: missingData.critical,
    resumeCapability,
    lastUpdated: template.updatedAt
  };
}

export function repairTemplate(template: PartialTemplate): TemplateRepairResult {
  const fixesApplied: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const repairedTemplate = { ...template };

  // Check for missing required fields
  const requiredFields = ['id', 'name', 'version', 'createdAt', 'updatedAt', 'type', 'character', 'config'];
  for (const field of requiredFields) {
    if (!(field in repairedTemplate)) {
      switch (field) {
        case 'version':
          repairedTemplate.version = '1.0.0';
          break;
        case 'createdAt':
          repairedTemplate.createdAt = new Date().toISOString();
          break;
        case 'updatedAt':
          repairedTemplate.updatedAt = new Date().toISOString();
          break;
        case 'type':
          repairedTemplate.type = 'game';
          break;
        case 'character':
          repairedTemplate.character = {
            persona: 'Default Hero',
            traits: [],
            stats: {
              intelligence: 10,
              creativity: 10,
              perception: 10,
              wisdom: 10
            },
            health: 100,
            heartrate: 70,
            age: 18,
            level: 1,
            experience: 0,
            currentTurn: 1,
            imageHistory: [],
            storyHistory: [],
            choiceHistory: [],
            currentChoices: [],
            inventory: [],
            choicesHistory: [],
            moralAlignment: {
              score: 0,
              level: 'neutral',
              reputation: 'An unknown adventurer',
              recentChoices: [],
              alignmentHistory: []
            }
          };
          break;
        case 'config':
          repairedTemplate.config = { maxTurns: 3 };
          break;
        default:
          errors.push(`Cannot repair missing required field: ${field}`);
      }
      if (!errors.includes(`Cannot repair missing required field: ${field}`)) {
        fixesApplied.push(`Added missing ${field}`);
      }
    }
  }

  // Repair character stats if invalid
  if (repairedTemplate.character && repairedTemplate.character.stats) {
    const stats = repairedTemplate.character.stats;
    let statsFixed = false;

    Object.keys(stats).forEach(statKey => {
      const stat = stats[statKey as keyof typeof stats];
      if (typeof stat !== 'number' || stat < 0 || stat > 20) {
        stats[statKey as keyof typeof stats] = Math.max(0, Math.min(20, stat || 10));
        statsFixed = true;
      }
    });

    if (statsFixed) {
      fixesApplied.push('Fixed invalid character stats');
    }
  }

  // Repair turn numbers if invalid
  if (repairedTemplate.character && repairedTemplate.character.currentTurn) {
    const maxTurns = repairedTemplate.config.maxTurns;
    if (repairedTemplate.character.currentTurn < 1 || repairedTemplate.character.currentTurn > maxTurns) {
      repairedTemplate.character.currentTurn = Math.max(1, Math.min(maxTurns, repairedTemplate.character.currentTurn));
      fixesApplied.push('Fixed invalid current turn');
    }
  }

  // Update completeness
  const analysis = analyzeTemplateCompleteness(repairedTemplate);
  repairedTemplate.completeness = analysis.completeness;

  const success = errors.length === 0;

  return {
    success,
    repairedTemplate,
    fixesApplied,
    errors,
    warnings
  };
}

export function compareTemplates(template1: PartialTemplate, template2: PartialTemplate): TemplateComparisonResult {
  const differences: string[] = [];
  const commonElements: string[] = [];
  const recommendations: string[] = [];

  // Compare basic properties
  if (template1.name !== template2.name) {
    differences.push('Template names differ');
  } else {
    commonElements.push('Template names match');
  }

  if (template1.config.maxTurns !== template2.config.maxTurns) {
    differences.push('Turn limits differ');
  } else {
    commonElements.push('Turn limits match');
  }

  // Compare character data
  if (template1.character.persona !== template2.character.persona) {
    differences.push('Character personas differ');
  } else {
    commonElements.push('Character personas match');
  }

  // Compare progress
  const progress1 = calculateTemplateProgress(template1);
  const progress2 = calculateTemplateProgress(template2);

  if (progress1.percentage !== progress2.percentage) {
    differences.push(`Progress differs: ${progress1.percentage}% vs ${progress2.percentage}%`);
  } else {
    commonElements.push('Progress matches');
  }

  if (progress1.completedTurns !== progress2.completedTurns) {
    differences.push(`Completed turns differ: ${progress1.completedTurns} vs ${progress2.completedTurns}`);
  }

  // Compare data counts
  if (template1.images.length !== template2.images.length) {
    differences.push(`Image counts differ: ${template1.images.length} vs ${template2.images.length}`);
  }

  if (template1.storyHistory.length !== template2.storyHistory.length) {
    differences.push(`Story counts differ: ${template1.storyHistory.length} vs ${template2.storyHistory.length}`);
  }

  if (template1.choiceHistory.length !== template2.choiceHistory.length) {
    differences.push(`Choice counts differ: ${template1.choiceHistory.length} vs ${template2.choiceHistory.length}`);
  }

  // Calculate similarity
  const totalComparisons = 8; // Basic properties + progress + data counts
  const matchingComparisons = commonElements.length;
  const similarity = Math.round((matchingComparisons / totalComparisons) * 100);

  // Generate recommendations
  if (similarity === 100) {
    recommendations.push('Templates are identical');
  } else if (similarity > 80) {
    recommendations.push('Templates are very similar');
  } else if (similarity > 50) {
    recommendations.push('Templates have some similarities');
  } else {
    recommendations.push('Templates are significantly different');
  }

  if (progress1.percentage > progress2.percentage) {
    recommendations.push('First template has more progress');
  } else if (progress2.percentage > progress1.percentage) {
    recommendations.push('Second template has more progress');
  }

  return {
    similarity,
    differences,
    commonElements,
    recommendations
  };
}

export function estimateCompletionTime(
  template: PartialTemplate, 
  userExperience: 'beginner' | 'intermediate' | 'experienced' = 'intermediate'
): CompletionTimeEstimate {
  const analysis = analyzeTemplateCompleteness(template);
  const progress = calculateTemplateProgress(template);

  if (analysis.completeness === TemplateCompleteness.FINISHED) {
    return {
      minutes: 0,
      status: 'complete',
      nextSteps: ['Template is complete'],
      remainingTurns: 0,
      confidence: 'high'
    };
  }

  // Base time estimates per action (in minutes)
  const baseTimes = {
    imageUpload: { beginner: 3, intermediate: 2, experienced: 1 },
    storyGeneration: { beginner: 5, intermediate: 3, experienced: 2 },
    choiceMaking: { beginner: 2, intermediate: 1, experienced: 1 },
    finalStory: { beginner: 8, intermediate: 5, experienced: 3 }
  };

  const experienceMultiplier = {
    beginner: 1.5,
    intermediate: 1.0,
    experienced: 0.7
  };

  let totalMinutes = 0;
  const nextSteps: string[] = [];
  const remainingTurns = progress.remainingTurns;

  // Calculate time for remaining actions
  for (let turn = progress.completedTurns + 1; turn <= progress.totalTurns; turn++) {
    const hasImage = template.images.some(img => img.turn === turn);
    const hasStory = template.storyHistory.some(story => story.turnNumber === turn);
    const hasChoice = template.choiceHistory.some(choice => choice.turnNumber === turn);

    if (!hasImage) {
      totalMinutes += baseTimes.imageUpload[userExperience] * experienceMultiplier[userExperience];
      nextSteps.push(`Upload image for Turn ${turn}`);
    }
    if (!hasStory) {
      totalMinutes += baseTimes.storyGeneration[userExperience] * experienceMultiplier[userExperience];
      nextSteps.push(`Generate story for Turn ${turn}`);
    }
    if (!hasChoice) {
      totalMinutes += baseTimes.choiceMaking[userExperience] * experienceMultiplier[userExperience];
      nextSteps.push(`Make choice for Turn ${turn}`);
    }
  }

  // Add final story time if all turns are complete
  if (progress.completedTurns === progress.totalTurns) {
    totalMinutes += baseTimes.finalStory[userExperience] * experienceMultiplier[userExperience];
    nextSteps.push('Generate final story');
  }

  // Determine status
  let status: CompletionTimeEstimate['status'] = 'not-started';
  if (progress.completedTurns > 0) {
    status = 'in-progress';
  }

  // Determine confidence
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (progress.completedTurns === 0) {
    confidence = 'low';
  } else if (progress.completedTurns === progress.totalTurns) {
    confidence = 'high';
  }

  return {
    minutes: Math.round(totalMinutes),
    status,
    nextSteps: nextSteps.length > 0 ? nextSteps : ['Continue your adventure'],
    remainingTurns,
    confidence
  };
}

// Helper Functions

function estimateCompletionTimeFromAnalysis(completedTurns: number, totalTurns: number, missingData: string[]): number {
  const remainingTurns = totalTurns - completedTurns;
  
  // Base estimates: 2 min per image upload, 3 min per story, 1 min per choice
  const timePerTurn = 6; // 2 + 3 + 1 minutes
  const finalStoryTime = 5; // minutes
  
  let estimatedTime = remainingTurns * timePerTurn;
  
  if (completedTurns === totalTurns) {
    estimatedTime = finalStoryTime;
  }
  
  // Adjust based on missing data
  if (missingData.some(msg => msg.includes('Story not generated'))) {
    estimatedTime += 3; // Additional time for story generation
  }
  
  if (missingData.some(msg => msg.includes('Choice not made'))) {
    estimatedTime += 1; // Additional time for choice making
  }
  
  return Math.max(0, estimatedTime);
}

 