import AnnoyIndex, { Metric } from 'annoy-node';

export function queryNearestNeighbour(userVector: number[], type: 'attributes' | 'preferences'): { neighbours: Int32Array, distances?: Int32Array } {
  console.log("querying nearest neighbours");

  // Assuming dimensions is the length of the userVector or the number of features you have.
  const dimensions = userVector.length;
  const indexFile = type === 'attributes' ? 'attributes.ann' : 'preferences.ann';

  // Instantiate a new AnnoyIndex. Replace 'Angular' with the actual metric used in your model.
  const index = new AnnoyIndex(dimensions, Metric.ANGULAR);
  index.load(indexFile);
  
  // Number of neighbors to retrieve.
  const NUM_NEIGHBORS = 10; // Adjust according to your need

  // Convert userVector to Float32Array as required by the get_nns_by_vector method.
  const float32UserVector = new Float32Array(userVector);

  // Query the index
  const { neighbours, distances } = index.get_nns_by_vector(float32UserVector, NUM_NEIGHBORS, true);

  // Assuming we want to return both neighbours and distances.
  // If not, you can modify this to return only the part you need.
  return {
    neighbours: neighbours[0],
    distances: distances ? distances[0] : undefined
  };
}
