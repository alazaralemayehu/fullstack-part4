const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { get } = require('../controllers/blogs')
const api = supertest(app)
const Blog = require('../models/blog')


const initialBlogs =   [
    {
      title: 'Abebe Beso Bela',
      author: 'alazar',
      url: 'www.google.com',
      likes: 12,
    },
    {
      title: 'Abebe Beso Alibelam',
      author: 'alazar',
      url: 'www.google.com/alibelam',
      likes: 24,
    },
    {
      title: 'Abebe Beso yibelal',
      author: 'alazar',
      url: 'www.google.com/alibelam',
      likes: 48,
    }
]
beforeEach( async() => {
    await Blog.deleteMany({})
    initialBlogs.forEach(async(blog)=> {
        let blogObject = new Blog(blog)
        await blogObject.save()
    })

})

describe('when there is initially some blogs saved', () => {
        
    test('all blogs are returned', async() => {
        const response = await api.get('/api/blogs')
        console.log(response.body, "length")
        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('blogs are returned as json', async() => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('get request to /api/blogs will return all blogs', async() => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map( b => b.title)
        expect(titles).toContain(
            "Abebe Beso Bela"
        )
    })

})

describe('addition of new blog', () => {
    
test('a vaid blog can be added', async() => {
    const newBlog = {
        title: 'adding valid blog',
        author: 'alazar',
        url: 'www.google.com',
        likes: 12,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
        'adding valid blog'
    )
    })
})

describe('adding blogs with missing data', () => {
    
test('blog without likes will set the defualt value of likes to 0', async() => {
    const newBlog = {
        title: "new blog",
        author: 'alazar',
        url: 'www.google.com',
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const response = await api.get('/api/blogs')
    
    const likes = response.body.map(r => r.likes)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(likes).toContain(0)
})

test('blog without url and title will return Bad Request', async() => {
    const newBlog = {
        author: 'alazar',
        likes: 123
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})
})


test('unique identifier property is named id',async() => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})


afterAll(() => {
    mongoose.connection.close()
})