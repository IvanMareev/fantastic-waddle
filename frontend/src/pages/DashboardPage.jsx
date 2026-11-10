export default function DashboardPage({ user }) {
  const stats = [
    { label: 'Интервью пройдено', value: '24', description: 'Последнее — 2 часа назад' },
    { label: 'Коэффициент правильности', value: '87%', description: 'Средний результат за месяц' },
    { label: 'Средний балл', value: '8.9', description: 'Лучший ответ за неделю' },
    { label: 'Улучшение', value: '+14%', description: 'Рост за последние 4 сессии' },
  ];

  return (
    <main className="page">
      <section className="dashboard-hero card">
        <div className="dashboard-hero__text">
          <h1 className="page-title">Добро пожаловать, {user?.name || 'пользователь'}!</h1>
          <p className="page-subtitle">
            Здесь отображается ваша текущая статистика подготовки и последние результаты интервью.
          </p>
        </div>
        <span className="badge badge--accent">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          Активно
        </span>
      </section>

      <section className="grid grid--stats">
        {stats.map((item) => (
          <article key={item.label} className="stat-card card card--hover">
            <p className="stat-card__label">{item.label}</p>
            <h3 className="stat-card__value">{item.value}</h3>
            <p className="stat-card__note">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="page-header">
          <h2 style={{ margin: 0, fontSize: 20 }}>Последний прогресс</h2>
          <p className="page-subtitle" style={{ fontSize: 14 }}>Обновлено недавно</p>
        </div>
        <div className="overview-grid" style={{ marginTop: 18 }}>
          <div className="overview-item">
            <p className="overview-item__title">Последняя сессия</p>
            <p className="overview-item__value">Тема: Архитектура приложений</p>
          </div>
          <div className="overview-item">
            <p className="overview-item__title">Результат</p>
            <p className="overview-item__value">8.6 / 10</p>
          </div>
          <div className="overview-item">
            <p className="overview-item__title">Рекомендация</p>
            <p className="overview-item__value">Уточняйте примеры и структуру ответа.</p>
          </div>
        </div>
      </section>
    </main>
  );
}