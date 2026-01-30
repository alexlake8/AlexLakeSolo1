
from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join("data", "movies.json")

def load_movies():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_movies(movies):
    with open(DATA_FILE, "w") as f:
        json.dump(movies, f, indent=2)

@app.route("/api/movies", methods=["GET"])
def get_movies():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))

    movies = load_movies()
    total = len(movies)
    start = (page - 1) * page_size
    end = start + page_size

    return jsonify({
        "items": movies[start:end],
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size
    })

@app.route("/api/movies", methods=["POST"])
def add_movie():
    data = request.json
    if not data or "title" not in data or "genre" not in data or "rating" not in data:
        return jsonify({"error": "Missing fields"}), 400

    if not (1 <= data["rating"] <= 10):
        return jsonify({"error": "Rating must be between 1 and 10"}), 400

    movies = load_movies()
    new_id = max(m["id"] for m in movies) + 1 if movies else 1

    movie = {
        "id": new_id,
        "title": data["title"],
        "genre": data["genre"],
        "rating": data["rating"]
    }

    movies.append(movie)
    save_movies(movies)
    return jsonify(movie), 201

@app.route("/api/movies/<int:movie_id>", methods=["PUT"])
def update_movie(movie_id):
    data = request.json
    movies = load_movies()

    for movie in movies:
        if movie["id"] == movie_id:
            movie["title"] = data.get("title", movie["title"])
            movie["genre"] = data.get("genre", movie["genre"])
            movie["rating"] = data.get("rating", movie["rating"])
            save_movies(movies)
            return jsonify(movie)

    return jsonify({"error": "Movie not found"}), 404

@app.route("/api/movies/<int:movie_id>", methods=["DELETE"])
def delete_movie(movie_id):
    movies = load_movies()
    movies = [m for m in movies if m["id"] != movie_id]
    save_movies(movies)
    return jsonify({"status": "deleted"})

@app.route("/api/stats", methods=["GET"])
def stats():
    movies = load_movies()
    total = len(movies)
    avg = sum(m["rating"] for m in movies) / total if total else 0

    genre_count = {}
    for m in movies:
        genre_count[m["genre"]] = genre_count.get(m["genre"], 0) + 1
    top_genre = max(genre_count, key=genre_count.get) if genre_count else None

    return jsonify({
        "total": total,
        "avgRating": round(avg, 2),
        "topGenre": top_genre
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

