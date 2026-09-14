import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: String,
  email: String,
  avatar: String,
  accessToken: String // optional, if you need to call GitHub API later
})

export default mongoose.model('User', userSchema)