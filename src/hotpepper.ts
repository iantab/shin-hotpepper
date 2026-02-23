const API_KEY = import.meta.env.VITE_HOT_PEPPER_KEY as string;
const BASE_URL = "/api/hotpepper/";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  station_name: string;
  genre: { code: string; name: string };
  budget: { average: string };
  access: string;
  mobile_access: string;
  urls: { pc: string };
  photo: { mobile: { l: string } };
  catch: string;
}

export interface HotPepperResponse {
  results: {
    api_version: string;
    results_available: number;
    results_returned: string;
    results_start: number;
    shop?: Restaurant[];
    error?: { code: number; message: string }[];
  };
}

export interface SearchParams {
  keyword?: string;
  large_area?: string;
  count?: number;
  start?: number;
}

export async function searchRestaurants(
  params: SearchParams,
): Promise<HotPepperResponse> {
  const query = new URLSearchParams({
    key: API_KEY,
    format: "json",
    count: String(params.count ?? 10),
    start: String(params.start ?? 1),
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.large_area && { large_area: params.large_area }),
  });

  const res = await fetch(`${BASE_URL}?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  return res.json() as Promise<HotPepperResponse>;
}
