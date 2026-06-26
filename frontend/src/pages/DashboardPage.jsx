export default function DashboardPage({ user }) {
  const stats = [
    { label: 'Интервью пройдено', value: '24', description: 'Последнее — 2 часа назад' },
    { label: 'Коэффициент правильности', value: '87%', description: 'Средний результат за месяц' },
    { label: 'Средний балл', value: '8.9', description: 'Лучший ответ за неделю' },
    { label: 'Улучшение', value: '+14%', description: 'Рост за последние 4 сессии' },
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero card form-block">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h2 className="section-title">Добро пожаловать, {user?.name || 'пользователь'}!</h2>
          <p className="dashboard-message">Здесь отображается ваша текущая статистика подготовки и последние результаты интервью.</p>
        </div>
        <div className="profile-chip">
          <span>Активно</span>
          <strong>{user?.email || 'example@mail.com'}</strong>
        </div>
      </section>

      <section className="dashboard-stats card-grid">
        {stats.map((item) => (
          <article key={item.label} className="dashboard-stat-card card">
            <p className="stat-label">{item.label}</p>
            <h3 className="stat-value">{item.value}</h3>
            <p className="stat-note">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-overview card form-block">
        <div className="overview-header">
          <h3>Последний прогресс</h3>
          <span>Обновлено недавно</span>
        </div>
        <div className="overview-grid">
          <div>
            <p className="overview-title">Последняя сессия</p>
            <p className="overview-value">Тема: Архитектура приложений</p>
          </div>
          <div>
            <p className="overview-title">Результат</p>
            <p className="overview-value">8.6 / 10</p>
          </div>
          <div>
            <p className="overview-title">Рекомендация</p>
            <p className="overview-value">Уточняйте примеры и структуру ответа.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
