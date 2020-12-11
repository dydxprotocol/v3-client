import axios, { AxiosRequestConfig } from 'axios';

import {
  AxiosServerError,
  AxiosError,
} from './errors';

export async function axiosRequest(options: AxiosRequestConfig): Promise<unknown> {
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (error.isAxiosError) {
      if (error.response) {
        throw new AxiosServerError(error.response, error);
      }
      throw new AxiosError(`Axios: ${error.message}`, error);
    }
    throw error;
  }
}
