import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const router = express.Router()

// Register (kept your current version)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Validate
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' })
  }

  const userExists = await User.findOne({ email })
  if (userExists) return res.status(400).json({ message: 'User already exists' })

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

  res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role || 'citizen'}
  })
})

// Login – MERGED with department in payload & response
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // ← ADDED department to JWT payload
  const payload = {
    id: user._id,
    role: user.role,
    department: user.department   // ← THIS LINE ADDED
  }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      department: user.department   // ← also returned to frontend
    } 
  })
})

export default router