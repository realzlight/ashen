import express from 'express'
import Project from '../models/Project.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

const auth = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ msg: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' })
  }
}

// create project — POST /api/projects
router.post('/', auth, async (req, res) => {
  try {
    const { name, geminiApiKey, businessInfo, websiteUrl, docs } = req.body
    const project = await Project.create({
      owner: req.userId, name, geminiApiKey, businessInfo, websiteUrl, docs
    })
    res.json(project)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

// get all my projects — GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

// get one project by name — GET /api/projects/:name
router.get('/:name', auth, async (req, res) => {
  try {
    const p = await Project.findOne({ name: req.params.name, owner: req.userId })
    if (!p) return res.status(404).json({ msg: 'Not found' })
    res.json(p)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

// update settings (e.g. color) — PATCH /api/projects/:name
router.patch('/:name', auth, async (req, res) => {
  try {
    const { themeColor } = req.body
    const project = await Project.findOneAndUpdate(
      { name: req.params.name, owner: req.userId },
      { ...(themeColor && { themeColor }) },
      { new: true }
    )
    if (!project) return res.status(404).json({ msg: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

// delete — DELETE /api/projects/:name
router.delete('/:name', auth, async (req, res) => {
  try {
    await Project.deleteOne({ name: req.params.name, owner: req.userId })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

export default router
