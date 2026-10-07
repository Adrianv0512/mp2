import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getMealById, searchMeals } from '../api/mealdbApi'
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

const NAVIGATION_STORAGE_KEY = 'meal-navigation-state'

function getNavigationStateForMeal(
  value: unknown,
  mealId: string,
): MealNavigationState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const possibleState = value as Partial<MealNavigationState>

  if (
    !Array.isArray(possibleState.mealIds) ||
    !possibleState.mealIds.every((savedId) => typeof savedId === 'string') ||
    typeof possibleState.currentIndex !== 'number'
  ) {
    return null
  }

  const currentIndex = possibleState.mealIds.indexOf(mealId)

  if (currentIndex === -1) {
    return null
  }

  return {
    mealIds: possibleState.mealIds,
    currentIndex,
  }
}

function readSavedNavigationState(
  mealId: string,
): MealNavigationState | null {
  try {
    const savedValue = sessionStorage.getItem(NAVIGATION_STORAGE_KEY)

    if (!savedValue) {
      return null
    }

    return getNavigationStateForMeal(JSON.parse(savedValue), mealId)
  } catch {
    return null
  }
}

function saveNavigationState(state: MealNavigationState) {
  sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(state))
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
  const [fallbackNavigationState, setFallbackNavigationState] =
    useState<MealNavigationState | null>(null)

  const routeNavigationState = id
    ? getNavigationStateForMeal(location.state, id)
    : null
  const savedNavigationState = id
    ? readSavedNavigationState(id)
    : null
  const matchingFallbackState = id
    ? getNavigationStateForMeal(fallbackNavigationState, id)
    : null
  const navigationState =
    routeNavigationState ?? matchingFallbackState ?? savedNavigationState
  const mealIds = navigationState?.mealIds ?? []
  const currentIndex = navigationState?.currentIndex ?? -1
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < mealIds.length - 1

  useEffect(() => {
    if (!id) {
      return
    }

    const mealId = id
    const navigationFromRoute = getNavigationStateForMeal(
      location.state,
      mealId,
    )

    if (navigationFromRoute) {
      saveNavigationState(navigationFromRoute)
      return
    }

    if (readSavedNavigationState(mealId)) {
      return
    }

    let ignoreResult = false

    async function loadDefaultNavigationState() {
      try {
        const returnedMeals = await searchMeals('')
        const defaultState = getNavigationStateForMeal(
          {
            mealIds: returnedMeals.map((returnedMeal) => returnedMeal.idMeal),
            currentIndex: 0,
          },
          mealId,
        )

        if (!ignoreResult && defaultState) {
          setFallbackNavigationState(defaultState)
          saveNavigationState(defaultState)
        }
      } catch {
        // The meal detail can still render if fallback navigation cannot load.
      }
    }

    void loadDefaultNavigationState()

    return () => {
      ignoreResult = true
    }
  }, [id, location.state])

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
    <section className="page detail-page">
      <div className="page-heading">
        <h1>Meal Details</h1>
      </div>

      {!id && (
        <p className="status-message error-message" role="alert">
          No meal ID was provided.
        </p>
      )}
      {isLoading && <p className="status-message">Loading meal...</p>}
      {error && (
        <p className="status-message error-message" role="alert">
          {error}
        </p>
      )}
      {isNotFound && <p className="status-message">Meal not found.</p>}

      {!isLoading && !error && meal && (
        <article className="detail-card">
          <div className="detail-layout">
            <img
              className="detail-image"
              src={meal.strMealThumb}
              alt={meal.strMeal}
            />

            <div className="detail-content">
              <h2>{meal.strMeal}</h2>
              <div className="detail-meta">
                <p><strong>Category:</strong> {meal.strCategory}</p>
                <p><strong>Cuisine:</strong> {meal.strArea}</p>
              </div>

              <h3>Ingredients</h3>
              {ingredients.length > 0 ? (
                <ul className="ingredient-list">
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
            </div>
          </div>

          <div className="instructions-section">
            <h3>Instructions</h3>
            <p>{meal.strInstructions}</p>
          </div>
        </article>
      )}

      <div className="detail-navigation">
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
    </section>
  )
}

export default Detailed
