require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const { Pool } = require("pg")

const app = express()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

app.use(cors())
app.use(express.json())

// Serves front end + build files
app.use(express.static(path.join(__dirname, "../blog/build")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../blog/build/index.html"))
})

// Get all posts
app.get("/posts", async (req, res) => {
  const result = await pool.query("SELECT * FROM posts ORDER BY date DESC")
  res.json(result.rows)
})

// Adds a new post
app.post("/posts", async (req, res) => {
  const { title, content } = req.body
  const result = await pool.query("INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *",
    [title, content]
  )
  res.json(result.rows[0])
})

// Edits a post
app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const result = await pool.query("UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *",
    [title, content, id]
  )
  res.json(result.rows[0])
})

// Deletes a post
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params
  await pool.query("DELETE FROM posts WHERE id = $1", [id])
  res.json({ success: true })
})

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))