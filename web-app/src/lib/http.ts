export async function sendGetRequest(
  url: string
): Promise<Record<string, unknown>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(HTTP error! Status: ${response.status});
  }
  const data = await response.json();
  return data;
}