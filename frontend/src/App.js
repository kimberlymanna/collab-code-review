import { useState, useEffect, useMemo } from "react";
import ReviewList from "./components/ReviewsList.js";
import ReviewForm from "./components/ReviewForm.js";
import SkeletonLoader from "./components/SkeletonLoader.js";
import styles from './App.module.css';

function App() {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);


  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    })
    .catch((err) => console.error("Fetch error:", err))
    .finally(() => setLoading(false));
  }, []);

  const filteredReviews = useMemo(() => {
    const normalizedFilter = filterText.trim().toLowerCase();
    return reviews
      .filter(review => {
        const username = (review.username || '').toLowerCase();
        const repository = (review.repository || '').toLowerCase();
        return username.includes(normalizedFilter) || repository.includes(normalizedFilter);
      })
      .sort((a, b) => {
        switch(sortOrder) {
          case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'highest': return b.rating - a.rating;
          case 'lowest': return a.rating - b.rating;
          default: return 0;
        }
      });
  }, [reviews, filterText, sortOrder]);



  const handleNewReview = (newReview) => {
    setReviews((prevReviews) => {
      let updatedReviews;

      if (editingReview) {
        updatedReviews = prevReviews.map((r) =>
          r._id === newReview._id ? newReview : r
        );
      } else {
        // Ensure createdAt exists
        if (!newReview.createdAt) {
          newReview.createdAt = new Date().toISOString();
        }
        updatedReviews = [newReview, ...prevReviews];
      }

      return updatedReviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });
  };



  const handleDeleteReview = async (id) => {
    const reviewToDelete = reviews.find(r => r._id === id);
    if (!reviewToDelete) return;

    setReviews(prev => prev.filter(r => r._id !== id));
    setRecentlyDeleted(reviewToDelete);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete review");
        setRecentlyDeleted(null);
      } catch (err) {
        console.error(err.message);
      }
    }, 5000); // 5s window

    setUndoTimeout(timeout);
  };

  const handleEditReview = (review) => {
    setEditingReview(review); // store the review we want to edit
  };

  const handleUndo = () => {
    if (recentlyDeleted) {
      setReviews(prev => [recentlyDeleted, ...prev]);
      setRecentlyDeleted(null);
      if (undoTimeout) clearTimeout(undoTimeout);
    }
  };

return (
     <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className="flex justify-end mb-4">
        <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Code Review App</h1>
      <ReviewForm onAddReview={handleNewReview} editingReview={editingReview} setEditingReview={setEditingReview} darkMode={darkMode}/>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input type="text" placeholder="Search by user or repo" value={filterText} onChange={(e) => setFilterText(e.target.value)} className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" >
          <option value='newest'>Newest</option>
          <option value='oldest'>Oldest</option>
          <option value='highest'>Highest Rating</option>
          <option value='lowest'>Lowest Rating</option>
        </select>

      </div>

      {loading ? <SkeletonLoader /> : <ReviewList reviews={filteredReviews} onDeleteReview={handleDeleteReview} onEditReview={handleEditReview} filterText={filterText}/>}

      {recentlyDeleted && (
        <div className={styles.undoPopup}>
          <span>Review deleted</span>
          <button onClick={handleUndo} className={styles.undoButton}> Undo </button>
        </div>
      )}
    </div>
  );
}

export default App;
