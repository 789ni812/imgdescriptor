// Developer mock mode configuration
// Set any of these to true to enable mocks for that feature

export const MOCK_IMAGE = false; // Not used directly, but placeholder for future
export const MOCK_IMAGE_DESCRIPTION = false;
export const MOCK_STORY = true;

// Mock data
export const MOCK_IMAGE_URL = '/img-tree.jpg';
export const MOCK_IMAGE_DESCRIPTION_TEXT = 'A beautiful tree stands alone in a sunlit field, its leaves glowing with the golden light of sunset.';
export const MOCK_STORY_TEXT = `
**The Tree of Solitude**

Once upon a time, in a vast open field, there stood a solitary tree. It had witnessed countless sunsets, each one painting the sky with hues of gold and crimson. Travelers from distant lands would rest beneath its branches, finding peace and inspiration in its quiet strength. The tree became a symbol of hope, reminding all who saw it that even in solitude, there is beauty and purpose.`;

// 3-Turn Mock Data for Story Evolution Testing
export const TURN_BASED_MOCK_DATA = {
  imageDescriptions: {
    1: `**Turn 1: The Ancient Forest**

A dense, mystical forest stretches before you, with towering trees whose branches intertwine to create a natural cathedral. Sunlight filters through the canopy in golden beams, illuminating a winding path that disappears into the shadows. Ancient moss covers the tree trunks, and the air is thick with the scent of earth and mystery. In the distance, you can hear the gentle rustling of leaves and the distant call of unknown creatures. This forest feels alive with ancient magic and untold secrets waiting to be discovered.`,

    2: `**Turn 2: The Hidden Cave Entrance**

Deep within the forest, you discover a hidden cave entrance partially concealed by overgrown vines and fallen branches. The opening is framed by weathered stone that seems to have been carved by ancient hands. Strange symbols are etched into the rock face, glowing faintly with an otherworldly light. The air around the entrance feels cooler, carrying whispers of secrets from deep within the earth. A sense of both danger and wonder emanates from this mysterious portal, as if it holds the key to the forest's deepest mysteries.`,

    3: `**Turn 3: The Crystal Chamber**

Inside the cave, you find yourself in a breathtaking crystal chamber. The walls are lined with luminescent crystals that pulse with an ethereal blue light, casting dancing shadows across the smooth stone floor. In the center of the chamber stands an ancient altar, carved from the same crystal material. The air hums with magical energy, and you can feel the weight of centuries of forgotten knowledge. This sacred space seems to be the heart of the forest's power, where the ancient magic that has protected these lands for generations still resides.`
  },

  stories: {
    1: `**The Guardian of the Ancient Forest**

In the heart of a realm where magic still whispered through the trees, there stood an ancient forest that had watched over the land for countless generations. The towering trees, their branches intertwined like the fingers of giants, created a natural sanctuary where time seemed to stand still. Sunlight filtered through the emerald canopy in golden beams, illuminating a winding path that beckoned travelers deeper into its mysterious depths.

**Elena**, a young adventurer with a heart full of curiosity and a mind sharp as a blade, found herself drawn to this mystical place. She had heard tales of the forest's ancient magic and the secrets it held within its shadowy embrace. As she stepped onto the moss-covered path, she could feel the forest's energy pulsing around her, welcoming her into its sacred space. The air was thick with the scent of earth and mystery, and every rustle of leaves seemed to carry whispers of forgotten stories.

The forest seemed to recognize something special in Elena, for as she ventured deeper, the trees seemed to part before her, revealing hidden clearings and ancient markers that had been concealed for centuries. She knew that this was only the beginning of an extraordinary journey that would test her courage, wisdom, and the strength of her spirit. The ancient forest had chosen her for a purpose, and soon she would discover what destiny had in store for her.`,

    2: `**The Cave of Ancient Secrets**

As Elena ventured deeper into the mystical forest, her path led her to a discovery that would change everything. Hidden beneath a tangle of overgrown vines and fallen branches, she found an entrance to a cave that seemed to have been carved by ancient hands. The weathered stone frame was adorned with strange symbols that glowed with an otherworldly light, pulsing in rhythm with her own heartbeat.

**The symbols told a story** of guardians who had once protected the forest's deepest secrets, and of a power that had been sealed away for generations. The air around the entrance felt cooler, carrying whispers of forgotten knowledge and ancient magic. Elena could sense that this cave held the key to understanding the forest's true nature and her own destiny within it.

With her **intelligence** guiding her understanding of the ancient markings and her **perception** helping her navigate the treacherous entrance, Elena carefully made her way into the cave. The symbols seemed to respond to her presence, their glow intensifying as she passed. She knew that the challenges ahead would test not just her physical abilities, but her wisdom and creativity as well. The cave's secrets were waiting to be uncovered, and Elena was determined to prove herself worthy of the knowledge that lay within.`,

    3: `**The Heart of the Forest's Power**

Deep within the cave's winding passages, Elena discovered a chamber that took her breath away. The walls were lined with luminescent crystals that pulsed with an ethereal blue light, casting dancing shadows across the smooth stone floor. In the center of this sacred space stood an ancient altar, carved from the same crystal material that seemed to hum with magical energy.

**This was the heart of the forest's power**, the source of all the magic that had protected these lands for generations. The crystals seemed to sing with ancient knowledge, and Elena could feel their energy resonating with her own spirit. The altar, covered in intricate carvings that told the story of the forest's creation, held the key to unlocking the full potential of her abilities.

As Elena approached the altar, her **wisdom** and **creativity** combined to help her understand the ancient magic that surrounded her. The crystals began to glow brighter, and she could feel the forest's power flowing through her. She had proven herself worthy of this sacred knowledge, and now she would become the forest's new guardian, protecting its secrets and ensuring that its magic would continue to thrive for generations to come. The journey that had begun with a simple step into the forest had led her to her true destiny.`
  }
}; 