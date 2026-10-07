import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchMealCategories,
  fetchMealsByCategory,
} from '../api/mealdbApi'
import type { GalleryMeal, MealCategory } from '../api/mealdbApi'

function Gallery() {
  const [categories, setCategories] = useState<MealCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [meals, setMeals] = useState<GalleryMeal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignoreResult = false

    async function loadCategories() {
      setIsLoading(true)
      setError('')

      try {
        const returnedCategories = await fetchMealCategories()

        if (!ignoreResult) {
          setCategories(returnedCategories)

          if (returnedCategories.length > 0) {
            setSelectedCategory(returnedCategories[0].strCategory)
          } else {
            setIsLoading(false)
          }
        }
      } catch {
        if (!ignoreResult) {
          setCategories([])
          setSelectedCategory('')
          setMeals([])
          setError('Unable to load meal categories. Please try again.')
          setIsLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    let ignoreResult = false

    async function loadMeals() {
      setIsLoading(true)
      setError('')

      try {
        const returnedMeals = await fetchMealsByCategory(selectedCategory)

        if (!ignoreResult) {
          setMeals(returnedMeals)
        }
      } catch {
        if (!ignoreResult) {
          setMeals([])
          setError('Unable to load meals. Please try again.')
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false)
        }
      }
    }

    void loadMeals()

    return () => {
      ignoreResult = true
    }
  }, [selectedCategory])

  const mealIds = meals.map((meal) => meal.idMeal)

  return (
    <section className="page gallery-page">
      <div className="page-heading">
        <h1>Gallery Page</h1>
        <p>Browse meals by category.</p>
      </div>

      <div className="gallery-controls">
        <h2>Filter by category</h2>
        <div className="category-filters" aria-label="Meal categories">
          {categories.map((category) => (
            <button
              type="button"
              className={
                selectedCategory === category.strCategory
                  ? 'category-button active'
                  : 'category-button'
              }
              key={category.strCategory}
              onClick={() => setSelectedCategory(category.strCategory)}
              aria-pressed={selectedCategory === category.strCategory}
            >
              {category.strCategory}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="status-message">Loading meals...</p>}
      {error && (
        <p className="status-message error-message" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && meals.length === 0 && (
        <p className="status-message">No meals found for this category.</p>
      )}

      {!isLoading && !error && meals.length > 0 && (
        <ul className="gallery-grid">
          {meals.map((meal, index) => (
            <li className="gallery-card" key={meal.idMeal}>
              <Link
                className="gallery-card-link"
                to={`/meal/${meal.idMeal}`}
                state={{ mealIds, currentIndex: index }}
              >
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <h2>{meal.strMeal}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Gallery
