// backend/models/complaint.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    imageUrl: String,

    // GeoJSON Point: [lng, lat]
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending'
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },

    assignedDepartment: { type: String }, // e.g., 'Electricity'
    proofImage: { type: String },         // proof when status changes

    area: { type: String },               // e.g., "Karol Bagh, Delhi"

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    givenAt: { type: Date }
    },
    // Timeline of status changes
    history: [
      {
        status: { type: String, enum: ['pending', 'in-progress', 'resolved'] },
        date: { type: Date, default: Date.now },
        proofImage: { type: String }
      }
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: false } // We're managing createdAt/updatedAt manually
);

// ──────────────────────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────────────────────
complaintSchema.index({ location: '2dsphere' }); // For $near queries

// ──────────────────────────────────────────────────────────────
// Middleware: Auto-update `updatedAt` + initialize history
// ──────────────────────────────────────────────────────────────
complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  if (this.isNew) {
    this.history = [{ status: this.status, date: this.createdAt }];
  }
  next();
});

// ──────────────────────────────────────────────────────────────
// Middleware: Track status changes on `findOneAndUpdate`
// ──────────────────────────────────────────────────────────────
complaintSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.status) {
    const historyEntry = {
      status: update.status,
      date: new Date()
    };

    if (update.proofImage) {
      historyEntry.proofImage = update.proofImage;
    }

    this.updateOne({}, { $push: { history: historyEntry } });
  }

  next();
});

// ──────────────────────────────────────────────────────────────
// Prevent OverwriteModelError in dev (hot reload)
// ──────────────────────────────────────────────────────────────
const Complaint =
  mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;