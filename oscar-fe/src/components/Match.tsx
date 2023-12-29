import React, { useState, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'

const Match = () => {
  const [combinedVector, setCombinedVector] = useState<number[]>([])
  const [matches, setMatches] = useState<number[]>([])
  const [error, setError] = useState('')

  const handleVectorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const vectorString = event.target.value
    const vectorArray = vectorString.split(',').map((str) => {
      const num = parseFloat(str)
      return isNaN(num) ? 0 : num // replace invalid numbers with 0
    })
    setCombinedVector(vectorArray)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('Sending combinedVector:', combinedVector)
    try {
      const response = await axios.post('/api/query-nearest-neighbour', {
        combinedVector,
      })
      setMatches(response.data.neighbors)
      setError('')
    } catch (err) {
      if (err instanceof Error) {
        setError('Failed to fetch matches: ' + err.message)
      } else {
        setError('Failed to fetch matches')
      }
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
