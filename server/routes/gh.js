import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL, // must be exactly https://ashen-9949.onrender.com/api/auth/github/callback
    scope: 'read:user user:email',
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query
    if (!code) return res.status(400).send('No code')

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL, // FIX 1: must send again
      }),
    })

    const tokenData = await tokenRes.json()
    console.log('TOKEN DATA:', tokenData)
    const access_token = tokenData.access_token
    if (!access_token) throw new Error('No access_token: ' + JSON.stringify(tokenData))

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const ghUser = await userRes.json()

    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const emails = await emailRes.json()
    const primaryEmail = Array.isArray(emails) ? emails.find(e => e.primary)?.email || emails[0]?.email : ghUser.email

    let user = await User.findOne({ githubId: ghUser.id })
    if (!user) {
      user = await User.create({
        githubId: ghUser.id,
        username: ghUser.login,
        email: primaryEmail,
        avatar: ghUser.avatar_url,
        accessToken: access_token
      })
    } else {
      user.accessToken = access_token
      await user.save()
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    // FIX 2: for cross-site Vercel -> Render
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: isProd, // true on Render
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    res.redirect(`${process.env.CLIENT_URL}/dashboard`)

  } catch (err) {
    console.error('GitHub callback error:', err)
    res.status(500).send('Auth failed: ' + err.message)
  }
})

router.get('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('token', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req,res) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ msg: 'Not logged in' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password -accessToken')
    if (!user) return res.status(404).json({ msg: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' })
  }
})

export default router
