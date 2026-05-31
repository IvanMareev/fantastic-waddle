export default function DashboardPage({ user }) {
  return (
    <div className="card form-block">
      <h2 className="section-title">Добро пожаловать, {user?.name || 'пользователь'}!</h2>
      <p className="message">Используйте раздел "Темы и вопросы" для просмотра доступных вопросов и запуска интервью-сессий.</p>
      <div className="card-grid" style={{ marginTop: '20px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <h3>Профиль</h3>
          <p>Email: {user?.email}</p>
          <p>Имя: {user?.name}</p>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <h3>Работа с API</h3>
          <p>Вы можете выбрать тему, собрать набор вопросов и начать новую интервью-сессию.</p>
        </div>
      </div>
    </div>
  );
}
