import React from 'react';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CharacterStats: React.FC = () => {
  const { character } = useCharacterStore();

  const getAlignmentVariant = (level: string) => {
    switch (level) {
      case 'evil': return 'destructive' as const;
      case 'villainous': return 'destructive' as const;
      case 'neutral': return 'secondary' as const;
      case 'good': return 'default' as const;
      case 'heroic': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  const getAlignmentIcon = (level: string) => {
    switch (level) {
      case 'evil': return '👿';
      case 'villainous': return '😈';
      case 'neutral': return '😐';
      case 'good': return '😇';
      case 'heroic': return '🦸';
      default: return '😐';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-green-500';
    if (score >= 20) return 'text-green-400';
    if (score >= -20) return 'text-muted-foreground';
    if (score >= -60) return 'text-red-400';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Basic Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Character Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Intelligence</p>
              <p className="text-2xl font-bold text-card-foreground">{character.stats.intelligence}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Creativity</p>
              <p className="text-2xl font-bold text-card-foreground">{character.stats.creativity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Perception</p>
              <p className="text-2xl font-bold text-card-foreground">{character.stats.perception}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Wisdom</p>
              <p className="text-2xl font-bold text-card-foreground">{character.stats.wisdom}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moral Alignment */}
      <Card>
        <CardHeader>
          <CardTitle>Moral Alignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alignment Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getAlignmentIcon(character.moralAlignment.level)}</span>
              <div>
                <p className="font-medium text-card-foreground">Alignment</p>
                <Badge variant={getAlignmentVariant(character.moralAlignment.level)}>
                  {character.moralAlignment.level.charAt(0).toUpperCase() + character.moralAlignment.level.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(character.moralAlignment.score)}`}>
                {character.moralAlignment.score > 0 ? '+' : ''}{character.moralAlignment.score}
              </p>
            </div>
          </div>

          {/* Reputation */}
          <div>
            <p className="text-sm font-medium mb-1 text-card-foreground">Reputation</p>
            <p className="text-sm text-muted-foreground">{character.moralAlignment.reputation}</p>
          </div>

          {/* Recent Choices */}
          {character.moralAlignment.recentChoices.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-card-foreground">Recent Choices</p>
              <div className="space-y-1">
                {character.moralAlignment.recentChoices.slice(0, 3).map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{choice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alignment Bar */}
          <div>
            <p className="text-sm font-medium mb-2 text-card-foreground">Alignment Progress</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 via-muted-foreground to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.abs(character.moralAlignment.score)}%`,
                  marginLeft: character.moralAlignment.score < 0 ? 'auto' : '0',
                  marginRight: character.moralAlignment.score < 0 ? '0' : 'auto'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Evil (-100)</span>
              <span>Neutral (0)</span>
              <span>Heroic (+100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Info */}
      <Card>
        <CardHeader>
          <CardTitle>Character Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Level</p>
              <p className="text-2xl font-bold text-card-foreground">{character.level}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Experience</p>
              <p className="text-2xl font-bold text-card-foreground">{character.experience}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Health</p>
              <p className="text-2xl font-bold text-card-foreground">{character.health}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Age</p>
              <p className="text-2xl font-bold text-card-foreground">{character.age}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 