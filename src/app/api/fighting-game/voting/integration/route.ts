import { NextRequest, NextResponse } from 'next/server';
import { votingIntegrationService } from '@/lib/services/votingIntegrationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const fighterId = searchParams.get('fighterId');

    switch (action) {
      case 'all-fighters':
        // Get all fighters with voting data
        const allFighters = await votingIntegrationService.getAllFightersWithVotingData();
        return NextResponse.json({
          success: true,
          data: allFighters,
          count: allFighters.length
        });

      case 'fighter-stats':
        // Get voting stats for a specific fighter
        if (!fighterId) {
          return NextResponse.json({
            success: false,
            error: 'fighterId parameter is required'
          }, { status: 400 });
        }
        
        const fighterStats = await votingIntegrationService.getFighterVotingStats(fighterId);
        if (!fighterStats) {
          return NextResponse.json({
            success: false,
            error: 'Fighter not found or no voting data available'
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          data: fighterStats
        });

      case 'crowd-favorites':
        // Get fighters with high popularity scores
        const crowdFavorites = await votingIntegrationService.getCrowdFavorites();
        return NextResponse.json({
          success: true,
          data: crowdFavorites,
          count: crowdFavorites.length
        });

      case 'trending':
        // Get fighters with rising popularity
        const trendingFighters = await votingIntegrationService.getTrendingFighters();
        return NextResponse.json({
          success: true,
          data: trendingFighters,
          count: trendingFighters.length
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available actions: all-fighters, fighter-stats, crowd-favorites, trending'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in voting integration API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, votingResults } = body;

    if (action === 'integrate-session') {
      if (!votingResults) {
        return NextResponse.json({
          success: false,
          error: 'votingResults is required'
        }, { status: 400 });
      }

      // Integrate voting data from a completed session
      await votingIntegrationService.integrateVotingData(votingResults);
      
      return NextResponse.json({
        success: true,
        message: 'Voting data integrated successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Available actions: integrate-session'
    }, { status: 400 });
  } catch (error) {
    console.error('Error in voting integration API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 