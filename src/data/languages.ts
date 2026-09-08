
export type Language = {
  name: string;
  code: string;
};

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

export const languages: Language[] = [];

export async function fetchLanguages(): Promise<Language[]> {
  try {
    const response = await fetch(`${API_URL}/languages`);

    if (!response.ok) {
      throw new Error("Failed to fetch languages");
    }

    const data = await response.json();

    return data.languages ?? [];
  } catch (error) {
    console.error("Language fetch error:", error);
    return [];
  }
}

