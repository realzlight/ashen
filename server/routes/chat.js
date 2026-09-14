import express from 'express'
import Project from '../models/Project.js'

const router = express.Router()

// Called from arbitrary customer websites, not just our own frontend —
// needs open CORS, unlike the cookie-based auth/project routes.
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// Public widget config — name + color only, nothing sensitive
router.get('/config', async (req, res) => {
  try {
    const { widgetKey } = req.query
    if (!widgetKey) return res.status(400).json({ msg: 'Missing widgetKey' })
    const project = await Project.findOne({ widgetKey }).select('name themeColor')
    if (!project) return res.status(404).json({ msg: 'Invalid widgetKey' })
    res.json({ name: project.name, themeColor: project.themeColor })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { widgetKey, message, history } = req.body
    if (!widgetKey) return res.status(400).json({ msg: 'Missing widgetKey' })
    if (!message) return res.status(400).json({ msg: 'Missing message' })

    const project = await Project.findOne({ widgetKey })
    if (!project) return res.status(404).json({ msg: 'Invalid widgetKey' })

    const systemPrompt = `You are a customer support assistant for ${project.name}.
Business info: ${project.businessInfo || 'Not provided'}
Knowledge base: ${project.docs || 'Not provided'}
Answer only using the information above. If you're not confident the answer is covered by this information, say you're not sure and offer to connect them with a human — do not guess.`

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood — I will answer using only that information.' }] },
      ...(Array.isArray(history)
        ? history.map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          }))
        : []),
      { role: 'user', parts: [{ text: message }] },
    ]

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${project.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    )

    if (!geminiRes.ok || !geminiRes.body) {
      const errText = await geminiRes.text()
      res.write(`data: ${JSON.stringify({ error: errText })}\n\n`)
      return res.end()
    }

    const reader = geminiRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue
        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
        } catch {
          // partial/incomplete JSON chunk — wait for more data
        }
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Chat error:', err)
    if (!res.headersSent) {
      res.status(500).json({ msg: err.message })
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
})

export default router
