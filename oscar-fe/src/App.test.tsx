import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import App from './App'
import React from 'react'

jest.mock('@firebase/analytics')
jest.mock('axios')

test('renders without crashing', () => {
  const { container } = render(<App />)
  expect(container).toBeTruthy()
})
