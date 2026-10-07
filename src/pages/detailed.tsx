import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getMealById } from '../api/mealdbApi'
import type {
  IngredientKey,
  IngredientNumber,
  Meal,
  MeasureKey,
} from '../api/mealdbApi'

interface MealNavigationState {
  mealIds: string[]
  currentIndex: number
}

interface IngredientItem {
  ingredient: string
  measure: string
}

function getIngredients(meal: Meal): IngredientItem[] {
  const ingredients: IngredientItem[] = []

  for (let number = 1; number <= 20; number += 1) {
    const ingredientNumber = number as IngredientNumber
    const ingredientKey: IngredientKey = `strIngredient${ingredientNumber}`
    const measureKey: MeasureKey = `strMeasure${ingredientNumber}`
    const ingredient = meal[ingredientKey]?.trim()
    const measure = meal[measureKey]?.trim() ?? ''

    if (ingredient) {
      ingredients.push({ ingredient, measure })
    }
  }

  return ingredients
}

function Detailed() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNotFound, setIsNotFound] = useState(false)

  const navigationState = location.state as MealNavigationState | null
  const mealIds = navigationState?.mealIds ?? []
  const currentIndex = navigationState?.currentIndex ?? -1
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < mealIds.length - 1

  useEffect(() => {
    if (!id) {
      return
    }

    const mealId = id
    let ignoreResult = false

    async function loadMeal() {
      setIsLoading(true)
      setError('')
      setIsNotFound(false)
      setMeal(null)

      try {
        const returnedMeal = await getMealById(mealId)

        if (!ignoreResult) {
          if (returnedMeal) {
            setMeal(returnedMeal)
          } else {
            setIsNotFound(true)
          }
        }
      } catch {
        if (!ignoreResult) {
          setError('Unable to load this meal. Please try again.')
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false)
        }
      }
    }

    void loadMeal()

    return () => {
      ignoreResult = true
    }
  }, [id])

  function goToMeal(newIndex: number) {
    const newMealId = mealIds[newIndex]

    if (!newMealId) {
      return
    }

    navigate(`/meal/${newMealId}`, {
      state: { mealIds, currentIndex: newIndex },
    })
  }

  const ingredients = meal ? getIngredients(meal) : []

  return (
    <>
      <h1>Meal Details</h1>

      {!id && <p role="alert">No meal ID was provided.</p>}
      {isLoading && <p>Loading meal...</p>}
      {error && <p role="alert">{error}</p>}
      {isNotFound && <p>Meal not found.</p>}

      {!isLoading && !error && meal && (
        <article>
          <h2>{meal.strMeal}</h2>
          <img src={meal.strMealThumb} alt={meal.strMeal} width="320" />
          <p>Category: {meal.strCategory}</p>
          <p>Cuisine: {meal.strArea}</p>

          <h3>Ingredients</h3>
          {ingredients.length > 0 ? (
            <ul>
              {ingredients.map(({ ingredient, measure }, index) => (
                <li key={`${ingredient}-${index}`}>
                  {measure ? `${measure} ` : ''}
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredients are available.</p>
          )}

          <h3>Instructions</h3>
          <p>{meal.strInstructions}</p>
        </article>
      )}

      <div>
        <button
          type="button"
          onClick={() => goToMeal(currentIndex - 1)}
          disabled={!hasPrevious}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => goToMeal(currentIndex + 1)}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default Detailed
