export default function InfoCard({ total, avgSeconds = 30, onStart }) {
  return (
    <div className="info-card card">
      <h3>Подготовка к интервью</h3>
      <p>Интервью состоит из <strong>{total}</strong> вопросов.</p>
      <p>Для каждого вопроса достаточно ответа около <strong>{avgSeconds} секунд</strong>. Старайтесь отвечать кратко и по существу.</p>
      <p className="muted">Вы сможете прослушать и отправить ответ после записи. Удачи!</p>
      <div style={{ marginTop: '12px' }}>
        <button className="primary-button" onClick={onStart}>Начать интервью</button>
      </div>
    </div>
  );
}
