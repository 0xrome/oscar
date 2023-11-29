import { fetchUserVectors } from "./fetchUserVectors";

const { HierarchicalNSW } = require('hnswlib-node');
const indexFilePath = 'foo.dat';

// Specify the space for the index, number of dimensions, and maximum elements
const space = 'l2'; // 'l2' for Euclidean, 'ip' for Inner Product, or 'cosine'
const numDimensions = 8; // Adjust according to your data

async function createAndSaveIndex() {
  console.log("Start: createAndSaveIndex()");

  const userVectors = await fetchUserVectors();
  console.log("createAndSaveIndex() userVectors:", userVectors);

  const numDimensions = userVectors[0].attributesVector.length; // Assuming all vectors have the same length
  console.log("numDimensions:", numDimensions);

  const maxElements = 100; // the maximum number of data points.


   // declaring and intializing index.
   const index = new HierarchicalNSW('l2', 12);
   index.initIndex(maxElements, 16, 200, 100);
   interface UserVector {
    id: string; // or number, if your id is a number
    attributesVector: number[];
    preferencesVector: number[];
  }
  userVectors.forEach((user: UserVector, i) => {
    // You might want to concatenate attributesVector and preferencesVector
    console.log("attributesVector: ", user.attributesVector);
    console.log("preferencesVector: ", user.preferencesVector);
    if (user.attributesVector && user.preferencesVector) {
    const combinedVector = user.attributesVector.concat(user.preferencesVector);
      console.log("combinedVector: ", combinedVector);
      index.addPoint(combinedVector, i);
    } else {
      console.log("combinedVector: ", []);
      index.addPoint([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], i);
    }
  });

  // saving index.
  index.writeIndexSync('foo.dat');
  index.getIdsList();
  console.log("End: createAndSaveIndex()");
}

// Function to load an index and search for nearest neighbors
function searchNearestNeighbors(queryPoint: any, numNeighbors = 10) {
  console.log("searchNearestNeighbors start");
try {
  const index = new HierarchicalNSW('l2', 12);
  console.log("create index: ", index);

  index.readIndexSync('foo.dat')
  console.log("foo.dat read");
  console.log("length of index: ", index.getMaxElements())
  console.log("getNumDimensions: ", index.getNumDimensions())
  console.log("getIdsList: ", index.getIdsList())
  console.log("getEf: ", index.getEf())
  console.log("getCurrentCount: ", index.getCurrentCount())

  console.log("searching for nearest neighbours");
  // Search for nearest neighbors
  const result = index.searchKnn(queryPoint, numNeighbors);
  const nearestNeighbour = index.getPoint(result.neighbors[0]);
  console.log("Nearest neighbour: ", nearestNeighbour);
  return nearestNeighbour;
} catch (error) {
  console.error('Error during search:', error);
  throw error; // Rethrow the error to handle it in the outer try-catch block
}
  
}

module.exports = {
  createAndSaveIndex,
  searchNearestNeighbors,
};

export {}