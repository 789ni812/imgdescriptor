import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  analyzeTemplateCompleteness,
  getResumePoint,
  validateResumeCapability,
  calculateTemplateProgress,
  identifyMissingData,
  generateTemplateReport,
  repairTemplate,
  compareTemplates,
  estimateCompletionTime
} from './templateAnalysis';
import { createCharacter, Character } from '../types/character';
import { PartialTemplate, TemplateCompleteness } from '../types/partialTemplate';

describe('Template Completeness Analysis System', () => {
  let mockCharacter: Character;
  let completeTemplate: PartialTemplate;
  let partialTemplate: PartialTemplate;
  let emptyTemplate: PartialTemplate;

  beforeEach(() => {
    mockCharacter = createCharacter('Test Hero', {
      intelligence: 12,
      creativity: 14,
      perception: 10,
      wisdom: 16
    });

    // Complete template with all data
    completeTemplate = {
      id: 'complete-template',
      name: 'Complete Template',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'game',
      character: mockCharacter,
      images: [
        {
          id: 'img-1',
          url: '/image1.jpg',
          description: 'First image',
          turn: 1,
          uploadedAt: new Date().toISOString(),
          story: 'Story for first image',
          analysisStatus: 'complete'
        },
        {
          id: 'img-2',
          url: '/image2.jpg',
          description: 'Second image',
          turn: 2,
          uploadedAt: new Date().toISOString(),
          story: 'Story for second image',
          analysisStatus: 'complete'
        },
        {
          id: 'img-3',
          url: '/image3.jpg',
          description: 'Third image',
          turn: 3,
          uploadedAt: new Date().toISOString(),
          story: 'Story for third image',
          analysisStatus: 'complete'
        }
      ],
      storyHistory: [
        {
          id: 'story-1',
          text: 'First story',
          timestamp: new Date().toISOString(),
          turnNumber: 1,
          imageDescription: 'First image'
        },
        {
          id: 'story-2',
          text: 'Second story',
          timestamp: new Date().toISOString(),
          turnNumber: 2,
          imageDescription: 'Second image'
        },
        {
          id: 'story-3',
          text: 'Third story',
          timestamp: new Date().toISOString(),
          turnNumber: 3,
          imageDescription: 'Third image'
        }
      ],
      choiceHistory: [
        {
          id: 'choice-1',
          choiceId: 'choice-1',
          text: 'First choice',
          outcome: 'Success!',
          statChanges: { intelligence: 1 },
          timestamp: new Date().toISOString(),
          turnNumber: 1,
          status: 'generated'
        },
        {
          id: 'choice-2',
          choiceId: 'choice-2',
          text: 'Second choice',
          outcome: 'Success!',
          statChanges: { creativity: 1 },
          timestamp: new Date().toISOString(),
          turnNumber: 2,
          status: 'generated'
        },
        {
          id: 'choice-3',
          choiceId: 'choice-3',
          text: 'Third choice',
          outcome: 'Success!',
          statChanges: { perception: 1 },
          timestamp: new Date().toISOString(),
          turnNumber: 3,
          status: 'generated'
        }
      ],
      choicesHistory: [
        {
          turn: 1,
          choices: [
            {
              id: 'choice-1',
              text: 'First choice',
              description: 'Description',
              statRequirements: { intelligence: 10 },
              consequences: ['Success'],
              status: 'generated'
            }
          ]
        },
        {
          turn: 2,
          choices: [
            {
              id: 'choice-2',
              text: 'Second choice',
              description: 'Description',
              statRequirements: { creativity: 10 },
              consequences: ['Success'],
              status: 'generated'
            }
          ]
        },
        {
          turn: 3,
          choices: [
            {
              id: 'choice-3',
              text: 'Third choice',
              description: 'Description',
              statRequirements: { perception: 10 },
              consequences: ['Success'],
              status: 'generated'
            }
          ]
        },
        {
          turn: 4,
          choices: [
            {
              id: 'choice-4',
              text: 'Fourth choice',
              description: 'Description',
              statRequirements: { wisdom: 10 },
              consequences: ['Success'],
              status: 'generated'
            }
          ]
        }
      ],
      prompts: {},
      config: { maxTurns: 3 },
      dmConfig: {
        personality: 'strategic',
        style: 'challenging',
        difficulty: 'medium'
      },
      completeness: TemplateCompleteness.COMPLETE
    };

    // Partial template with incomplete data
    partialTemplate = {
      id: 'partial-template',
      name: 'Partial Template',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'game',
      character: mockCharacter,
      images: [
        {
          id: 'img-1',
          url: '/image1.jpg',
          description: 'First image',
          turn: 1,
          uploadedAt: new Date().toISOString(),
          story: 'Story for first image',
          analysisStatus: 'complete'
        }
      ],
      storyHistory: [
        {
          id: 'story-1',
          text: 'First story',
          timestamp: new Date().toISOString(),
          turnNumber: 1,
          imageDescription: 'First image'
        }
      ],
      choiceHistory: [],
      choicesHistory: [],
      prompts: {},
      config: { maxTurns: 3 },
      dmConfig: null,
      completeness: TemplateCompleteness.PARTIAL
    };

    // Empty template
    emptyTemplate = {
      id: 'empty-template',
      name: 'Empty Template',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'game',
      character: mockCharacter,
      images: [],
      storyHistory: [],
      choiceHistory: [],
      choicesHistory: [],
      prompts: {},
      config: { maxTurns: 3 },
      dmConfig: null,
      completeness: TemplateCompleteness.EMPTY
    };
  });

  describe('analyzeTemplateCompleteness', () => {
    it('should analyze complete template correctly', () => {
      const analysis = analyzeTemplateCompleteness(completeTemplate);

      expect(analysis.completeness).toBe(TemplateCompleteness.COMPLETE);
      expect(analysis.progress).toBe(100);
      expect(analysis.completedTurns).toBe(3);
      expect(analysis.totalTurns).toBe(3);
      expect(analysis.missingData).toHaveLength(0);
      expect(analysis.canResume).toBe(true);
      expect(analysis.resumePoint).toBe('Turn 3 - Complete, ready for final story');
    });

    it('should analyze partial template correctly', () => {
      const analysis = analyzeTemplateCompleteness(partialTemplate);

      expect(analysis.completeness).toBe(TemplateCompleteness.PARTIAL);
      expect([0,1]).toContain(analysis.progress);
      expect(analysis.completedTurns).toEqual(expect.any(Number));
      expect(analysis.totalTurns).toBe(3);
      expect(analysis.missingData).toContain('Choice not made for Turn 1');
      expect(analysis.canResume).toBe(true);
      expect(analysis.resumePoint).toBe('Turn 1 - Story generated, waiting for choices');
    });

    it('should analyze empty template correctly', () => {
      const analysis = analyzeTemplateCompleteness(emptyTemplate);

      expect(analysis.completeness).toBe(TemplateCompleteness.EMPTY);
      expect(analysis.progress).toBe(0);
      expect(analysis.completedTurns).toBe(0);
      expect(analysis.totalTurns).toBe(3);
      expect(analysis.missingData).toContain('No images uploaded');
      expect(analysis.canResume).toBe(false);
      expect(analysis.resumePoint).toBe('No game progress to resume');
    });

    it('should detect template with final story as finished', () => {
      const finishedTemplate = {
        ...completeTemplate,
        finalStory: 'The epic conclusion to our adventure...',
        completeness: TemplateCompleteness.FINISHED
      };

      const analysis = analyzeTemplateCompleteness(finishedTemplate);

      expect(analysis.completeness).toBe(TemplateCompleteness.FINISHED);
      expect(analysis.progress).toBe(100);
      expect(analysis.hasFinalStory).toBe(true);
    });
  });

  describe('getResumePoint', () => {
    it('should identify resume point for complete template', () => {
      const resumePoint = getResumePoint(completeTemplate);

      expect(resumePoint.turnNumber).toBe(3);
      expect(resumePoint.phase).toBe('final');
      expect(resumePoint.nextAction).toBe('Generate final story');
      expect(resumePoint.missingData).toHaveLength(0);
    });

    it('should identify resume point for partial template', () => {
      const resumePoint = getResumePoint(partialTemplate);

      expect(resumePoint.turnNumber).toBe(1);
      expect(resumePoint.phase).toBe('story-complete');
      expect(resumePoint.nextAction).toBe('Make a choice to continue');
      expect(resumePoint.missingData).toContain('Choice not made for Turn 1');
    });

    it('should identify resume point for empty template', () => {
      const resumePoint = getResumePoint(emptyTemplate);

      expect(resumePoint.turnNumber).toBe(1);
      expect(resumePoint.phase).toBe('not-started');
      expect(resumePoint.nextAction).toBe('Upload an image to begin');
      expect(resumePoint.missingData).toContain('No images uploaded');
    });

    it('should handle template with missing story', () => {
      const templateWithMissingStory = {
        ...partialTemplate,
        storyHistory: []
      };

      const resumePoint = getResumePoint(templateWithMissingStory);

      expect(resumePoint.turnNumber).toBe(1);
      expect(resumePoint.phase).toBe('image-uploaded');
      expect(resumePoint.nextAction).toBe('Generate story for uploaded image');
      expect(resumePoint.missingData).toContain('Story not generated for Turn 1');
    });
  });

  describe('validateResumeCapability', () => {
    it('should validate resume capability for complete template', () => {
      const validation = validateResumeCapability(completeTemplate);

      expect(validation.canResume).toBe(true);
      expect(['low','high']).toContain(validation.confidence);
      expect(validation.estimatedTime).toBeLessThan(5); // minutes
      expect(validation.risks).toHaveLength(0);
      expect(validation.recommendations).toContain('Ready for final story generation');
    });

    it('should validate resume capability for partial template', () => {
      const validation = validateResumeCapability(partialTemplate);

      expect(validation.canResume).toBe(true);
      expect(['low','high']).toContain(validation.confidence);
      expect(validation.estimatedTime).toBeGreaterThan(0);
      expect(validation.risks).toContain('May need to regenerate choices');
      expect(validation.recommendations).toContain('Review story context before continuing');
    });

    it('should validate resume capability for empty template', () => {
      const validation = validateResumeCapability(emptyTemplate);

      expect(validation.canResume).toBe(false);
      expect(validation.confidence).toBe('none');
      expect(validation.estimatedTime).toBe(0);
      expect(validation.risks).toContain('No game progress to resume');
      expect(validation.recommendations).toContain('Start a new game');
    });
  });

  describe('calculateTemplateProgress', () => {
    it('should calculate progress for complete template', () => {
      const progress = calculateTemplateProgress(completeTemplate);

      expect(progress.percentage).toBe(100);
      expect(progress.completedTurns).toBe(3);
      expect(progress.totalTurns).toBe(3);
      expect(progress.remainingTurns).toBe(0);
      expect(progress.phase).toBe('final');
      expect(progress.milestones).toContain('All turns completed');
    });

    it('should calculate progress for partial template', () => {
      const progress = calculateTemplateProgress(partialTemplate);

      expect([0,1]).toContain(progress.percentage);
      expect(progress.completedTurns).toBe(1);
      expect(progress.totalTurns).toBe(3);
      expect(progress.remainingTurns).toBe(2);
      expect(progress.phase).toBe('early');
      expect(progress.milestones).toContain('First turn started');
    });

    it('should calculate progress for empty template', () => {
      const progress = calculateTemplateProgress(emptyTemplate);

      expect(progress.percentage).toBe(0);
      expect(progress.completedTurns).toBe(0);
      expect(progress.totalTurns).toBe(3);
      expect(progress.remainingTurns).toBe(3);
      expect(progress.phase).toBe('not-started');
      expect(progress.milestones).toContain('Ready to begin');
    });
  });

  describe('identifyMissingData', () => {
    it('should identify missing data for complete template', () => {
      const missingData = identifyMissingData(completeTemplate);

      expect(missingData.critical).toHaveLength(0);
      expect(missingData.warnings).toHaveLength(0);
      expect(missingData.suggestions).toHaveLength(0);
      expect(missingData.isComplete).toBe(true);
    });

    it('should identify missing data for partial template', () => {
      const missingData = identifyMissingData(partialTemplate);

      expect(missingData.critical).toContain('Choice not made for Turn 1');
      expect(missingData.warnings).toContain('No DM configuration');
      expect(missingData.suggestions).toContain('Consider adding DM personality');
      expect(missingData.isComplete).toBe(false);
    });

    it('should identify missing data for empty template', () => {
      const missingData = identifyMissingData(emptyTemplate);

      expect(missingData.critical).toContain('No images uploaded');
      expect(missingData.critical).toContain('No stories generated');
      expect(missingData.critical).toContain('No choices made');
      expect(missingData.warnings).toContain('No DM configuration');
      expect(missingData.isComplete).toBe(false);
    });

    it('should identify missing story for specific turn', () => {
      const templateWithMissingStory = {
        ...partialTemplate,
        images: [
          {
            id: 'img-1',
            url: '/image1.jpg',
            description: 'First image',
            turn: 1,
            uploadedAt: new Date().toISOString()
            // Missing story
          }
        ],
        storyHistory: []
      };

      const missingData = identifyMissingData(templateWithMissingStory);

      expect(missingData.critical).toContain('Story not generated for Turn 1');
      expect(missingData.critical).toContain('Choice not made for Turn 1');
    });
  });

  describe('generateTemplateReport', () => {
    it('should generate comprehensive report for complete template', () => {
      const report = generateTemplateReport(completeTemplate);

      expect(report.summary).toContain('Complete');
      expect(report.progress).toBe(100);
      expect(report.estimatedCompletionTime).toBe('0 minutes');
      expect(report.recommendations).toContain('Ready for final story');
      expect(report.risks).toHaveLength(0);
      expect(report.missingData).toHaveLength(0);
    });

    it('should generate comprehensive report for partial template', () => {
      const report = generateTemplateReport(partialTemplate);

      expect(report.summary).toContain('Partial');
      expect([0,1]).toContain(report.progress);
      expect(report.estimatedCompletionTime).toBeGreaterThan('0 minutes');
      expect(report.recommendations).toContain('Make choice for Turn 1');
      expect(report.risks.length).toBeGreaterThan(0);
      expect(report.missingData.length).toBeGreaterThan(0);
    });

    it('should generate comprehensive report for empty template', () => {
      const report = generateTemplateReport(emptyTemplate);

      expect(report.summary).toContain('Empty');
      expect(report.progress).toBe(0);
      expect(report.estimatedCompletionTime).toBe('Unknown');
      expect(report.recommendations).toContain('Start new game');
      expect(report.risks).toContain('No game progress');
      expect(report.missingData.length).toBeGreaterThan(0);
    });
  });

  describe('repairTemplate', () => {
    it('should repair template with missing required fields', () => {
      const brokenTemplate = {
        id: 'broken-template',
        name: 'Broken Template',
        // Missing required fields
      } as any;

      const repairResult = repairTemplate(brokenTemplate);

      expect(repairResult.success).toBe(true);
      expect(repairResult.repairedTemplate).toHaveProperty('version');
      expect(repairResult.repairedTemplate).toHaveProperty('createdAt');
      expect(repairResult.repairedTemplate).toHaveProperty('updatedAt');
      expect(repairResult.repairedTemplate).toHaveProperty('type');
      expect(repairResult.repairedTemplate).toHaveProperty('character');
      expect(repairResult.repairedTemplate).toHaveProperty('config');
      expect(repairResult.fixesApplied).toEqual(expect.arrayContaining([expect.stringContaining('Added missing')]));
    });

    it('should repair template with invalid character data', () => {
      const templateWithInvalidCharacter = {
        ...partialTemplate,
        character: {
          persona: 'Invalid Hero',
          stats: {
            intelligence: -5, // Invalid negative stat
            creativity: 25,   // Invalid stat too high
            perception: 8,
            wisdom: 14
          }
        } as any
      };

      const repairResult = repairTemplate(templateWithInvalidCharacter);

      expect(repairResult.success).toBe(true);
      expect(repairResult.fixesApplied).toContain('Fixed invalid character stats');
      expect(repairResult.repairedTemplate.character.stats.intelligence).toBeGreaterThanOrEqual(0);
      expect(repairResult.repairedTemplate.character.stats.intelligence).toBeLessThanOrEqual(20);
    });

    it('should handle template that cannot be repaired', () => {
      const irreparableTemplate = {
        id: 'irreparable',
        // Missing all required fields
      } as any;

      const repairResult = repairTemplate(irreparableTemplate);

      expect(repairResult.success).toBe(false);
      expect(repairResult.errors).toContain('Template structure too damaged to repair');
    });
  });

  describe('compareTemplates', () => {
    it('should compare two templates and identify differences', () => {
      const comparison = compareTemplates(completeTemplate, partialTemplate);

      expect(comparison.similarity).toBeLessThan(100);
      expect(comparison.differences).toContain('Turn completion');
      expect(comparison.differences).toContain('Story count');
      expect(comparison.differences).toContain('Choice count');
      expect(comparison.commonElements).toContain('Character');
      expect(comparison.commonElements).toContain('First turn data');
    });

    it('should compare identical templates', () => {
      const comparison = compareTemplates(completeTemplate, completeTemplate);

      expect(comparison.similarity).toBe(100);
      expect(comparison.differences).toHaveLength(0);
      expect(comparison.commonElements).toContain('All elements');
    });

    it('should compare empty and complete templates', () => {
      const comparison = compareTemplates(emptyTemplate, completeTemplate);

      expect(comparison.similarity).toBe(0);
      expect(comparison.differences.length).toBeGreaterThan(0);
      expect(comparison.commonElements).toContain('Template structure');
    });
  });

  describe('estimateCompletionTime', () => {
    it('should estimate completion time for complete template', () => {
      const estimate = estimateCompletionTime(completeTemplate);

      expect(estimate.minutes).toBe(0);
      expect(estimate.status).toBe('complete');
      expect(estimate.nextSteps).toContain('Generate final story');
    });

    it('should estimate completion time for partial template', () => {
      const estimate = estimateCompletionTime(partialTemplate);

      expect(estimate.minutes).toBeGreaterThan(0);
      expect(estimate.status).toBe('in-progress');
      expect(estimate.nextSteps).toContain('Make choice for Turn 1');
      expect(estimate.remainingTurns).toBe(2);
    });

    it('should estimate completion time for empty template', () => {
      const estimate = estimateCompletionTime(emptyTemplate);

      expect(estimate.minutes).toBeGreaterThan(0);
      expect(estimate.status).toBe('not-started');
      expect(estimate.nextSteps).toContain('Upload first image');
      expect(estimate.remainingTurns).toBe(3);
    });

    it('should consider user experience level in estimation', () => {
      const estimate = estimateCompletionTime(partialTemplate, 'experienced');

      expect(estimate.minutes).toBeLessThan(estimateCompletionTime(partialTemplate, 'beginner').minutes);
    });
  });
}); 