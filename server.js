const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');
const bcrypt = require('bcrypt'); // For hashing passwords
const app = express();
const port = 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Define a schema for blog posts
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    image: String,  // Store image filename
    createdAt: { type: Date, default: Date.now },
    comments: [{ 
        user: String, 
        text: String, 
        createdAt: { type: Date, default: Date.now } 
    }]
});

// Create a model for blog posts
const Post = mongoose.model('Post', postSchema);

// Registration Route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10); // The number 10 here is the salt rounds

        // Create a new user object
        const newUser = new User({
            username: username,
            password: hashedPassword, // Store the hashed password
        });

        // Save the user to the database
        await newUser.save();

        // Send a success response
        res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Check if the user exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        // If login is successful, send a success response
        // You can also generate a JWT token here and send it back to the user if you're implementing token-based authentication
        res.status(200).json({ message: "Login successful." });

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, 'manasi123', { expiresIn: '24h' });

        res.json({ token, username: user.username });

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Route to get all posts
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

// Route to create a new post with an image
app.post('/posts', upload.single('image'), async (req, res) => {
    const { title, content, author } = req.body;
    if (title && content && author) {
        const newPost = new Post({
            title: title,
            content: content,
            author: author,
            image: req.file ? req.file.filename : null  // Save the image filename
        });
        await newPost.save();
        res.status(201).json(newPost);
    } else {
        res.status(400).json({ message: "Title, content, and author are required." });
    }
});


// Route to get a post by ID
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: "Post not found." });
        }
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format." });
    }
});

// Route to update a post by ID
app.put('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            await post.save();
            res.json(post);
        } else {
            res.status(404).json({ message: "Post not found." });
        }
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format." });
    }
});

// Route to delete a post by ID
app.delete('/posts/:id', async (req, res) => {
    try {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: "Post not found." });
        }
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format." });
    }
});

// Route to add a comment to a post
app.post('/posts/:id/comments', async (req, res) => {
    const { user, text } = req.body;
    if (user && text) {
        try {
            const post = await Post.findById(req.params.id);
            if (post) {
                post.comments.push({ user, text });
                await post.save();
                res.status(201).json(post);
            } else {
                res.status(404).json({ message: "Post not found." });
            }
        } catch (err) {
            res.status(400).json({ message: "Invalid ID format." });
        }
    } else {
        res.status(400).json({ message: "User and text are required for a comment." });
    }
});

// Route to search posts by title or content
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (query) {
        const posts = await Post.find({
            $or: [
                { title: new RegExp(query, 'i') },
                { content: new RegExp(query, 'i') }
            ]
        });
        res.json(posts);
    } else {
        res.status(400).json({ message: "Query parameter 'q' is required." });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
