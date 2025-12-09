
const config = {
  
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'http://3.18.108.177:8000' || 'http://foodiesafety.duckdns.org:8000' 
    : 'http://localhost:8000',
};

export default config;
