type ApiConfig = {
  API_URL: string;
  WEB_URL: string;
};

type UrlConfig = {
  baseUrl: string;
};

const isDevelopment = true;
console.log(location.hostname,"location")
const check = location.hostname === "localhost" ? "http://localhost:5555" : "/api"
console.log(check,"check")
console.log(location.hostname,"hostname")

export const api: ApiConfig = {
  API_URL:  location.hostname === "localhost" ? "http://localhost:5555" : "/api" ,
  WEB_URL: `http://3.105.82.55/api`
};



export const url: UrlConfig = {
  baseUrl: "/",
};

export const config = {
  api,
  url,
};
