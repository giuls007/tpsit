const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// GET /post
app.get('/post', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Post Page</h1>
        <form method="POST" action="/post">
          <input type="text" name="title" placeholder="Title" required />
          <button type="submit">Save</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/post', (req, res) => {
  const filePath = path.join(__dirname, 'post.json');

  let posts = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    posts = JSON.parse(data);
  }

  posts.push(req.body);

  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));

  res.send('Saved');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
