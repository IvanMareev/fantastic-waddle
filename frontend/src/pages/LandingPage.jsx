import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-pill">AI-подготовка к техническим собеседованиям</span>
          <h1>Пройдите интервью в голосовом формате и получите разбор ответа за секунды.</h1>
          <p className="hero-text">
            Выбирайте темы, отвечайте как на реальном интервью и получайте понятную аналитику, чтобы расти без репетиторов.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button hero-button">Начать подготовку</Link>
            <Link to="/login" className="secondary-button hero-button">Войти в систему</Link>
          </div>

          <div className="hero-features">
            <div className="hero-feature">
              <div className="feature-dot" />
              <div>
                <h4>Голосовые ответы</h4>
                <p>Практикуйтесь так же, как на реальном собеседовании.</p>
              </div>
            </div>
            <div className="hero-feature">
              <div className="feature-dot" />
              <div>
                <h4>Моментальная проверка</h4>
                <p>Результат приходит сразу после ответа.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-surface" />
          <div className="visual-card question-card">
            <div className="visual-chip">Вопрос</div>
            <h3>Расскажите, как работает Geddes-алгоритм?</h3>
            <p>Ответьте вслух и получите анализ по критериям.</p>
          </div>
          <div className="visual-card analysis-card">
            <div className="analysis-header">
              <span>AI-анализ</span>
              <strong>8.4</strong>
            </div>
            <div className="score-ring" />
            <div className="mini-bars">
              <div><span>Логика</span><strong>9.2</strong></div>
              <div><span>Аргументация</span><strong>8.1</strong></div>
              <div><span>Формат</span><strong>7.6</strong></div>
            </div>
          </div>
          <div className="visual-card voice-card">
            <div className="voice-label">Голосовой режим</div>
            <div className="voice-wave" />
          </div>
        </div>
      </section>

      <section className="landing-section landing-process">
        <div className="section-header">
          <span>Процесс</span>
          <h2>Как проходит тренировка</h2>
        </div>
        <div className="process-grid">
          {[
            { title: 'Выбор тем', caption: 'Junior → Middle → интервью на грейд', accent: '01' },
            { title: 'Интервью', caption: 'Голосовой режим в реальном времени', accent: '02' },
            { title: 'Ответ', caption: 'Говорите, как на настоящем собеседовании', accent: '03' },
            { title: 'Анализ', caption: 'Сравнение ответа с лучшими практиками', accent: '04' },
            { title: 'Рекомендации', caption: 'Учитесь на сильных и слабых местах', accent: '05' },
          ].map((step) => (
            <div key={step.title} className="process-step">
              <div className="process-badge">{step.accent}</div>
              <h3>{step.title}</h3>
              <p>{step.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-analytics">
        <div className="analytics-copy">
          <span>Результат</span>
          <h2>Понятный отчёт, который показывает, что улучшить дальше.</h2>
          <p>Увидьте общий балл, развернутый разброс по критериям и рекомендации для следующего ответа.</p>
        </div>
        <div className="analytics-panel">
          <div className="analytics-score-card">
            <div className="score-label">Общий балл</div>
            <div className="score-value">8.4</div>
            <div className="score-note">Высокий уровень понимания и структуры.</div>
          </div>
          <div className="analytics-bars">
            {[
              { label: 'Структура', value: 92, color: '#4f46e5' },
              { label: 'Аргументы', value: 82, color: '#0ea5e9' },
              { label: 'Точность', value: 76, color: '#10b981' },
            ].map((item) => (
              <div key={item.label} className="analytics-bar">
                <div className="bar-head">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${item.value}%`, background: item.color }} /></div>
              </div>
            ))}
          </div>
          <div className="analytics-lists">
            <div className="analytics-list card">
              <h3>Сильные стороны</h3>
              <ul>
                <li>Чёткий план ответа</li>
                <li>Уверенная аргументация</li>
              </ul>
            </div>
            <div className="analytics-list card subdued">
              <h3>Рекомендации</h3>
              <ul>
                <li>Добавьте примеры на практике</li>
                <li>Сократите вводную часть</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-audience">
        <div className="section-header">
          <span>Для кого</span>
          <h2>Подходит тем, кто готов расти быстрее.</h2>
        </div>
        <div className="audience-grid">
          {['Junior-разработчики', 'Middle-разработчики', 'Студенты', 'Меняющие роль', 'Готовящиеся к грейду'].map((item) => (
            <div key={item} className="audience-card">{item}</div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-cta">
        <div className="cta-card">
          <span>Начните прямо сейчас</span>
          <h2>Пройдите первое AI-интервью и получите полный анализ своих ответов.</h2>
          <div className="hero-actions">
            <Link to="/register" className="primary-button hero-button">Попробовать бесплатно</Link>
            <Link to="/login" className="secondary-button hero-button">Войти</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
