import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000'

interface Reservation {
  id: number
  guestName: string
  start: string
  end: string
  createdAt: string
}

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [guestName, setGuestName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const createReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName || !startDate || !endDate) return

    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName,
          start: new Date(startDate).toISOString(),
          end: new Date(endDate).toISOString(),
        }),
      })

      if (response.ok) {
        setGuestName('')
        setStartDate('')
        setEndDate('')
        // Refresh list
        try {
          const res = await fetch(`${API_URL}/reservations`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) {
              setReservations(data)
            } else {
              console.error('API returned non-array data:', data)
            }
          }
        } catch (error) {
          console.error('Error fetching reservations:', error)
        }
      } else {
        console.error('Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
    }
  }

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_URL}/reservations`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setReservations(data)
          } else {
            console.error('API returned non-array data:', data)
            setReservations([])
          }
        } else {
          console.error('Failed to fetch reservations:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
      }
    }

    void fetchReservations()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Système de Réservation</h1>

      <form onSubmit={(e) => { void createReservation(e) }} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nom du client"
            required
            style={{ flex: 1, padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Réserver
        </button>
      </form>

      <h2>Liste des réservations</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reservations.map((res) => (
          <li key={res.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', borderRadius: '4px' }}>
            <strong>{res.guestName}</strong>
            <br />
            Du: {new Date(res.start).toLocaleDateString()}
            <br />
            Au: {new Date(res.end).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
