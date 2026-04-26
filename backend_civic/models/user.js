import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['citizen', 'admin', 'department'], default: 'citizen' },
  department: { type: String }
})

const createAdminIfNotExists = async () => {
  const adminEmail = 'admin@city.gov'
  const adminPassword = 'admin123'  // Change later!

  try {
    const existingAdmin = await User.findOne({ email: adminEmail })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      const admin = new User({
        email: adminEmail,
        password: hashedPassword,
        name: 'City Administrator',
        role: 'admin'
      })
      await admin.save()
      console.log('ADMIN USER CREATED')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log('   Change password after first login!')
    }
  } catch (err) {
    console.error('Failed to create admin:', err.message)
  }
}

// Export model
const User = mongoose.model('User', userSchema)

// Run admin creation **after DB connects**
// We'll call this from server.js
export const initializeAdmin = () => {
  createAdminIfNotExists()
}

export default mongoose.model('User', userSchema)