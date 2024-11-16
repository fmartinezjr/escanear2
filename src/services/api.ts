
import { API_KEY } from '@env';


export const fetchBookDetails = async (isbn: string) => {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`);
    return await response.json();
  };
  