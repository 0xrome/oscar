const AnnoyIndex = require('annoy-node');

export function updateUserIndex(userId: string, attributesVector: number[], preferencesVector: number[]) {
  console.log("updating User Index...");
  // Load the existing Annoy indices
  const attributeIndex = new AnnoyIndex('euclidean');
  const preferenceIndex = new AnnoyIndex('euclidean');
  attributeIndex.load('attributes.ann');
  preferenceIndex.load('preferences.ann');

  // Add the new user's vectors to the indices
  attributeIndex.addItem(userId, attributesVector);
  preferenceIndex.addItem(userId, preferencesVector);

  // You might not need to build the index again; however, if you add a lot of items, rebuilding can optimize the index.
  const NUM_TREES = 10;
  attributeIndex.build(NUM_TREES);
  preferenceIndex.build(NUM_TREES);

  // Save the updated indices
  attributeIndex.save('attributes.ann');
  preferenceIndex.save('preferences.ann');
}
