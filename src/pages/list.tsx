import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchMeals } from '../api/mealdbApi'
import type { Meal } from '../api/mealdbApi'

type SortBy = 'strMeal' | 'strCategory'
type SortOrder = 'ascending' | 'descending'

function List() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('strMeal')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignoreResult = false

    async function loadMeals() {
      setIsLoading(true)
      setError('')

      try {
        const query = searchQuery.trim()
        const returnedMeals = await searchMeals(query)

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
  }, [searchQuery])

  const sortedMeals = [...meals].sort((firstMeal, secondMeal) => {
    const comparison = firstMeal[sortBy].localeCompare(secondMeal[sortBy])

    return sortOrder === 'ascending' ? comparison : -comparison
  })
  const mealIds = sortedMeals.map((meal) => meal.idMeal)

  return (
    <section className="page list-page">
      <div className="page-heading">
        <h1>List Page</h1>
        <p>Search for a meal and sort the results.</p>
      </div>

      <div className="list-controls">
        <div className="form-field search-field">
          <label htmlFor="meal-search">Search meals</label>
          <input
            id="meal-search"
            type="search"
            placeholder="Try pasta, curry, or soup"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="sort-by">Sort by</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
          >
            <option value="strMeal">Name</option>
            <option value="strCategory">Category</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="sort-order">Sort order</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          >
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="status-message">Loading meals...</p>}
      {error && (
        <p className="status-message error-message" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && sortedMeals.length === 0 && (
        <p className="status-message">No meals found.</p>
      )}

      {!isLoading && !error && sortedMeals.length > 0 && (
        <ul className="meal-list">
          {sortedMeals.map((meal, index) => (
            <li className="meal-list-card" key={meal.idMeal}>
              <Link
                className="meal-list-card-link"
                to={`/meal/${meal.idMeal}`}
                state={{ mealIds, currentIndex: index }}
              >
                <img
                  className="meal-list-image"
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                />
                <div className="meal-list-content">
                  <h2>{meal.strMeal}</h2>
                  <p><strong>Category:</strong> {meal.strCategory}</p>
                  <p><strong>Cuisine:</strong> {meal.strArea}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default List
