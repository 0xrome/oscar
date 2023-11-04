import React, { useState } from 'react'
import { queryNearestNeighbour } from '../../../shared/annoy/queryNearestNeighbour'

const Match: React.FC = () => {
  const [userVector, setUserVector] = useState<number[]>([])
  const [result, setResult] = useState<string[]>([])

  const handleQuery = () => {
    const type: 'attributes' | 'preferences' = 'attributes' // Adjust as necessary
    const { neighbours } = queryNearestNeighbour(userVector, type)
    console.log(neighbours)
    setResult(Array.from(neighbours).map(String))
  }

  return (
    <div>
      <h1>Match Page</h1>

      {/* Input for userVector */}
      <textarea
        placeholder="Enter user vector (comma separated)"
        onChange={(e) =>
          setUserVector(e.target.value.split(',').map((num) => parseFloat(num)))
        }
      />

      {/* Button to initiate the query */}
      <button onClick={handleQuery}>Find Match</button>

      {/* Display the result */}
      <div>
        <h2>Nearest Neighbours:</h2>
        <ul>
          {result.map((neighbour, index) => (
            <li key={index}>{neighbour}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Match
