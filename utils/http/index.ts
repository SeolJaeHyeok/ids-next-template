import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { stringify } from 'qs';

import NProgress from '../n-progress';

const API_BASE_URL = 'https://api.example.com';
const token = 'example-token';

const defaultConfig: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        Authorization: `Bearer ${token}`,
    },
    paramsSerializer: {
        serialize: (params: any) => {
            return stringify(params, { arrayFormat: 'repeat' });
        },
    },
};
class HttpClient {
    private static readonly instance: HttpClient = new HttpClient();
    private readonly axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create(defaultConfig);

        this.httpInterceptorsRequest();
        this.httpInterceptorsResponse();
    }

    private httpInterceptorsRequest(): void {
        this.axiosInstance.interceptors.request.use(
            this.handleRequestSuccess,
            this.handleRequestError,
        );
    }

    private httpInterceptorsResponse(): void {
        this.axiosInstance.interceptors.response.use(
            this.handleResponseSuccess,
            this.handleResponseError,
        );
    }

    public createConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
        return {
            ...defaultConfig,
            ...config,
            headers: {
                ...defaultConfig.headers,
                ...(config && config.headers), // Overwrite default headers with dynamic headers
            },
        };
    }

    private handleRequestSuccess(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        NProgress.start();

        return config;
    }

    private handleRequestError(error: any): Promise<any> {
        return Promise.reject(error);
    }

    private handleResponseSuccess(response: AxiosResponse): AxiosResponse {
        NProgress.done();
        return response;
    }

    private handleResponseError(error: any): Promise<any> {
        NProgress.done();

        return Promise.reject(error);
    }

    public static getInstance(): HttpClient {
        return HttpClient.instance;
    }

    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const mergedConfig = this.createConfig(config);
            const response: AxiosResponse<T> = await this.axiosInstance.request<T>(mergedConfig);
            return response.data;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    public async get<T, P>(url: string, params?: P): Promise<T> {
        return this.request<T>({ method: 'get', url, params });
    }

    public async post<T, P>(
        url: string,
        data?: P,
        config?: Partial<AxiosRequestConfig>,
    ): Promise<T> {
        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            url,
            data,
            ...config,
        };
        return this.request<T>(requestConfig);
    }

    public async delete<T>(url: string): Promise<T> {
        return this.request<T>({ method: 'delete', url });
    }

    public async patch<T, P>(url: string, data?: P): Promise<T> {
        return this.request<T>({ method: 'patch', url, data });
    }

    public async put<T, P>(url: string, data?: P): Promise<T> {
        return this.request<T>({ method: 'put', url, data });
    }
}

export const httpClient = HttpClient.getInstance();
