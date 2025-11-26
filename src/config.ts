type ApiConfig = {
  API_URL: string;
  WEB_URL: string;
};

type UrlConfig = {
  baseUrl: string;
};

const isDevelopment = true;

export const api: ApiConfig = {
  API_URL:  `http://localhost:5555` ,
  WEB_URL: `http://localhost:5555`
};



export const url: UrlConfig = {
  baseUrl: "/",
};

export const config = {
  api,
  url,
};
