import axios from 'axios'

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export interface Meal {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strMealThumb: string
}

interface SearchMealsResponse {
  meals: Meal[] | null
}

export async function searchMeals(query: string): Promise<Meal[]> {
  const response = await axios.get<SearchMealsResponse>(
    `${BASE_URL}/search.php`,
    { params: { s: query } },
  )

  return response.data.meals ?? []
}
