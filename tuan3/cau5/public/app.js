const API_URL = "http://localhost:3005/api";

// ================= POST PLUGIN =================
async function loadPosts() {
  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();
  const list = document.getElementById("postsList");

  if (posts.length === 0) {
    list.innerHTML = "<p>Chưa có bài viết nào.</p>";
    return;
  }

  list.innerHTML = "";
  posts.reverse().forEach((post) => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
            <div style="display:flex; justify-content: space-between; align-items:flex-start">
                <h3 style="margin:0 0 10px 0; color:#2196F3;">${post.title}</h3>
                <button class="btn-danger" onclick="deletePost('${post._id}')">Xóa</button>
            </div>
            <p style="margin:0 0 15px 0;">${post.content}</p>
            
            <div class="comments">
                <h4 style="margin: 0 0 10px 0; color:#666;">💬 Bình luận:</h4>
                <div id="comments-${post._id}"></div>
                
                <div class="form-row" style="margin-top: 10px;">
                    <input type="text" id="commentAuthor-${post._id}" placeholder="Tên (không bắt buộc)" style="flex: 0.3"/>
                    <input type="text" id="commentContent-${post._id}" placeholder="Viết bình luận..."/>
                    <button onclick="addComment('${post._id}')" style="background-color:#FF9800;">Gửi</button>
                </div>
            </div>
        `;
    list.appendChild(div);

    // Load comments cho từng bài viết
    loadComments(post._id);
  });
}

document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  e.target.reset();
  loadPosts();
});

async function deletePost(id) {
  if (!confirm("Xóa bài viết này?")) return;
  await fetch(`${API_URL}/posts/${id}`, { method: "DELETE" });
  loadPosts();
}

// ================= COMMENT PLUGIN =================
async function loadComments(postId) {
  const res = await fetch(`${API_URL}/comments/${postId}`);
  const comments = await res.json();
  const container = document.getElementById(`comments-${postId}`);

  if (comments.length === 0) {
    container.innerHTML =
      '<i style="color:#aaa; font-size:0.9em;">Chưa có bình luận</i>';
    return;
  }

  container.innerHTML = comments
    .map(
      (c) => `
        <div class="comment-item">
            <span><b>${c.author || "Khách"}:</b> ${c.content}</span>
            <button class="btn-danger" style="padding:2px 8px; font-size:12px;" onclick="deleteComment('${c._id}', '${postId}')">X</button>
        </div>
    `,
    )
    .join("");
}

async function addComment(postId) {
  const author = document.getElementById(`commentAuthor-${postId}`).value;
  const content = document.getElementById(`commentContent-${postId}`).value;

  if (!content.trim()) return alert("Vui lòng nhập nội dung bình luận!");

  await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, author: author || "Khách", content }),
  });

  document.getElementById(`commentContent-${postId}`).value = "";
  document.getElementById(`commentAuthor-${postId}`).value = "";
  loadComments(postId);
}

async function deleteComment(id, postId) {
  await fetch(`${API_URL}/comments/${id}`, { method: "DELETE" });
  loadComments(postId);
}

// ================= MEDIA PLUGIN =================
async function loadMedia() {
  try {
    const res = await fetch(`${API_URL}/media`);
    const files = await res.json();
    const gallery = document.getElementById("mediaGallery");

    if (files.length === 0) {
      gallery.innerHTML = '<p style="color:#aaa">Chưa có ảnh nào.</p>';
      return;
    }

    gallery.innerHTML = files
      .map(
        (f) => `
            <a href="${f.url}" target="_blank">
                <img src="${f.url}" alt="Uploaded image" title="Click để xem rõ hơn" />
            </a>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Lỗi lấy media:", err);
  }
}

async function uploadMedia() {
  const fileInput = document.getElementById("mediaFile");
  if (!fileInput.files[0])
    return alert("💡 Vui lòng chọn 1 file ảnh trước khi Upload!");

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      body: formData,
    });
    alert("Upload thành công!");
    fileInput.value = ""; // clear input
    loadMedia();
  } catch (err) {
    alert("Lỗi upload");
  }
}

// ================= INIT APP =================
window.onload = () => {
  loadPosts();
  loadMedia();
};
