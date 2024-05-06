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

export const sendPutRequest = async (url: string, body?: object): Promise<void> => {
  try {
    const response = await fetch("http://localhost:3030" + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('There was an error with the fetch operation:', error);
    throw error;
  }
};