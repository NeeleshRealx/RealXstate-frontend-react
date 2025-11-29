type ApiConfig = {
  API_URL: string;
  WEB_URL: string;
};

type UrlConfig = {
  baseUrl: string;
};

const isDevelopment = true;
console.log(location.hostname,"location")
export const api: ApiConfig = {
  API_URL:  location.hostname === "localhost" ? "http://localhost:5555" : "http://3.105.82.55/api" ,
  WEB_URL: `http://3.105.82.55/api`
};



export const url: UrlConfig = {
  baseUrl: "/",
};

export const config = {
  api,
  url,
};
