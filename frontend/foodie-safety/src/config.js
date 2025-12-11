
const config = {
  
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://foodiesafety.duckdns.org/api' 
    : 'http://localhost:8000',
};

export default config;
