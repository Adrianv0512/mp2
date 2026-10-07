import axios from 'axios'

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export type IngredientNumber =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20

export type IngredientKey = `strIngredient${IngredientNumber}`
export type MeasureKey = `strMeasure${IngredientNumber}`

interface MealDetails {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strMealThumb: string
  strInstructions: string
}

export type Meal = MealDetails &
  Record<IngredientKey | MeasureKey, string | null>

export interface MealCategory {
  strCategory: string
}

export interface GalleryMeal {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

interface SearchMealsResponse {
  meals: Meal[] | null
}

interface MealLookupResponse {
  meals: Meal[] | null
}

interface MealCategoriesResponse {
  meals: MealCategory[] | null
}

interface MealsByCategoryResponse {
  meals: GalleryMeal[] | null
}

export async function searchMeals(query: string): Promise<Meal[]> {
  const response = await axios.get<SearchMealsResponse>(
    `${BASE_URL}/search.php`,
    { params: { s: query } },
  )

  return response.data.meals ?? []
}

export async function getMealById(id: string): Promise<Meal | null> {
  const response = await axios.get<MealLookupResponse>(
    `${BASE_URL}/lookup.php`,
    { params: { i: id } },
  )

  return response.data.meals?.[0] ?? null
}

export async function fetchMealCategories(): Promise<MealCategory[]> {
  const response = await axios.get<MealCategoriesResponse>(
    `${BASE_URL}/list.php`,
    { params: { c: 'list' } },
  )

  return response.data.meals ?? []
}

export async function fetchMealsByCategory(
  category: string,
): Promise<GalleryMeal[]> {
  const response = await axios.get<MealsByCategoryResponse>(
    `${BASE_URL}/filter.php`,
    { params: { c: category } },
  )

  return response.data.meals ?? []
}
