const API_BASE = "https://alexlakesolo1.onrender.com";
const PAGE_SIZE = 10;

let currentPage = 1;
let totalPages = 1;

const tableBody = document.getElementById("movieTable");
const form = document.getElementById("movieForm");
const pageIndicator = document.getElementById("pageIndicator");

/* ---------------------------
   LOAD MOVIES (PAGED)
---------------------------- */
function loadPage(page = 1) {
  fetch(`${API_BASE}/api/movies?page=${page}&pageSize=${PAGE_SIZE}`)
    .then(res => res.json())
    .then(data => {
      currentPage = data.page;
      totalPages = data.totalPages;
      renderMovies(data.items);
      updatePagingUI();
    })
    .catch(err => console.error("Error loading movies:", err));
}

/* ---------------------------
   RENDER MOVIES
---------------------------- */
function renderMovies(movies) {
  tableBody.innerHTML = "";

  movies.forEach(movie => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.genre}</td>
      <td>${movie.rating}</td>
      <td>
        <button onclick="editMovie(${movie.id})">Edit</button>
        <button onclick="deleteMovie(${movie.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/* ---------------------------
   PAGING CONTROLS
---------------------------- */
function updatePagingUI() {
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
}

function prevPage() {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
}

/* ---------------------------
   STATS
---------------------------- */
function loadStats() {
  fetch(`${API_BASE}/api/stats`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("totalCount").textContent = data.total;
      document.getElementById("avgRating").textContent = data.avgRating;
    });
}

/* ---------------------------
   CREATE / UPDATE
---------------------------- */
form.addEventListener("submit", e => {
  e.preventDefault();

  const id = document.getElementById("movieId").value;
  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const rating = Number(document.getElementById("rating").value);

  if (!title || !genre || rating < 1 || rating > 10) {
    alert("Please enter valid values.");
    return;
  }

  const movieData = { title, genre, rating };

  const method = id ? "PUT" : "POST";
  const url = id
    ? `${API_BASE}/api/movies/${id}`
    : `${API_BASE}/api/movies`;

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movieData)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw err; });
      }
      return res.json();
    })
    .then(() => {
      form.reset();
      document.getElementById("movieId").value = "";
      loadPage(currentPage);
      loadStats();
    })
    .catch(err => alert(err.error || "Server error"));
});

/* ---------------------------
   EDIT
---------------------------- */
function editMovie(id) {
  fetch(`${API_BASE}/api/movies?page=1&pageSize=1000`)
    .then(res => res.json())
    .then(data => {
      const movie = data.items.find(m => m.id === id);
      if (!movie) return;

      document.getElementById("movieId").value = movie.id;
      document.getElementById("title").value = movie.title;
      document.getElementById("genre").value = movie.genre;
      document.getElementById("rating").value = movie.rating;
    });
}

/* ---------------------------
   DELETE
---------------------------- */
function deleteMovie(id) {
  if (!confirm("Are you sure you want to delete this movie?")) return;

  fetch(`${API_BASE}/api/movies/${id}`, { method: "DELETE" })
    .then(() => {
      // Handle edge case: deleting last item on last page
      if (currentPage > 1 && tableBody.children.length === 1) {
        currentPage--;
      }
      loadPage(currentPage);
      loadStats();
    });
}

/* ---------------------------
   INITIAL LOAD
---------------------------- */
loadPage(1);
loadStats();
