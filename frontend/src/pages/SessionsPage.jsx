import { useEffect, useState } from 'react';
import { fetchSessions } from '../api.js';

export default function SessionsPage({onSessionContinue}) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions()
            .then((response) => {
                setSessions(response.data || []);
            })
            .finally(() => {
                setLoading(false);
            });
        console.log(sessions)
    }, []);

    const translateStatus = (status) => {
        const map = {
            in_progress: 'В процессе',
            completed: 'Завершена',
            failed: 'Ошибка',
        };

        return map[status] || status;
    };

    if (loading) {
        return (
            <div className="card form-block">
                <h2 className="section-title">Мои сессии</h2>
                <div className="message">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="card form-block">
            <h2 className="section-title">Мои сессии</h2>

            {!sessions.length ? (
                <div className="message">
                    У вас пока нет сессий.
                </div>
            ) : (
                <div className="card-grid">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="card"
                            style={{ padding: 16 }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <strong>Сессия #{session.id}</strong>

                                <span className="badge">
                                    {translateStatus(session.status)}
                                </span>
                            </div>

                            <div className="message">
                                Начата:{' '}
                                {new Date(
                                    session.started_at
                                ).toLocaleString()}
                            </div>

                            <div className="message">
                                Отвечено вопросов:{' '}
                                {session.answered_questions}
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <strong>Вопросы:</strong>

                                <ul style={{ marginTop: 8 }}>
                                    {session.session_questions?.map((q) => (
                                        <li key={q.id}>
                                            {q.question.question_text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => onSessionContinue(session)}>Продолжить интервью</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
