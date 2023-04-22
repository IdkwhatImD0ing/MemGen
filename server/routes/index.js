var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'})
})

/* POST route to handle JSON input */
router.post('/query', function (req, res, next) {
  const {userid, text} = req.body

  if (userid && text) {
    // Process the data as needed
    res.status(200).json({message: 'Data received', userid, text})
  } else {
    res
      .status(400)
      .json({
        message: 'Bad request. Please provide both userid and text fields.',
      })
  }
})

module.exports = router
