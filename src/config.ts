type ApiConfig = {
  API_URL: string;
  WEB_URL: string;
};

type UrlConfig = {
  baseUrl: string;
};

const isDevelopment = true;

export const api: ApiConfig = {
  API_URL:  `/api` ,
  WEB_URL: `/api`
};



export const url: UrlConfig = {
  baseUrl: "/",
};

export const config = {
  api,
  url,
};
