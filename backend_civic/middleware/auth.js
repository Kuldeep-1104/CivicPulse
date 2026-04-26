import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch full user and populate department in req.user
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = {
      id: user._id,
      role: user.role,
      department: user.department  // ← POPULATED FROM DB
    }

    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}