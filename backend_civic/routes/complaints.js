// backend/routes/complaints.js
import express from 'express'
import multer from 'multer'
import Complaint from '../models/complaint.js'
import { protect } from '../middleware/auth.js'
import { uploadImage } from '../utils/cloudinary.js'
import axios from 'axios'

const router = express.Router()
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB

// CREATE COMPLAINT
router.post('/', protect, upload.single('image'), async (req, res) => {
  const { description, area, location: locationJson, priority: incomingPriority  , category} = req.body  // ← FIX: Get from body
  const imageFile = req.file

  // Validate description
  if (!description?.trim()) {
    return res.status(400).json({ message: 'Description is required' })
  }

  // Parse location JSON
  let lat, lng
  try {
    const loc = JSON.parse(locationJson)
    lat = parseFloat(loc.lat)
    lng = parseFloat(loc.lng)
    if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinates')
  } catch (err) {
    return res.status(400).json({ 
      message: 'Location must be JSON: {"lat": number, "lng": number}' 
    })
  }

  // Department Mapping (add more categories as needed)
const departmentMap = {
  'Potholes': 'Roads',
  'Garbage Collection': 'Sanitation',
  'Street Lights': 'Electricity',
  'Water Leakage': 'Water Supply',
  'Sewage Issues': 'Sanitation',
  'Noise Pollution': 'Public Safety',
  'Illegal Parking': 'Traffic',
  'Public Safety': 'Public Safety',
  'Broken Roads': 'Roads',
  'Overgrowth': 'Parks',
  'Uncollected Trash': 'Sanitation',
  'Other': 'General'
}
  const assignedDepartment = departmentMap[category] || 'General'
  // Upload image
  let imageUrl = null
  if (imageFile) {
    try {
      imageUrl = await uploadImage(imageFile.buffer)
    } catch (err) {
      return res.status(500).json({ message: 'Image upload failed', error: err.message })
    }
  }

  // ML Category (optional)
  // const { category } = req.body 
  
  try {
    const mlRes = await axios.post(
      'http://localhost:8000/categorize',
      { text: description },
      { timeout: 3000 }
    )
    category = mlRes.data.category || category
  } catch (err) {
    console.log('ML service down – using General')
  }

  // Save complaint
  const complaint = new Complaint({
    user: req.user.id,
    description: description.trim(),
    category,
    assignedDepartment,
    area,
    imageUrl,
    location: {
      type: 'Point',
      coordinates: [lng, lat] // GeoJSON: [lng, lat]
    },
    priority: (incomingPriority || 'low').toLowerCase(),
    upvotes: []
  })

  try {
    await complaint.save()
    res.status(201).json(complaint)
  } catch (err) {
    console.error('DB Error:', err)
    res.status(500).json({ message: 'Failed to save complaint' })
  }
})

// GET MY COMPLAINTS
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean()
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// UPVOTE (ONLY ONE!)
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    if (complaint.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already upvoted' })
    }

    complaint.upvotes.push(req.user.id)
    await complaint.save()

    res.json({ upvotes: complaint.upvotes })  // ← Return full array (for frontend)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// assigned 
router.get('/assigned', protect, async (req, res) => {
  const department = req.query.department
  const complaints = await Complaint.find({ assignedDepartment: department })
    .sort('-createdAt')
  res.json(complaints)
})

router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body
  const proofFile = req.file

  let proofImage = null
  if (proofFile) {
    proofImage = await uploadImage(proofFile.buffer)
  }

  const complaint = await Complaint.findById(req.params.id)
  complaint.status = status
  complaint.proofImage = proofImage
  await complaint.save()

  res.json(complaint)
})

// GET NEARBY
router.get('/nearby', protect, async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query
  try {
    const complaints = await Complaint.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius)
        }
      },
      user: { $ne: req.user.id }
    }).limit(10)
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: 'Nearby query failed' })
  }
})

// MARK URGENT
router.post('/:id/urgent', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Not found' })
    if (complaint.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not owner' })

    complaint.priority = 'high'
    await complaint.save()
    res.json({ message: 'Marked as urgent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST Feedback (Only for resolved complaints)
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found' });

    // ✅ Check: Only complaint owner can give feedback
    // if (complaint.user.toString() !== req.user.id)
    //   return res.status(403).json({ message: 'Not authorized' });

    // ✅ Check: Allow feedback only after resolution
    if (complaint.status !== 'resolved')
      return res.status(400).json({ message: 'Can only give feedback after resolution' });

    // ✅ Save feedback
    complaint.feedback = {
      rating: parseInt(rating),
      comment,
      givenAt: new Date()
    };

    await complaint.save();
    res.json({
  message: 'Feedback submitted successfully',
  feedback: complaint.feedback
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

// GET ALL PUBLIC COMPLAINTS
router.get('/public', async (req, res) => {
  const { page = 1, limit = 50 } = req.query
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ GET only resolved complaints with feedback (for admin)
router.get('/feedbacks', protect, async (req, res) => {
  try {
    const feedbackComplaints = await Complaint.find({
      'feedback.rating': { $exists: true },
      status: 'resolved'
    }).populate('user', 'name email');

    res.json(feedbackComplaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
})

export default router