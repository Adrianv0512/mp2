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

  return (
    <>
      <h1>Gallery Page</h1>

      <div className="gallery-controls">
        <label htmlFor="meal-category">Category</label>
        <select
          id="meal-category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          disabled={categories.length === 0}
        >
          {categories.map((category) => (
            <option
              key={category.strCategory}
              value={category.strCategory}
            >
              {category.strCategory}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Loading meals...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && meals.length === 0 && (
        <p>No meals found for this category.</p>
      )}

      {!isLoading && !error && meals.length > 0 && (
        <ul className="gallery-grid">
          {meals.map((meal) => (
            <li className="gallery-card" key={meal.idMeal}>
              <Link to={`/meal/${meal.idMeal}`}>
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <h2>{meal.strMeal}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default Gallery
