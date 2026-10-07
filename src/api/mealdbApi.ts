import axios from 'axios'

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export interface Meal {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strMealThumb: string
}

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
