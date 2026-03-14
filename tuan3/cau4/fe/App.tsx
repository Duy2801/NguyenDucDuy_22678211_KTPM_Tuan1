import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");

  const loadPosts = async () => {
    const res = await axios.get("http://localhost:5000/api/posts");
    setPosts(res.data);
  };

  const createPost = async () => {
    await axios.post("http://localhost:5000/api/posts", {
      title: title,
      content: "Demo content",
      author: "Admin"
    });
    loadPosts();
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div>
      <h2>Mini Blog CMS</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />

      <button onClick={createPost}>Create Post</button>

      <ul>
        {posts.map((p) => (
          <li key={p._id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;