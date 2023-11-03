import React, { useState, useEffect } from 'react'
import { db } from '../config/firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const typeformResponsesCol = collection(db, 'typeformResponses')
      const snapshot = await getDocs(typeformResponsesCol)
      const data = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log('Fetched data:', data)
      data.map((user) => console.log('User:', user))
      console.log(data)

      setUsers(data)
    }
    fetchData()
  }, [])

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>User</th>
            <th>Date of Birth</th>
            <th>Phone Number</th>
            <th>User Attributes</th>
            <th>User Preferences</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img
                        src={user.answers[28].file_url}
                        alt="Avatar Tailwind CSS Component"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{user.answers[0].text}</div>
                    <div className="text-sm opacity-50">
                      {user.answers[1].text}
                    </div>
                  </div>
                </div>
              </td>
              <td>{user.answers[4].date}</td>
              <td>{user.answers[3].phone_number}</td>
              <td>
                {
                  // Check if attributesVector exists and has values, else display "no values"
                  user.attributesVector && user.attributesVector.length > 0
                    ? user.attributesVector.join(', ')
                    : 'no values'
                }
              </td>
              <td>
                {
                  // Check if preferencesVector exists and has values, else display "no values"
                  user.preferencesVector && user.preferencesVector.length > 0
                    ? user.preferencesVector.join(', ')
                    : 'no values'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
