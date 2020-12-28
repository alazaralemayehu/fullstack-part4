const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { get } = require('../controllers/blogs')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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

//  login token for second user
let token = ""
//  login token for the first user
beforeEach( async() => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    
    const saltRounds = 10;
    const passwordHash = await (bcrypt.hash('test', saltRounds))

    const userObject = new User({
        username: 'test',
        name: 'test',
        passwordHash
    });

    let userForToken = {
        username: userObject.username,
        id: userObject._id
    };
    
    await userObject.save()

    testUser = userObject
    token =  jwt.sign(userForToken, process.env.SECRET_KEY)

    const blogObjects = initialBlogs
    .map(blog => new Blog(blog))

    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    // initialBlogs.forEach(async(blog)=> {
    //     blog.user = userObject._id.toString()
    //     let blogObject = new Blog(blog)
    //     await blogObject.save()
    // })
    //  login and get the token
})

describe('when there is initially some blogs saved', () => {
        
    test('all blogs are returned', async() => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('get request to /api/blogs will return all blogs', async() => {

        const response = await api.get('/api/blogs')

        const titles = response.body.map( b => b.title)
        expect(titles).toContain(
            "Abebe Beso Bela"
        )
    })
    test('blogs are returned as json', async() => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
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
        .set('Authorization', `bearer ${token}`)
        .set('Accept', /application\/json/)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

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
        .set('Authorization', `bearer ${token}`)
        .set('Accept', /application\/json/)
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
            .set('Authorization', `bearer ${token}`)
            .set('Accept', /application\/json/)
            .send(newBlog)
            .expect(400)
    })
})

describe('unauthorizedAccess test', () => {
    test('trying delete blog that the user does not own returns 401', async() => {

        const newBlog = {
            title: 'unauthroized access test',
            author: 'alazar',
            url: 'www.google.com',
            likes: 12,
        }

        const createdBlog = await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .set('Accept', /application\/json/)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        await api.delete(`/api/blogs/${createdBlog.body.id}`)
            .expect(401)
    })

    test('trying to add blog without authentication returns 401', async() => {
        const newBlog = {
            title: 'unauthroized access test',
            author: 'alazar',
            url: 'www.google.com',
            likes: 12,
        }

        const createdBlog = await api
            .post('/api/blogs')
            .set('Accept', /application\/json/)
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })

    test('trying to add blog without wrong token returns 401', async() => {
        const newBlog = {
            title: 'unauthroized access test',
            author: 'alazar',
            url: 'www.google.com',
            likes: 12,
        }

        const createdBlog = await api
            .post('/api/blogs')
            .set('Accept', /application\/json/)
            .set('Authorization', `bearer wrong token`)
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })
})

test('unique identifier property is named id',async() => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})


afterAll(() => {
    mongoose.connection.close()
})