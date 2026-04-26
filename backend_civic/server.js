// backend/server.js
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import complaintRoutes from './routes/complaints.js'
import adminRoutes from './routes/admin.js'
import mlRoutes from './routes/ml.js'
import departmentRoutes from './routes/department.js'

dotenv.config({ path: '../.env' })
const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/ml', mlRoutes)
app.use('/api/department', departmentRoutes)

// Health Check
app.get('/', (req, res) => {
  res.send('CivicPulse API Running! (Local MongoDB)')
})

// Connect DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected (Local)')
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message)
    process.exit(1)
  }
}

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})