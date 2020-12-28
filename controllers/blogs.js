const blogsRouter = require('express').Router()
const { response } = require('../app')
const Blog = require('../models/blog')
const logger = require('../utils/logger')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})
  
blogsRouter.post('/', async(request, response) => {
  const title = request.body.title
  const url = request.body.url

  if (!title || !url) {
    return response.status(400).end()
  }
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', async(request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  if (blog){
    await blog.remove()
    response.status(204).send()
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