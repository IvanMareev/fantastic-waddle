const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'fantastic_waddle_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || response.statusText || 'Network error');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return response.json().catch(() => ({}));
}

export async function login(email, password) {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.access_token) {
    setToken(data.access_token);
  }

  return data;
}

export async function register(name, email, password) {
  const data = await request('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (data.token) {
    setToken(data.token);
  }

  return data;
}



export async function me() {
  const data = await request('/me');
  return data;
}

export async function logout() {
  await request('/logout', { method: 'POST' });
  clearToken();
}

export async function fetchTopics() {
  return request('/topics');
}

export async function fetchQuestionsByTopic(topicId) {
  return request(`/question/topic/${topicId}`);
}

export async function startInterviewSession(questionIds) {
  return request('/interview/start', {
    method: 'POST',
    body: JSON.stringify({ question_ids: questionIds }),
  });
}

export async function uploadAnswer(sessionId, questionId, audioFile) {
  const form = new FormData();
  form.append('audio', audioFile);
  form.append('session_question_id', questionId);

  return request(`/interview/${sessionId}/answer`, {
    method: 'POST',
    body: form,
  });
}

export async function fetchSessionAnswer(sessionId, sessionQuestionId) {
  const params = new URLSearchParams({ session_question_id: sessionQuestionId });
  return request(`/interview/session/${sessionId}/answer?${params.toString()}`);
}

export { clearToken };
