import React, { useState } from 'react'
import axios from 'axios'

const Match = () => {
  const [combinedVector, setCombinedVector] = useState([])
  const [matches, setMatches] = useState<number[]>([])
  const [error, setError] = useState('')

  const handleVectorChange = (event) => {
    // Update this method to properly parse your vector input
    setCombinedVector(event.target.value.split(',').map(Number))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('Sending combinedVector:', combinedVector)
    try {
      const response = await axios.post('/api/query-nearest-neighbour', {
        combinedVector,
      })
      setMatches(response.data.neighbors)
      setError('')
    } catch (err) {
      setError('Failed to fetch matches: ' + err.message)
      setMatches([])
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={combinedVector.join(',')}
          onChange={handleVectorChange}
          placeholder="Enter combined vector separated by commas"
        />
        <button type="submit">Find Matches</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="matches">
        {matches.length > 0 && (
          <ul>
            {matches.map((match, index) => (
              <li key={index}>
                Match {index + 1}: {match.toString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Match
