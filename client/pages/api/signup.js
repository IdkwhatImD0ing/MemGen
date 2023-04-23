import {withApiAuthRequired, getSession} from '@auth0/nextjs-auth0'
import axios from 'axios'

async function callSignupApi(user, token) {
  try {
    const response = await axios.post(
      'http://localhost:3000/signup',
      {
        email: user.email,
        userid: user.sub,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Signup API response:', response.data)
    return true
  } catch (error) {
    console.error('Error calling the /signup endpoint:', error.message)
    return false
  }
}

async function setSignedUpFlag(user, token) {
  try {
    await axios.patch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}`,
      {
        user_metadata: {
          signed_up: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error setting signed_up flag:', error.message)
  }
}

async function signup(req, res) {
  const {user} = getSession(req, res)
  const token = req.headers.authorization

  const success = await callSignupApi(user, token)
  if (success) {
    await setSignedUpFlag(user, token)
  }
  res.status(200).json({message: 'Called /signup endpoint'})
}

export default withApiAuthRequired(signup)
