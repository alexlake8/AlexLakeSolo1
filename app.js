
const STORAGE_KEY = "movies";

const genres = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation"
];

const defaultMovies = Array.from({ length: 30 }, (_, i) => ({
  id: Date.now() + i,
  title: `Movie ${i + 1}`,
  genre: genres[Math.floor(Math.random() * genres.length)],
  rating: Math.floor(Math.random() * 10) + 1
}));


function loadMovies() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMovies));
  return defaultMovies;
}

let movies = loadMovies();

const table = document.getElementById("movieTable");
const form = document.getElementById("movieForm");

function renderMovies() {
  table.innerHTML = "";
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
    table.appendChild(row);
  });
  updateStats();
}

function updateStats() {
  document.getElementById("totalCount").textContent = movies.length;
  const avg = movies.reduce((sum, m) => sum + m.rating, 0) / movies.length;
  document.getElementById("avgRating").textContent = avg.toFixed(1);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("movieId").value;
  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const rating = Number(document.getElementById("rating").value);

  if (!title || !genre || rating < 1 || rating > 10) {
    alert("Invalid input");
    return;
  }

  if (id) {
    const movie = movies.find(m => m.id == id);
    movie.title = title;
    movie.genre = genre;
    movie.rating = rating;
  } else {
    movies.push({ id: Date.now(), title, genre, rating });
  }

  save();
  form.reset();
  document.getElementById("movieId").value = "";
});

function editMovie(id) {
  const movie = movies.find(m => m.id === id);
  document.getElementById("movieId").value = movie.id;
  document.getElementById("title").value = movie.title;
  document.getElementById("genre").value = movie.genre;
  document.getElementById("rating").value = movie.rating;
}

function deleteMovie(id) {
  if (!confirm("Delete this movie?")) return;
  movies = movies.filter(m => m.id !== id);
  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  renderMovies();
}

renderMovies();
