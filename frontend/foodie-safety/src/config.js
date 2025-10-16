
const config = {
  
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'http://foodiesafety.duckdns.org:8000' 
    : 'http://localhost:8000',
};

export default config;
