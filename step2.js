const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const uploadsDir = path.join(__dirname, 'uploads');
const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(viewsDir)) fs.mkdirSync(viewsDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

const cssContent = `
body { font-family: Arial; margin: 20px; }
form { display: flex; flex-direction: column; max-width: 400px; }
input, textarea { margin-bottom: 10px; padding: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
.card { border: 1px solid #ddd; padding: 10px; border-radius: 10px; }
img { width: 100%; border-radius: 8px; }
.gallery-img { height: 200px; object-fit: cover; }
.single-img { max-width: 500px; }
a { text-decoration: none; color: blue; }
button { padding: 10px; cursor: pointer; }
`;

fs.writeFileSync(path.join(publicDir, 'style.css'), cssContent);

const views = {
  post: `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<h1>Crea Post</h1>
<form action="/post" method="POST" enctype="multipart/form-data">
<input type="text" name="title" placeholder="Titolo" required>
<textarea name="description" placeholder="Descrizione" required></textarea>
<input type="text" name="extraInfo" placeholder="Informazioni aggiuntive">
<input type="file" name="image" accept="image/*">
<button type="submit">Salva</button>
</form>
<a href="/postGallery">Vai ai Post</a>
</body>
</html>
`,

  postGallery: `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<h1>Tutti i Post</h1>
<a href="/post">Nuovo Post</a>
<div class="grid">
<% posts.forEach(post => { %>
<div class="card">
<% if(post.image){ %>
<img src="<%= post.image %>" />
<% } %>
<h3><%= post.title %></h3>
<p><%= post.description %></p>
<a href="/post/<%= post.id %>">Dettagli</a>
</div>
<% }) %>
</div>
</body>
</html>
`,

  gallery: `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<h1>Gallery Immagini</h1>
<div class="grid">
<% posts.forEach(post => { %>
<% if(post.image){ %>
<a href="/post/<%= post.id %>">
<img src="<%= post.image %>" class="gallery-img"/>
</a>
<% } %>
<% }) %>
</div>
<a href="/postGallery">Torna ai Post</a>
</body>
</html>
`,

  singlePost: `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<h1><%= post.title %></h1>
<% if(post.image){ %>
<img src="<%= post.image %>" class="single-img"/>
<% } %>
<p><%= post.description %></p>
<p><strong>Extra:</strong> <%= post.extraInfo %></p>
<a href="/postGallery">Indietro</a>
</body>
</html>
`
};

Object.keys(views).forEach(view => {
  fs.writeFileSync(path.join(viewsDir, view + '.ejs'), views[view]);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

const filePath = path.join(__dirname, 'post.json');

app.get('/post', (req, res) => {
  res.render('post');
});

app.post('/post', upload.single('image'), (req, res) => {

  let posts = [];
  if (fs.existsSync(filePath)) {
    posts = JSON.parse(fs.readFileSync(filePath));
  }

  const newPost = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    extraInfo: req.body.extraInfo,
    image: req.file ? '/uploads/' + req.file.filename : null
  };

  posts.push(newPost);

  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));

  res.redirect('/postGallery');
});

app.get('/postGallery', (req, res) => {
  let posts = [];
  if (fs.existsSync(filePath)) {
    posts = JSON.parse(fs.readFileSync(filePath));
  }
  res.render('postGallery', { posts });
});

app.get('/gallery', (req, res) => {
  let posts = [];
  if (fs.existsSync(filePath)) {
    posts = JSON.parse(fs.readFileSync(filePath));
  }
  res.render('gallery', { posts });
});

app.get('/post/:id', (req, res) => {
  let posts = [];
  if (fs.existsSync(filePath)) {
    posts = JSON.parse(fs.readFileSync(filePath));
  }
  const post = posts.find(p => p.id == req.params.id);
  res.render('singlePost', { post });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
