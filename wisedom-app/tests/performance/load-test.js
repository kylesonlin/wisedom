import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const contactCreationTrend = new Trend('contact_creation_time');
const contactListTrend = new Trend('contact_list_time');
const searchTrend = new Trend('search_time');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    errors: ['rate<0.1'],           // Error rate should be less than 10%
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

// Test data
const testContact = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${__VU}@example.com`,
  phone: '+1234567890',
  company: 'Test Company',
  position: 'Test Position',
};

// Helper function to get auth token
function getAuthToken() {
  const loginRes = http.post('https://your-domain.com/api/auth/login', {
    email: 'test@example.com',
    password: 'testpassword',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  return loginRes.json('token');
}

// Main test function
export default function() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test contact creation
  const createStart = new Date();
  const createRes = http.post(
    'https://your-domain.com/api/contacts',
    JSON.stringify(testContact),
    { headers }
  );
  contactCreationTrend.add(new Date() - createStart);
  
  check(createRes, {
    'contact creation successful': (r) => r.status === 201,
  });
  errorRate.add(createRes.status !== 201);

  // Test contact listing
  const listStart = new Date();
  const listRes = http.get('https://your-domain.com/api/contacts', { headers });
  contactListTrend.add(new Date() - listStart);
  
  check(listRes, {
    'contact list successful': (r) => r.status === 200,
    'contact list has items': (r) => r.json().length > 0,
  });
  errorRate.add(listRes.status !== 200);

  // Test contact search
  const searchStart = new Date();
  const searchRes = http.get(
    'https://your-domain.com/api/contacts/search?q=test',
    { headers }
  );
  searchTrend.add(new Date() - searchStart);
  
  check(searchRes, {
    'search successful': (r) => r.status === 200,
  });
  errorRate.add(searchRes.status !== 200);

  sleep(1);
} 