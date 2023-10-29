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
                        src={user['Please upload a photo of yourself']}
                        alt="Avatar Tailwind CSS Component"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{user['First Name:']}</div>
                    <div className="text-sm opacity-50">
                      {user['Last Name:']}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                {' '}
                {new Date(
                  user['What is your date of birth?'],
                ).toLocaleDateString()}
              </td>
              <td>{user['Phone number:']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
