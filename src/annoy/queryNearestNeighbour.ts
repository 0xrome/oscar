const AnnoyIndex = require('annoy-node');

export function queryNearestNeighbors(userVector: number[], type: 'attributes' | 'preferences'): string[] {
    console.log("querying nearest neighbours");
    // Load the appropriate index based on the type
    const indexFile = type === 'attributes' ? 'attributes.ann' : 'preferences.ann';
    const index = new AnnoyIndex('euclidean');
    index.load(indexFile);
  
    // Number of neighbors to retrieve. This can be adjusted.
    const NUM_NEIGHBORS = 1;
  
    // Query the index
    const nearestNeighbors = index.getNNsByVector(userVector, NUM_NEIGHBORS);
  
    return nearestNeighbors;
  }
  