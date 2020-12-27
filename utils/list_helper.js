const blog = require("../models/blog")

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    const likeSum = blogs.length===0 ? 0 : blogs.reduce(reducer, 0)
    return likeSum
}

const favoriteBlog = (blogs) => {
    // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    // sort in descending order so that we can get the blog with most like at index 0
    const sortedBlogs = blogs.sort((a,b)=>(a.likes<b.likes)? 1:-1 )
    console.log(sortedBlogs)
    return sortedBlogs[0]
}

const mostBlogs = (blogs) => {
    const authors = []
    const authorUpdater = (blog) => {
        const author = authors.find(author => blog.author === author.author)
        if (author){ 
            author.blogs += 1
        } else {
            const newAuthor = {
                author: blog.author,
                blogs : 1
            }
            authors.push(newAuthor)
        }
    }
   blogs.forEach(blog => {
        authorUpdater(blog)
    });

    const sortedAuthor = authors.sort((a,b)=>(a.blogs<b.blogs)? 1:-1 )
    return (sortedAuthor[0])
}
// Uses the same approach as MostBlogs except the focus here is on Like
const mostLikes = (blogs) => {

    const authors = []
    const authorUpdater = (blog) => {
        const author = authors.find(author => blog.author === author.author)
        if (author){ 
            author.likes += blog.likes
        } else {
            const newAuthor = {
                author: blog.author,
                likes : blog.likes
            }
            authors.push(newAuthor)
        }
    }
   blogs.forEach(blog => {
        authorUpdater(blog)
    });

    const sortedAuthor = authors.sort((a,b)=>(a.likes<b.likes)? 1:-1 )
    return (sortedAuthor[0])
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}