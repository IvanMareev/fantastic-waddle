import { useEffect, useState } from 'react';
import { fetchSessions } from '../api.js';
import { Link } from 'react-router-dom';

export default function SessionsPage({ onSessionContinue }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSessions()
            .then((response) => {
                setSessions(response.data || []);
            })
            .catch(() => {
                setError('Не удалось загрузить список сессий.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const translateStatus = (status) => {
        const map = {
            in_progress: 'В процессе',
            completed: 'Завершена',
            failed: 'Ошибка',
        };

        return map[status] || status;
    };

    const badgeVariant = (status) =>
        status === 'completed' ? 'badge--success'
        : status === 'failed' ? 'badge--danger'
        : 'badge--accent';

    if (loading) {
        return (
            <main className="page">
                <div className="page-header">
                    <h1 className="page-title">Начатые интервью</h1>
                    <p className="page-subtitle">Загружаем список сессий…</p>
                </div>
                <div className="grid grid--2">
                    {[1, 2].map((item) => (
                        <div key={item} className="card" style={{ height: 180, display: 'grid', placeItems: 'center' }}>
                            <div className="spinner spinner--lg" />
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1 className="page-title">Начатые интервью</h1>
                <p className="page-subtitle">Продолжите сессию, над которой уже работали.</p>
            </div>

            {error ? <div className="alert alert--error"><span className="alert__icon" aria-hidden>!</span><div>{error}</div></div> : null}

            {!sessions.length ? (
                <div className="empty">
                    <p className="empty__title">Здесь пока пусто</p>
                    <p className="empty__text">
                        У вас нет начатых интервью. Выберите темы и вопросы, чтобы создать первую сессию.
                    </p>
                    <Link to="/topics" className="btn btn--primary" style={{ marginTop: 8 }}>
                        Перейти к темам
                    </Link>
                </div>
            ) : (
                <div className="grid grid--2">
                    {sessions.map((session) => (
                        <article key={session.id} className="card session-card">
                            <div className="session-card__top">
                                <h2 className="session-card__name">Сессия #{session.id}</h2>
                                <span className={`badge ${badgeVariant(session.status)}`}>
                                    {translateStatus(session.status)}
                                </span>
                            </div>

                            <div className="session-card__meta">
                                <div>Начата: <strong>{new Date(session.started_at).toLocaleString()}</strong></div>
                                <div>Отвечено вопросов: <strong>{session.answered_questions ?? 0}</strong></div>
                            </div>

                            {session.session_questions?.length ? (
                                <div className="session-card__questions">
                                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Вопросы:</span>
                                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {session.session_questions.map((q) => (
                                            <li key={q.id}>{q.question.question_text}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            <div className="session-card__actions">
                                <button
                                    type="button"
                                    className="btn btn--primary"
                                    onClick={() => onSessionContinue(session)}
                                >
                                    Продолжить интервью
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}