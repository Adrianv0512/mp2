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

  return (
    <>
      <h1>List Page</h1>

      <label htmlFor="meal-search">Search meals</label>
      <input
        id="meal-search"
        type="search"
        placeholder="Try pasta, curry, or soup"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <label htmlFor="sort-by">Sort by</label>
      <select
        id="sort-by"
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as SortBy)}
      >
        <option value="strMeal">Name</option>
        <option value="strCategory">Category</option>
      </select>

      <label htmlFor="sort-order">Sort order</label>
      <select
        id="sort-order"
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value as SortOrder)}
      >
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option>
      </select>

      {isLoading && <p>Loading meals...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && sortedMeals.length === 0 && (
        <p>No meals found.</p>
      )}

      {!isLoading && !error && sortedMeals.length > 0 && (
        <ul>
          {sortedMeals.map((meal) => (
            <li key={meal.idMeal}>
              <Link to={`/meal/${meal.idMeal}`}>
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  width="160"
                />
                <h2>{meal.strMeal}</h2>
                <p>Category: {meal.strCategory}</p>
                <p>Cuisine: {meal.strArea}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default List
