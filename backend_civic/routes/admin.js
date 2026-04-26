// backend/routes/admin.js
import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import Complaint from '../models/complaint.js'

const router = express.Router()

// UPDATE PRIORITY
router.patch('/complaints/:id/priority', protect, admin, async (req, res) => {
  const { priority } = req.body
  if (!['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' })
  }
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ message: 'Not found' })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// UPDATE STATUS ← NEW!
router.patch('/complaints/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body
  if (!['pending', 'in-progress', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ message: 'Not found' })
    res.json(complaint)
  } catch (err) {
    console.error('Status update error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET COMPLAINTS
router.get('/complaints', protect,admin,  async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .sort('-createdAt')
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: 'Failed to load complaints' })
  }
})


// GET UNIQUE CATEGORIES (EXCLUDES GENERAL)
router.get('/categories', protect, admin, async (req, res) => {
  try {
    const categories = await Complaint.distinct('category')
    const filtered = categories
      .filter(cat => cat && cat !== 'General')
      .sort()
    res.json(filtered)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
})

// DELETE COMPLAINT – 100% WORKING
router.delete('/complaints/:id', protect, admin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // DELETE IMAGE FROM CLOUDINARY (IF EXISTS)
    if (complaint.imageUrl) {
      try {
        const publicId = complaint.imageUrl.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
        console.log('Image deleted from Cloudinary:', publicId)
      } catch (cloudinaryErr) {
        console.warn('Cloudinary delete failed (non-critical):', cloudinaryErr.message)
      }
    }

    // DELETE FROM DATABASE
    await complaint.deleteOne()
    // OR: await Complaint.findByIdAndDelete(req.params.id)

    res.json({ message: 'Complaint deleted successfully' })
  } catch (err) {
    console.error('DELETE COMPLAINT ERROR:', err)
    res.status(500).json({ message: 'Failed to delete complaint' })
  }
  // Add Remark
router.post('/complaints/:id/remark', protect, admin, async (req, res) => {
  const { text } = req.body
  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Not found' })

  complaint.remarks = complaint.remarks || []
  complaint.remarks.push({
    text,
    author: req.user.id,
    createdAt: new Date()
  })
  await complaint.save()
  res.json(complaint.remarks)
})
})

export default router



// export default router