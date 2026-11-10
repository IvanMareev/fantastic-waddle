import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="container hero">
        <div className="hero__copy">
          <span className="hero__pill">
            <span className="hero__pill-dot" />
            AI-подготовка к собеседованиям
          </span>
          <h1 className="hero__title">Голосовое интервью и разбор ответа за секунды.</h1>
          <p className="hero__text">
            Выбирайте темы, отвечайте как на настоящем собеседовании и получайте понятный
            анализ своих ответов — чтобы расти без репетиторов.
          </p>

          <div className="hero__actions">
            <Link to="/register" className="btn btn--primary btn--lg">Начать подготовку</Link>
            <Link to="/login" className="btn btn--secondary btn--lg">Войти в систему</Link>
          </div>

          <div className="hero-features">
            <div className="hero-feature">
              <span className="hero-feature__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </span>
              <div className="hero-feature__text">
                <h4>Голосовые ответы</h4>
                <p>Практикуйтесь так же, как на реальном собеседовании.</p>
              </div>
            </div>
            <div className="hero-feature">
              <span className="hero-feature__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <div className="hero-feature__text">
                <h4>Моментальная проверка</h4>
                <p>Результат появляется сразу после ответа.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden>
          <div className="hero-visual__surface" />

          <div className="hero-card hero-card--question">
            <span className="hero-card__chip">Вопрос</span>
            <h3>Расскажите, как вы организуете работу с кодом команды?</h3>
            <p className="hero-card__text">Ответьте вслух — дальше разберём ответ по критериям.</p>
          </div>

          <div className="hero-card hero-card--analysis">
            <span className="hero-card__chip">AI-разбор</span>
            <h3 style={{ marginTop: 12 }}>Общий балл&nbsp;·&nbsp;8.4/10</h3>
            <div className="analysis-bar">
              <div className="analysis-bar__row">
                <span className="analysis-bar__label">Логика</span>
                <span className="analysis-bar__track"><span className="analysis-bar__fill" style={{ width: '90%' }} /></span>
                <span className="analysis-bar__value">9.0</span>
              </div>
              <div className="analysis-bar__row">
                <span className="analysis-bar__label">Аргументы</span>
                <span className="analysis-bar__track"><span className="analysis-bar__fill" style={{ width: '78%' }} /></span>
                <span className="analysis-bar__value">7.8</span>
              </div>
              <div className="analysis-bar__row">
                <span className="analysis-bar__label">Формат</span>
                <span className="analysis-bar__track"><span className="analysis-bar__fill" style={{ width: '72%' }} /></span>
                <span className="analysis-bar__value">7.2</span>
              </div>
            </div>
          </div>

          <div className="hero-card hero-card--voice">
            <span className="hero-card__chip">Голосовой режим</span>
            <div className="equalizer">
              <span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <span className="section__eyebrow">Процесс</span>
          <h2 className="section__title">Как проходит тренировка</h2>
        </div>
        <div className="process-grid">
          {[
            { num: '01', title: 'Выбор тем', caption: 'От junior до senior-уровня' },
            { num: '02', title: 'Интервью', caption: 'Вопросы задаёт голосовой режим' },
            { num: '03', title: 'Ваш ответ', caption: 'Говорите, как на настоящем собеседовании' },
            { num: '04', title: 'Анализ', caption: 'Сравнение с лучшими практиками' },
            { num: '05', title: 'Рекомендации', caption: 'Растите на сильных и слабых местах' },
          ].map((step) => (
            <div key={step.num} className="process-step">
              <span className="process-step__num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <span className="section__eyebrow">Результат</span>
          <h2 className="section__title">Понятный отчёт о том, что улучшить дальше.</h2>
          <p className="section__text">
            Общий балл, разбивка по критериям и конкретные рекомендации для следующего ответа.
          </p>
        </div>
        <div className="grid grid--2">
          {[
            { label: 'Чёткий план ответа', note: 'Структура и логика на высоком уровне.' },
            { label: 'Уверенная аргументация', note: 'Примеры подкрепляют основные тезисы.' },
          ].map((item) => (
            <div key={item.label} className="card">
              <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>{item.label}</h3>
              <p className="page-subtitle" style={{ margin: 0 }}>{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <span className="section__eyebrow">Для кого</span>
          <h2 className="section__title">Подходит тем, кто готов расти быстрее.</h2>
        </div>
        <div className="audience-grid">
          {['Junior-разработчики', 'Middle-разработчики', 'Студенты', 'Меняющие роль', 'Готовящиеся к грейду'].map((item) => (
            <span key={item} className="chip">{item}</span>
          ))}
        </div>
      </section>

      <section className="container section cta">
        <div className="cta__card">
          <span className="hero__pill">
            <span className="hero__pill-dot" />
            Начните прямо сейчас
          </span>
          <h2 className="cta__title">Пройдите первое AI-интервью и получите полный разбор ответов.</h2>
          <div className="cta__actions">
            <Link to="/register" className="btn btn--primary btn--lg">Попробовать бесплатно</Link>
            <Link to="/login" className="btn btn--secondary btn--lg">Войти</Link>
          </div>
        </div>
      </section>
    </main>
  );
}