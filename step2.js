const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const filePath = path.join(__dirname, 'post.json');

function getPosts() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function savePosts(posts) {
  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

/* API ROUTES */

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(getPosts());
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  const posts = getPosts();
  const post = posts.find(p => p.id == req.params.id);
  res.json(post);
});

// Create post
app.post('/api/posts', upload.single('image'), (req, res) => {
  const posts = getPosts();

  const newPost = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    extraInfo: req.body.extraInfo,
    image: req.file ? '/uploads/' + req.file.filename : null
  };

  posts.push(newPost);
  savePosts(posts);

  res.json({ success: true });
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  let posts = getPosts();
  posts = posts.filter(p => p.id != req.params.id);
  savePosts(posts);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
