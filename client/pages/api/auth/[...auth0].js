import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
  getSession,
} from '@auth0/nextjs-auth0'
import axios from 'axios'

async function callSignupApi(user, accessToken) {
  try {
    const response = await axios.post(
      'http://localhost:4004/signup',
      {
        email: user.email,
        userId: user.sub,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Backend Signup API response:', response.data)
  } catch (error) {
    console.error('Error calling the backend /signup endpoint:', error.message)
  }
}

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, {
        redirectTo: async (req, res) => {
          const {user} = req.oidc
          const session = getSession(req, res)
          const signedUp = user.user_metadata?.signed_up

          if (!signedUp) {
            // Call the backend /signup endpoint if the signed_up flag is not set
            await callSignupApi(user, session.accessToken)
          }

          // Redirect to /homepage in any case
          res.redirect('/homepage')
        },
      })
    } catch (error) {
      res.status(error.status || 400).end(error.message)
    }
  },
  login: handleLogin(),
  logout: handleLogout(),
})
