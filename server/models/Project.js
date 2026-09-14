import mongoose from 'mongoose'
import crypto from 'crypto'

const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, lowercase: true, trim: true },
  geminiApiKey: { type: String, required: true }, // encrypt later
  businessInfo: String,
  websiteUrl: String,
  docs: String, // full knowledge
  widgetKey: { type: String, unique: true, default: () => crypto.randomBytes(12).toString('hex') },
  themeColor: { type: String, default: '#E8491C' },
}, { timestamps: true })

export default mongoose.model('Project', projectSchema)
