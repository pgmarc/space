import axios from "@/lib/axios";

export async function getUsers(apiKey: string): Promise<Array<{ username: string; apiKey: string; role: 'ADMIN' | 'MANAGER' | 'EVALUATOR' }>> {
  return axios
    .get('/users', {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw new Error(
        'Failed to fetch users. ' + (error.response?.data?.error || error.message)
      );
    });
}