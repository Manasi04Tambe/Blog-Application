// Function to register a new user
async function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (response.ok) {
    alert("Registration successful.");
  } else {
    alert(result.message);
  }
}

// Function to log in a user
async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const loginUser = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login successful.");

        // Step 1: Store the authentication token (e.g., JWT) in localStorage
        localStorage.setItem("authToken", result.token); // Assuming token is returned in the response

        // Step 2: Update the UI to reflect the logged-in state
        document.getElementById("loginForm").style.display = "none"; // Hide the login form
        document.getElementById(
          "userProfile"
        ).innerText = `Welcome, ${result.username}`; // Display user info
        document.getElementById("logoutButton").style.display = "block"; // Show logout button

        // Step 3: Redirect to the dashboard or homepage
        window.location.href = "/dashboard"; // Redirect to the desired page after login
      } else {
        alert(result.message); // Display the error message from the server
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };

  document.getElementById("loginButton").addEventListener("click", loginUser);
}

const logoutUser = () => {
  localStorage.removeItem("authToken"); // Remove the token from storage
  sessionStorage.removeItem("user"); // Remove any user data from session storage

  document.getElementById("loginForm").style.display = "block"; // Show the login form
  document.getElementById("userProfile").innerText = ""; // Clear the user profile display
  document.getElementById("logoutButton").style.display = "none"; // Hide the logout button

  window.location.href = "/login"; // Redirect to the login page
};

document.getElementById("logoutButton").addEventListener("click", logoutUser);

// Function to fetch all posts from the server
async function fetchPosts() {
  const response = await fetch("http://localhost:3000/posts");
  posts = await response.json();
  displayPosts();
}

// Function to create a new post
async function createPost() {
  if (currentUser) {
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const imageFile = document.getElementById("post-image").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", currentUser.username);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch("http://localhost:3000/posts", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      fetchPosts();
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";
      document.getElementById("post-image").value = "";
    } else {
      alert("Failed to create post.");
    }
  } else {
    alert("You must be logged in to create a post.");
  }
}

// Function to delete a post
async function deletePost(id) {
  const response = await fetch(`http://localhost:3000/posts/${id}`, {
    method: "DELETE",
  });

  if (response.ok) {
    fetchPosts();
  } else {
    alert("Failed to delete post.");
  }
}

// Function to edit a post
async function editPost(id) {
  const post = posts.find((post) => post.id === id);
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-content").value = post.content;

  // Delete the old post after loading the data into the form
  deletePost(id);
}

// Function to display comments
function displayComments(postId) {
  const post = posts.find((post) => post._id === postId);
  const commentsSection = document.getElementById(`comments-${postId}`);
  commentsSection.innerHTML = "";

  post.comments.forEach((comment) => {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = `<strong>${comment.user}:</strong> ${comment.text}`;
    commentsSection.appendChild(commentDiv);
  });
}

// Function to add a comment
async function addComment(postId) {
  const user = prompt("Enter your name:");
  const text = prompt("Enter your comment:");
  if (user && text) {
    const response = await fetch(
      `http://localhost:3000/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, text }),
      }
    );

    if (response.ok) {
      fetchPosts(); // Reload posts to display the new comment
    } else {
      alert("Failed to add comment.");
    }
  }
}

// Function to search posts
async function searchPosts() {
  const query = document.getElementById("search-bar").value;
  if (query) {
    const response = await fetch(`http://localhost:3000/search?q=${query}`);
    posts = await response.json();
    displayPosts();
  } else {
    fetchPosts(); // Load all posts if search query is empty
  }
}

// Initially fetch and display posts
fetchPosts();
