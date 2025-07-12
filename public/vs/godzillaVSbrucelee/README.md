# Godzilla vs Bruce Lee Demo

This folder contains all the demo data for the Godzilla vs Bruce Lee battle scenario.

## Images

The following images have been uploaded and are ready for use:

### Fighter Images
- `godzilla.jpg` - Image of Godzilla (massive prehistoric monster) ✅
- `bruce-lee.jpg` - Image of Bruce Lee (martial artist) ✅

### Arena Image
- `tokyo-arena.jpg` - Image of Tokyo city streets/battle arena ✅

## Usage

The demo data is automatically loaded when the "Reset to Demo" button is clicked in the playervs interface. This will:

1. Load Godzilla as Fighter A
2. Load Bruce Lee as Fighter B  
3. Load Tokyo City Streets as the battle arena
4. Show the "Start Fight" button

## Demo Data Structure

The demo data includes:
- **Fighter Stats**: Realistic stats reflecting each character's abilities
- **Visual Analysis**: Detailed descriptions for AI battle generation
- **Environmental Objects**: List of objects in the arena that can be used in battle

## Character Balance

- **Godzilla**: High health (500), high strength (25), low agility (6) - reflects his massive size and power
- **Bruce Lee**: Lower health (120), high agility (20), high luck (18) - reflects his speed and martial arts mastery

This creates an interesting dynamic where Godzilla has overwhelming power but Bruce Lee has speed and technique advantages.

## File Structure

```
public/vs/godzillaVSbrucelee/
├── demoData.ts          # Demo data with fighter and arena objects
├── README.md           # This documentation
├── godzilla.jpg        # Godzilla fighter image
├── bruce-lee.jpg       # Bruce Lee fighter image
└── tokyo-arena.jpg     # Tokyo city arena image
``` 