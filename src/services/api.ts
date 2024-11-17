
import { API_KEY } from '@env';
import { BookDetails } from '../../App';

export const fetchBookDetails = async (isbn: string): Promise<BookDetails> => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`);

    if (!response.ok) {
      const errorMessage = `Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data?.items) {
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }

  };
  