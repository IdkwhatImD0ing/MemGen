import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, {
        onUserLoaded: async (req, res, session) => {
          const signedUp = session.user.user_metadata?.signed_up
          if (!signedUp) {
            // Redirect to /api/signup if the signed_up flag is not set
            res.writeHead(302, {
              Location: '/api/signup',
            })
            res.end()
          } else {
            // Redirect to /homepage if the user has already signed up
            res.writeHead(302, {
              Location: '/homepage',
            })
            res.end()
          }
          return session
        },
      })
    } catch (error) {
      res.status(error.status || 400).end(error.message)
    }
  },
  login: handleLogin(),
  logout: handleLogout(),
})
