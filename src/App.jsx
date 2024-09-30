import { useState } from 'react'
import './App.css'
import {Route,Routes} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route element={<Login/>} path='/'/>
      <Route element={<Signup/>} path='/signup'/>
      <Route element={<Chat/>} path='/chat'/>
    </Routes>
  )
}

export default App
