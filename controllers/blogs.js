const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        logger.info('blog ',blogs)
        response.json(blogs)
      })
  })
  
blogsRouter.post('/', (request, response) => {
const blog = new Blog(request.body)

blog
    .save()
    .then(result => {
        logger.info(result)
        response.status(201).json(result)
    })
})

module.exports = blogsRouter