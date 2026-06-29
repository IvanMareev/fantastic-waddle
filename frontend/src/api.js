const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const TOKEN_KEY = 'fantastic_waddle_token';

const MOCK_USER = {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
};

const MOCK_TOPICS = [
    { id: 1, title: 'Публичные выступления' },
    { id: 2, title: 'Техническое интервью' },
    { id: 3, title: 'Клиентские кейсы' },
];

const MOCK_QUESTIONS = {
    1: [
        { id: 11, question_text: 'Расскажите о самом сложном выступлении.', expected_answer: 'Опишите задачу, подготовку и результат.' },
        { id: 12, question_text: 'Как вы справляетесь со страхом сцены?', expected_answer: 'Приведите конкретные практики.' },
        { id: 13, question_text: 'Какие приемы удерживают внимание аудитории?', expected_answer: 'Опишите структуру и визуальные метрики.' },
    ],
    2: [
        { id: 21, question_text: 'Опишите опыт работы с REST API.', expected_answer: 'Укажите стек, примеры и сложные случаи.' },
        { id: 22, question_text: 'Как вы тестируете свой код?', expected_answer: 'Назовите подходы и инструменты.' },
        { id: 23, question_text: 'Как вы решаете проблему deadlock?', expected_answer: 'Опишите диагностику и предотвращение.' },
    ],
    3: [
        { id: 31, question_text: 'Как вы строите презентацию для заказчика?', expected_answer: 'Расскажите про цели, структуру и ключевые метрики.' },
        { id: 32, question_text: 'Как вы работаете с обратной связью?', expected_answer: 'Опишите процесс сбора и адаптации решения.' },
        { id: 33, question_text: 'Как оцениваете успех проекта?', expected_answer: 'Назовите критерии и примеры из практики.' },
    ],
};

let mockSessionId = 1000;
const mockSessions = new Map();

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function parseJsonBody(body) {
    if (!body) {
        return {};
    }
    if (body instanceof FormData) {
        const result = {};
        body.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch {
            return {};
        }
    }

    return body;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function createSession(questionIds) {
    mockSessionId += 1;
    const sessionId = mockSessionId;
    const sessionQuestions = questionIds.map((questionId, index) => {
        const allQuestions = Object.values(MOCK_QUESTIONS).flat();
        const question = allQuestions.find((q) => q.id === questionId);
        return {
            id: sessionId * 100 + index + 1,
            question: question || { id: questionId, question_text: 'Вопрос не найден', expected_answer: '' },
            status: 'pending',
            user_answers: [],
        };
    });

    const sessionData = {
        id: sessionId,
        status: 'pending',
        session_questions: sessionQuestions,
    };

    mockSessions.set(sessionId.toString(), sessionData);
    return sessionData;
}

function createMockResult(sessionQuestionId) {
    const explanation = JSON.stringify({
        summary_score: 8,
        criteria: {
            Ясность: { score: 8 },
            Структура: { score: 7 },
            Актуальность: { score: 9 },
        },
        final_comment: 'Ответ понятен и структурирован, добавьте больше конкретных примеров.',
    });

    return {
        session_question_id: Number(sessionQuestionId),
        status: 'completed',
        score: 8,
        ai_explanation: explanation,
        message: 'Ответ успешно обработан.',
    };
}

async function mockRequest(path, options = {}) {
    await delay(120);
    const token = getToken();
    const body = parseJsonBody(options.body);

    if (path === '/login' && options.method === 'POST') {
        setToken('mock-token');
        return { access_token: 'mock-token', token_type: 'bearer' };
    }

    if (path === '/register' && options.method === 'POST') {
        setToken('mock-token');
        return { token: 'mock-token', user: MOCK_USER };
    }

    if (path === '/me') {
        if (!token) {
            const error = new Error('Unauthorized');
            error.status = 401;
            error.payload = { message: 'Пользователь не авторизован.' };
            throw error;
        }
        return MOCK_USER;
    }

    if (path === '/logout' && options.method === 'POST') {
        clearToken();
        return { message: 'Выход выполнен.' };
    }

    if (path === '/topics') {
        return MOCK_TOPICS;
    }

    if (path.startsWith('/question/topic/')) {
        const topicId = Number(path.split('/').pop());
        return { data: MOCK_QUESTIONS[topicId] || [] };
    }

    if (path === '/interview/start' && options.method === 'POST') {
        const questionIds = Array.isArray(body.question_ids) ? body.question_ids : [];
        return { data: createSession(questionIds) };
    }

    if (path.startsWith('/interview/') && path.endsWith('/answer') && options.method === 'POST') {
        if (!token) {
            const error = new Error('Unauthorized');
            error.status = 401;
            error.payload = { message: 'Требуется авторизация для загрузки ответа.' };
            throw error;
        }
        return {
            status: 'uploaded',
            message: 'Аудиофайл принят. Ожидайте обработки.',
            data: {
                session_question_id: Number(body.session_question_id),
                status: 'uploaded',
            },
        };
    }

    if (path.startsWith('/interview/') && path.includes('/cur_answer')) {
        const sessionId = Number(path.split('/')[2]);
        const params = new URLSearchParams(path.split('?')[1] || '');
        const sessionQuestionId = params.get('session_question_id');

        const sessionData = mockSessions.get(sessionId.toString());
        if (!sessionData) {
            const error = new Error('Session not found');
            error.status = 404;
            error.payload = { message: 'Сессия не найдена.' };
            throw error;
        }

        const resultData = createMockResult(sessionQuestionId);
        const sessionQuestion = sessionData.session_questions.find((item) => item.id === Number(sessionQuestionId));

        if (sessionQuestion) {
            sessionQuestion.user_answers = [resultData];
            sessionQuestion.status = 'completed';
        }

        return {
            status: 'completed',
            message: 'Ответ обработан.',
            data: resultData,
        };
    }

    const error = new Error('Неизвестный мок-эндпоинт');
    error.status = 404;
    error.payload = { message: `Мок для ${path} не настроен.` };
    throw error;
}

async function request(path, options = {}) {
    if (USE_MOCKS) {
        return mockRequest(path, options);
    }

    const headers = options.headers || {};
    const token = getToken();

    if (options.method !== 'GET' && !(options.body instanceof FormData)) {
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
        console.log(response)
        const payload = await response.json().catch(() => ({}));
        const error = new Error(payload.message || response.statusText || 'Network error');
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    console.log(response)

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
    } else {
        console.log(data)
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
    return request(`/interview/${sessionId}/cur_answer?session_question_id=${sessionQuestionId}`, {
        method: 'GET',
    });
}


export async function fetchSessions() {
    return request(`/me/sessions?page=1&status=in_progress`)
}

export async function  fetchCurrentQuestion(sessionId) {
    return request(`session/${sessionId}/current_question`)
}
export { clearToken };

