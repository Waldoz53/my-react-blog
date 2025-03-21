import React, { useState, useEffect } from "react"

const API_URL = "http://localhost:5001/posts"

function App() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingId, setEditingId] = useState(null)

  // loads posts from postgresql database
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setPosts(data || []))
      .catch(err => console.error("Error fetching posts:", err))
  }, [])

  async function addPost() {
    if (!title || !content) {
      return
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({title, content})
    })
    const newPost = await response.json()
    setPosts([newPost, ...posts])
    setTitle("")
    setContent("")
  }
  async function deletePost(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" })
    setPosts(posts.filter(post => post.id !== id))
  }

  function startEdit(id) {
    setEditingId(id)
  }
  async function saveEdit(id, newTitle, newContent) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent })
    })
    const updatedPost = await response.json()
    setPosts(posts.map(post => post.id === id ? updatedPost : post))
    setEditingId(null)
  }

  return (
    <div className='main'>
      <h1>Basic React Blog</h1>
      <div className='main-inputs'>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)}/>
        <button onClick={addPost}>Add Post</button>
      </div>

      <div className='posts-container'>
        {posts.length > 0 ? '' : "No posts available."}
        {posts.map((post) => (
          <div key={post.id} className="post-container">
            { editingId === post.id ? (
              <div className="edit-post">
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) =>
                    setPosts(posts.map(p => p.id === post.id ? { ...p, title: e.target.value } : p))
                  }
                  style={{ width: "286px", padding: "5px", marginBottom: "5px", marginTop: "8px" }}
                />
                <textarea
                  value={post.content}
                  onChange={(e) =>
                    setPosts(posts.map(p => p.id === post.id ? { ...p, content: e.target.value } : p))
                  }
                  style={{ width: "286px", height: "80px", padding: "5px" }}
                />
                <button onClick={() => saveEdit(post.id, post.title, post.content)} style={{ marginRight: "5px" }}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
              ) : (
                <div className="post">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <p>{new Date(post.date).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                  <button onClick={() => startEdit(post.id)} style={{marginRight: "5px"}}>Edit</button>
                  <button onClick={() => deletePost(post.id)}>Delete</button>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
