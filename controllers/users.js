const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.post('/', async(request, response, next) => {
    const body = request.body
    console.log(body)
    const saltRounds = 10
    const password = body.password
    const username = body.username
    const name = body.name
    
    if (password.length <3) {
        response.status(400).json({error: 'Valdiation Error: password length must more than 3 characters'})
        return 
    }
    if (username.length < 3) {
        response.status(400).json({error: 'Valdiation Error: username length must more than 3 characters'})
        return
    }
    
    const passwordHash = await bcrypt.hash(password, saltRounds)
    try {
        const user = new User({
            username: username,
            name: name,
            passwordHash: passwordHash,
        })
        const savedUser = await user.save()
        response.json(savedUser)

    } catch(error) {
        if ( error.name === 'ValidationError') {
            return response.status(400).json({error: `Validation Error: ${error.message} `})
        } else {
            next(error)
        }
    }   
})


usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({})
        .populate('blogs',{title:1, url:1, likes:1})

    response.json(users)
  })


module.exports = usersRouter