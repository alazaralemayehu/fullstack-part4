const blogsRouter = require('express').Router()
const { response } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')



blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})
  
blogsRouter.post('/', async(request, response, next) => {
  const title = request.body.title
  const url = request.body.url
  const token = request.token
  const likes = request.body.likes
  const author = request.body.author 

  let decodedToken  = null
  try {
    if (!token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    decodedToken = jwt.verify(token, process.env.SECRET_KEY)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  } catch (error) {
    next(error)
    return
  } 
  
  if (!title || !url) {
    return response.status(400).end()
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = new Blog({
    author: author,
    title: title,
    url: url,
    likes: likes,
    user: (user)._id
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async(request, response, next) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  const token = request.token

  let decodedToken  = null
  try {
    if (!token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    decodedToken = jwt.verify(token, process.env.SECRET_KEY)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  } catch (error) {
    next(error)
    return
  } 
  const userid = decodedToken.id
  
  if (blog){
    if ( blog.user.toString() === userid.toString() ){
      await blog.remove()
      response.status(204).send()
    } else {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  } else {
    response.status(404).send()
  }
  response.status(204).end()
})

blogsRouter.put('/:id', async(request, response) => {
  const body = request.body
  const id = request.params.id

  const blog = await Blog.findById(id)
  if (blog) {
    const updatedBlog = await Blog.findOneAndReplace(id, body, {new: true})
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})
module.exports = blogsRouter