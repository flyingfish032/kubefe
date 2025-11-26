// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:2020/back2/api', // Change this if your backend URL is different
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;

