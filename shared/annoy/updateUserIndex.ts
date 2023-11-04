import AnnoyIndex from 'annoy-node';

export function updateUserIndex(userId: number, attributesVector: number[], preferencesVector: number[]) {
  console.log("updating User Index...");
  
  const dimensions = attributesVector.length; // Replace with actual dimensions if different
  const attributeIndex = new AnnoyIndex(dimensions, 2);
  const preferenceIndex = new AnnoyIndex(dimensions, 2);
  
  attributeIndex.load('attributes.ann');
  preferenceIndex.load('preferences.ann');

  // Convert to Float32Array
  const float32AttributesVector = new Float32Array(attributesVector);
  const float32PreferencesVector = new Float32Array(preferencesVector);

  // Assuming userId is an integer that can be used as an item index
  attributeIndex.addItem(userId, float32AttributesVector);
  preferenceIndex.addItem(userId, float32PreferencesVector);

  // You might not need to build the index again; however, if you add a lot of items, rebuilding can optimize the index.
  const NUM_TREES = 10; // Adjust according to your need or model
  attributeIndex.build(NUM_TREES);
  preferenceIndex.build(NUM_TREES);

  // Save the updated indices
  attributeIndex.save('attributes.ann');
  preferenceIndex.save('preferences.ann');
}
