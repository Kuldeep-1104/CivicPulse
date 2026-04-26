import express from 'express'
import multer from 'multer'
import Complaint from '../models/complaint.js'
import { protect } from '../middleware/auth.js'
import { uploadImage } from '../utils/cloudinary.js'

const router = express.Router()
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB

// Middleware to check department role
router.use(protect, (req, res, next) => {
  if (req.user.role !== 'department') {
    return res.status(403).json({ message: 'Department access required' })
  }
  next()
})

// GET Assigned Complaints for this Department
router.get('/assigned', async (req, res) => {
  try {
    console.log('Department User:', req.user)  // ← DEBUG

    if (!req.user.department) {
      return res.status(400).json({ message: 'User has no department assigned' })
    }

    const complaints = await Complaint.find({ 
      assignedDepartment: req.user.department 
    }).sort('-createdAt')

    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// UPDATE Status with Proof Image
router.patch('/:id/status', upload.single('proof'), async (req, res) => {
  const { status } = req.body
  const proofFile = req.file

  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Not found' })

    if (complaint.assignedDepartment !== req.user.department) {
      return res.status(403).json({ message: 'Not assigned to your department' })
    }

    let proofImage = null
    if (proofFile) {
      proofImage = await uploadImage(proofFile.buffer)
    }

    complaint.status = status
    complaint.proofImage = proofImage
    await complaint.save()

    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router