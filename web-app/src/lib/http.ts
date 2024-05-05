export async function sendGetRequest(
  url: string
): Promise<Record<string, unknown>> {
  const response = await fetch("http://localhost:3030" + url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}