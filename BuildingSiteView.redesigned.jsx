import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  FileText,
  Info,
  Megaphone,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { buildingService } from '../../service/api/buildingService';

const emptySite = {
  about: 'Добро пожаловать!',
  contacts: '',
  tariffs: '',
  announcements: ''
};

export function BuildingSiteView({ buildingId, userRole, role }) {
  const [siteData, setSiteData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptySite);
  const [loading, setLoading] = useState(true);

  const effectiveRole = userRole || role;
  const canEdit = ['admin', 'super_admin'].includes(effectiveRole);
  const content = siteData || emptySite;

  useEffect(() => {
    if (!buildingId) {
      setLoading(false);
      return;
    }

    buildingService.getBuildingSite(buildingId).then(data => {
      if (data) {
        const nextData = { ...emptySite, ...data };
        setSiteData(nextData);
        setEditForm(nextData);
      } else {
        setSiteData(emptySite);
        setEditForm(emptySite);
      }
      setLoading(false);
    });
  }, [buildingId]);

  const handleSave = async () => {
    try {
      const nextData = { ...emptySite, ...editForm };
      await buildingService.updateSiteContent(buildingId, nextData);
      setSiteData(nextData);
      setEditForm(nextData);
      setIsEditing(false);
      alert('Данные сайта успешно обновлены!');
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  };

  const summaryCards = useMemo(() => ([
    { icon: <Phone size={22} />, value: '01', label: 'Важные контакты' },
    { icon: <FileText size={22} />, value: '02', label: 'Тарифы и Услуги' },
    { icon: <Megaphone size={22} />, value: '03', label: 'Объявления ЖК' }
  ]), []);

  if (loading) {
    return (
      <div className="pksk-loading-state">
        <div className="pulse pksk-loading-dot" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pksk-home-shell"
    >
      <section className="pksk-top-hero">
        <div className="pksk-hero-orb pksk-hero-orb-one" />
        <div className="pksk-hero-orb pksk-hero-orb-two" />
        <div className="pksk-dot-pattern" />

        <div className="pksk-hero-grid">
          <div className="pksk-hero-copy">
            <div className="pksk-kicker">
              <Sparkles size={16} />
              Информационный портал вашего ЖК
            </div>

            <h2>
              {isEditing ? (
                <input
                  className="pksk-edit-input pksk-hero-input"
                  value={editForm.about || ''}
                  onChange={e => setEditForm({ ...editForm, about: e.target.value })}
                />
              ) : (
                content.about || 'Добро пожаловать!'
              )}
            </h2>

            <p className="pksk-hero-quote">
              Управляйте важной информацией дома красиво, быстро и понятно.
            </p>

            <div className="pksk-hero-note">
              <span />
              <p>Все данные портала сохранены — изменён только внешний вид главной страницы.</p>
            </div>

            <div className="pksk-hero-actions">
              {canEdit && !isEditing && (
                <button className="pksk-primary-btn" onClick={() => setIsEditing(true)}>
                  <Edit3 size={17} /> Редактировать сайт <ChevronRight size={17} />
                </button>
              )}
              <a className="pksk-outline-btn" href="#pksk-info-blocks">
                <Info size={17} /> Смотреть информацию
              </a>
            </div>
          </div>

          <div className="pksk-hero-visual" aria-hidden="true">
            <div className="pksk-floating-card pksk-card-left">
              <CheckCircle2 size={24} />
              <span>Проверено</span>
            </div>
            <div className="pksk-floating-card pksk-card-right">
              <FileText size={24} />
              <span>Инфо</span>
            </div>
            <div className="pksk-shield-stage">
              <div className="pksk-shield">
                <ShieldCheck size={54} />
                <strong>PKSK</strong>
                <small>PORTAL</small>
              </div>
            </div>
            <div className="pksk-books">
              <span />
              <span />
              <span />
            </div>
            <div className="pksk-building-badge">
              <Building2 size={22} />
            </div>
          </div>
        </div>
      </section>

      <section className="pksk-summary-panel">
        {summaryCards.map(card => (
          <div className="pksk-summary-card" key={card.label}>
            <div className="pksk-summary-icon">{card.icon}</div>
            <div>
              <strong>{card.value}</strong>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </section>

      {isEditing && (
        <div className="pksk-edit-actions">
          <button className="pksk-save-btn" onClick={handleSave}>
            <Save size={16} /> Сохранить
          </button>
          <button className="pksk-cancel-btn" onClick={() => { setIsEditing(false); setEditForm(content); }}>
            <X size={16} /> Отмена
          </button>
        </div>
      )}

      <section id="pksk-info-blocks" className="pksk-section-heading">
        <span />
        <h3>Информация портала</h3>
      </section>

      <div className="pksk-info-grid">
        <InfoCard
          id="pksk-contacts"
          icon={<Phone size={20} />}
          title="Важные контакты"
          isEditing={isEditing}
          value={isEditing ? editForm.contacts : content.contacts}
          onChange={value => setEditForm({ ...editForm, contacts: value })}
        />

        <InfoCard
          icon={<FileText size={20} />}
          title="Тарифы и Услуги"
          isEditing={isEditing}
          value={isEditing ? editForm.tariffs : content.tariffs}
          onChange={value => setEditForm({ ...editForm, tariffs: value })}
        />

        <InfoCard
          icon={<Megaphone size={20} />}
          title="Объявления ЖК"
          isEditing={isEditing}
          value={isEditing ? editForm.announcements : content.announcements}
          onChange={value => setEditForm({ ...editForm, announcements: value })}
          featured
        />
      </div>

      <div className="pksk-footer-note">
        <Info size={32} />
        <p>Smart PKSK Infrastructure v4.0 (Enterprise-Grade)</p>
      </div>

      <style>{`
        .pksk-home-shell {
          color: #0b1b35;
          padding-bottom: 92px;
        }

        .pksk-loading-state {
          text-align: center;
          padding: 40px;
        }

        .pksk-loading-dot {
          width: 30px;
          height: 30px;
          background: var(--neon-blue);
          border-radius: 50%;
          margin: auto;
        }

        .pksk-top-hero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: clamp(24px, 5vw, 44px);
          min-height: 380px;
          color: #fff;
          background:
            radial-gradient(circle at 76% 22%, rgba(82, 188, 255, 0.38), transparent 30%),
            radial-gradient(circle at 8% 92%, rgba(41, 117, 211, 0.46), transparent 34%),
            linear-gradient(135deg, #071b34 0%, #053c61 50%, #0b2340 100%);
          box-shadow: 0 28px 70px rgba(0, 33, 70, 0.34);
        }

        .pksk-top-hero::after {
          content: '';
          position: absolute;
          inset: auto -12% -32% -12%;
          height: 210px;
          border-radius: 50% 50% 0 0;
          background: rgba(255, 255, 255, 0.1);
          border-top: 2px solid rgba(129, 202, 255, 0.45);
          transform: rotate(-3deg);
        }

        .pksk-hero-orb,
        .pksk-dot-pattern {
          position: absolute;
          pointer-events: none;
        }

        .pksk-hero-orb-one {
          width: 280px;
          height: 280px;
          right: 14%;
          top: -120px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
        }

        .pksk-hero-orb-two {
          width: 520px;
          height: 520px;
          right: -160px;
          top: 30px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
        }

        .pksk-dot-pattern {
          inset: 0 auto auto 0;
          width: 180px;
          height: 210px;
          opacity: 0.2;
          background-image: radial-gradient(rgba(255,255,255,.55) 1.4px, transparent 1.4px);
          background-size: 14px 14px;
        }

        .pksk-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(280px, .95fr);
          gap: 28px;
          align-items: center;
        }

        .pksk-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 18px;
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.16);
          color: rgba(255,255,255,.86);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .pksk-hero-copy h2 {
          max-width: 560px;
          margin: 0 0 14px;
          font-size: clamp(34px, 6vw, 64px);
          line-height: .98;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .pksk-hero-input {
          min-height: 70px;
          font-size: clamp(24px, 5vw, 42px) !important;
          font-weight: 900;
        }

        .pksk-hero-quote {
          max-width: 540px;
          color: rgba(255,255,255,.82);
          font-size: clamp(16px, 2.2vw, 21px);
          line-height: 1.55;
          font-weight: 700;
        }

        .pksk-hero-note {
          display: grid;
          grid-template-columns: 3px 1fr;
          gap: 12px;
          align-items: stretch;
          max-width: 500px;
          margin-top: 22px;
          color: rgba(255,255,255,.78);
          font-size: 14px;
        }

        .pksk-hero-note span {
          display: block;
          border-radius: 99px;
          background: linear-gradient(180deg, #6cc8ff, #2f80ed);
        }

        .pksk-hero-actions,
        .pksk-edit-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .pksk-primary-btn,
        .pksk-outline-btn,
        .pksk-save-btn,
        .pksk-cancel-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 12px 20px;
          border-radius: 16px;
          border: 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }

        .pksk-primary-btn,
        .pksk-save-btn {
          background: linear-gradient(135deg, #4b91ff 0%, #2578e6 100%);
          color: #fff;
          box-shadow: 0 14px 34px rgba(37, 120, 230, .34);
        }

        .pksk-outline-btn,
        .pksk-cancel-btn {
          background: rgba(255,255,255,.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,.32);
        }

        .pksk-cancel-btn {
          color: #0b1b35;
          background: rgba(255,255,255,.74);
          border-color: rgba(6, 33, 68, .08);
        }

        .pksk-primary-btn:hover,
        .pksk-outline-btn:hover,
        .pksk-save-btn:hover,
        .pksk-cancel-btn:hover {
          transform: translateY(-2px);
        }

        .pksk-hero-visual {
          position: relative;
          min-height: 320px;
        }

        .pksk-shield-stage {
          position: absolute;
          right: 50%;
          top: 50%;
          width: 220px;
          height: 220px;
          transform: translate(50%, -45%);
          border-radius: 50%;
          background: linear-gradient(180deg, rgba(117,196,255,.3), rgba(7,46,78,.78));
          box-shadow: 0 34px 70px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.15);
          display: grid;
          place-items: center;
        }

        .pksk-shield {
          width: 154px;
          height: 178px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #d9ecff;
          background: linear-gradient(160deg, #123c60, #071f38 70%);
          border: 6px solid rgba(232, 244, 255, .72);
          clip-path: polygon(50% 0%, 93% 16%, 83% 78%, 50% 100%, 17% 78%, 7% 16%);
          filter: drop-shadow(0 18px 24px rgba(0,0,0,.32));
        }

        .pksk-shield strong {
          font-size: 30px;
          letter-spacing: .02em;
        }

        .pksk-shield small {
          font-size: 10px;
          letter-spacing: .2em;
          color: rgba(255,255,255,.78);
        }

        .pksk-floating-card,
        .pksk-building-badge {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.22);
          box-shadow: 0 20px 44px rgba(0,0,0,.22);
          backdrop-filter: blur(12px);
          color: rgba(255,255,255,.9);
          font-size: 12px;
          font-weight: 900;
        }

        .pksk-card-left { left: 0; top: 38px; }
        .pksk-card-right { right: 0; top: 112px; }

        .pksk-building-badge {
          right: 22%;
          bottom: 24px;
          width: 54px;
          height: 54px;
          justify-content: center;
          border-radius: 18px;
          padding: 0;
        }

        .pksk-books {
          position: absolute;
          right: 10px;
          bottom: 46px;
          display: grid;
          gap: 7px;
          transform: rotate(-5deg);
        }

        .pksk-books span {
          display: block;
          width: 114px;
          height: 22px;
          border-radius: 6px;
          background: linear-gradient(90deg, #142e4d, #d6e9ff 16%, #0d2c50 17%, #10233d);
          box-shadow: 0 8px 16px rgba(0,0,0,.24);
        }

        .pksk-summary-panel {
          position: relative;
          z-index: 4;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          margin: -34px 22px 30px;
          padding: 22px;
          border-radius: 24px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 22px 60px rgba(17, 52, 86, .16);
          border: 1px solid rgba(255,255,255,.74);
        }

        .pksk-summary-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 82px;
          padding: 8px 20px;
          border-right: 1px solid rgba(15, 47, 83, .1);
        }

        .pksk-summary-card:last-child { border-right: 0; }

        .pksk-summary-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 18px;
          color: #1f78d1;
          background: linear-gradient(135deg, #dfeeff, #eef7ff);
        }

        .pksk-summary-card strong {
          display: block;
          font-size: 26px;
          line-height: 1;
          color: #0b1b35;
        }

        .pksk-summary-card p {
          margin: 7px 0 0;
          color: #38516f;
          font-size: 13px;
          font-weight: 700;
        }

        .pksk-edit-actions {
          margin: 0 0 28px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255,255,255,.9);
          box-shadow: 0 16px 42px rgba(17, 52, 86, .12);
        }

        .pksk-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 30px 0 16px;
          color: #0b1b35;
        }

        .pksk-section-heading span {
          width: 4px;
          height: 22px;
          border-radius: 999px;
          background: #2f80ed;
        }

        .pksk-section-heading h3 {
          margin: 0;
          font-size: 21px;
          font-weight: 900;
        }

        .pksk-info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pksk-info-card {
          min-height: 250px;
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,251,255,.92));
          border: 1px solid rgba(255,255,255,.74);
          box-shadow: 0 20px 50px rgba(13, 50, 87, .12);
        }

        .pksk-info-card.featured {
          background: linear-gradient(180deg, #ffffff, #f3f9ff);
          border-color: rgba(47,128,237,.18);
        }

        .pksk-card-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #0b1b35;
        }

        .pksk-card-heading div {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #1f78d1;
          background: #e7f2ff;
        }

        .pksk-card-heading h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
        }

        .pksk-info-card pre {
          margin: 0;
          min-height: 138px;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.65;
          color: #36516f;
        }

        .pksk-muted-empty {
          color: #8aa0ba !important;
          font-style: italic;
        }

        .pksk-edit-input,
        .pksk-edit-textarea {
          width: 100%;
          border-radius: 18px;
          border: 1px solid rgba(47,128,237,.24);
          background: rgba(255,255,255,.92);
          color: #0b1b35 !important;
          box-shadow: 0 12px 30px rgba(13, 50, 87, .1);
        }

        .pksk-edit-textarea {
          min-height: 170px;
          line-height: 1.55;
        }

        .pksk-footer-note {
          padding: 38px;
          text-align: center;
          color: rgba(11, 27, 53, .35);
        }

        .pksk-footer-note svg { margin: auto; }
        .pksk-footer-note p { margin-top: 10px; font-size: 11px; }

        @media (max-width: 780px) {
          .pksk-hero-grid,
          .pksk-info-grid,
          .pksk-summary-panel {
            grid-template-columns: 1fr;
          }

          .pksk-top-hero {
            border-radius: 26px;
            min-height: auto;
          }

          .pksk-hero-visual {
            min-height: 250px;
          }

          .pksk-summary-panel {
            margin: -20px 12px 26px;
            padding: 14px;
          }

          .pksk-summary-card {
            justify-content: flex-start;
            border-right: 0;
            border-bottom: 1px solid rgba(15, 47, 83, .1);
          }

          .pksk-summary-card:last-child { border-bottom: 0; }
        }

        @media (max-width: 520px) {
          .pksk-hero-copy h2 { font-size: 36px; }
          .pksk-card-left,
          .pksk-card-right { display: none; }
          .pksk-books { right: 0; }
        }
      `}</style>
    </motion.div>
  );
}

function InfoCard({ id, icon, title, isEditing, value, onChange, featured }) {
  const displayValue = value || 'Информация пока не добавлена.';

  return (
    <article id={id} className={`pksk-info-card ${featured ? 'featured' : ''}`}>
      <div className="pksk-card-heading">
        <div>{icon}</div>
        <h4>{title}</h4>
      </div>

      {isEditing ? (
        <textarea
          className="pksk-edit-textarea"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <pre className={value ? '' : 'pksk-muted-empty'}>{displayValue}</pre>
      )}
    </article>
  );
}
