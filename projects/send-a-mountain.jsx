/* Send Someone a Mountain — interactive feature
   Three steps: choose mountain → write line → preview/send.
   Stays in keeping with the editorial dark MNTA aesthetic.
*/
const { useState, useMemo, useEffect } = React;

const MOUNTAINS = [
  { id: 'whitney',  name: 'Mt. Whitney',     where: 'Sierra Nevada · 14,505 ft', mood: 'first light',     bg: '../images/projects/mnta/mt-whitney.jpg' },
  { id: 'cascade',  name: 'Cascade Ridge',   where: 'Pacific Northwest',         mood: 'in fog',          bg: null, gradient: 'linear-gradient(160deg,#0a1320 0%,#1a2535 50%,#5a6677 100%)' },
  { id: 'dolomiti', name: 'Dolomiti',        where: 'Italian Alps',              mood: 'at last light',   bg: null, gradient: 'linear-gradient(160deg,#0a1320 0%,#2a3a52 45%,#aac5d8 100%)' },
  { id: 'atlas',    name: 'Atlas',           where: 'North Africa',              mood: 'at sundown',      bg: null, gradient: 'linear-gradient(160deg,#0a1320 0%,#3a2a1e 50%,#d49a4a 100%)' },
  { id: 'tongariro',name: 'Tongariro',       where: 'Aotearoa · New Zealand',    mood: 'after rain',      bg: null, gradient: 'linear-gradient(160deg,#0a1320 0%,#1f3030 55%,#637a6e 100%)' },
  { id: 'fuji',     name: 'Fuji',            where: 'Honshū · Japan',            mood: 'in winter',       bg: null, gradient: 'linear-gradient(160deg,#0a1320 0%,#2c364a 50%,#cdd5dd 100%)' },
];

const PROMPTS = [
  'For the morning we never made it to.',
  'Thinking of you. Stand here a minute.',
  'You taught me to look up.',
  'Found this one for you.',
];

const css = {
  shell: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--hairline)', background: '#06101c' },
  shellMobile: { gridTemplateColumns: '1fr' },
  left: { padding: '40px 44px', borderRight: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', minHeight: 560 },
  right: { padding: '40px 44px', display: 'flex', flexDirection: 'column', minHeight: 560 },
  steps: { display: 'flex', gap: 24, marginBottom: 36, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' },
  step: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--stone-2)', cursor: 'pointer' },
  stepActive: { color: 'var(--horizon)' },
  stepDot: { width: 6, height: 6, borderRadius: 1, background: 'var(--stone)' },
  stepDotActive: { background: 'var(--horizon)' },
  q: { fontFamily: 'Libre Caslon Text, serif', fontSize: 28, color: 'var(--bone)', lineHeight: 1.15, marginBottom: 28 },
  mtnList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  card: { background: '#0a1422', border: '1px solid var(--hairline)', aspectRatio: '4/3', padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color .3s, transform .4s' },
  cardActive: { borderColor: 'var(--horizon)' },
  cardBg: { position: 'absolute', inset: 0, opacity: 0.7, backgroundSize: 'cover', backgroundPosition: 'center' },
  cardOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,16,28,0.1), rgba(7,16,28,0.85))' },
  cardName: { position: 'relative', fontFamily: 'Libre Caslon Text, serif', fontSize: 18, color: 'var(--bone)', lineHeight: 1.1 },
  cardWhere: { position: 'relative', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--parchment-dim)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 },
  cardCheck: { position: 'absolute', top: 12, right: 12, width: 18, height: 18, border: '1px solid var(--parchment-dim)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--horizon)', fontSize: 11, opacity: 0.4 },
  cardCheckActive: { borderColor: 'var(--horizon)', opacity: 1, background: 'rgba(212,154,74,0.12)' },

  field: { marginBottom: 28 },
  fieldL: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--stone-2)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 },
  input: { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', color: 'var(--bone)', fontFamily: 'Libre Caslon Text, serif', fontSize: 22, padding: '8px 0 14px', outline: 'none' },
  textarea: { width: '100%', background: 'transparent', border: '1px solid var(--hairline)', color: 'var(--parchment)', fontFamily: 'Libre Caslon Text, serif', fontStyle: 'italic', fontSize: 18, padding: '14px', outline: 'none', resize: 'none', minHeight: 110, lineHeight: 1.5 },

  prompts: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  prompt: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--parchment-dim)', letterSpacing: '0.16em', textTransform: 'uppercase', padding: '6px 10px', border: '1px solid var(--hairline)', cursor: 'pointer', transition: 'all .25s' },

  postcard: { aspectRatio: '5/3', background: '#000', border: '1px solid var(--hairline-strong)', position: 'relative', overflow: 'hidden', display: 'flex' },
  postcardImg: { flex: '0 0 60%', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  postcardImgFade: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,16,28,0) 60%, rgba(7,16,28,0.95))' },
  postcardText: { flex: '1', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1, marginLeft: -40, background: 'linear-gradient(90deg, transparent, rgba(7,16,28,0.96) 40%)' },
  pcWm: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--parchment-dim)', letterSpacing: '0.3em' },
  pcMsg: { fontFamily: 'Libre Caslon Text, serif', fontStyle: 'italic', fontSize: 19, color: 'var(--bone)', lineHeight: 1.3, marginTop: 14, marginBottom: 14 },
  pcMeta: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--stone-2)', letterSpacing: '0.2em', textTransform: 'uppercase', borderTop: '1px solid var(--hairline)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' },

  controls: { marginTop: 'auto', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  back: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--stone-2)', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0' },
  next: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '16px 28px', background: 'var(--bone)', color: 'var(--night)', border: 'none', cursor: 'pointer', transition: 'background .3s' },
  nextDisabled: { background: 'var(--shadow)', color: 'var(--stone)', cursor: 'not-allowed' },

  channelRow: { display: 'flex', gap: 8, marginTop: 8 },
  channel: { flex: 1, padding: '12px', border: '1px solid var(--hairline)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--parchment-dim)', cursor: 'pointer', textAlign: 'center', transition: 'all .25s' },
  channelActive: { borderColor: 'var(--horizon)', color: 'var(--horizon)' },

  done: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, gap: 18 },
  doneLbl: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--horizon)', letterSpacing: '0.3em', textTransform: 'uppercase' },
  doneH: { fontFamily: 'Libre Caslon Text, serif', fontStyle: 'italic', fontSize: 36, color: 'var(--bone)', lineHeight: 1.2, maxWidth: 420 },
  doneR: { fontFamily: 'Space Grotesk', fontSize: 14, color: 'var(--parchment-dim)', maxWidth: 360, lineHeight: 1.6 },
  doneAgain: { marginTop: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--stone-2)', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--hairline)', padding: '12px 20px', cursor: 'pointer' },
};

function Card({ m, active, onClick }) {
  return (
    <div
      style={{ ...css.card, ...(active ? css.cardActive : null) }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--parchment-dim)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--hairline)'; }}
    >
      <div style={{ ...css.cardBg, ...(m.bg ? { backgroundImage: `url(${m.bg})` } : { background: m.gradient }) }} />
      <div style={css.cardOverlay} />
      <div style={css.cardName}>{m.name}</div>
      <div style={css.cardWhere}>{m.where} · {m.mood}</div>
      <div style={{ ...css.cardCheck, ...(active ? css.cardCheckActive : null) }}>{active ? '✓' : ''}</div>
    </div>
  );
}

function Postcard({ mountain, message, recipient }) {
  if (!mountain) return null;
  const bg = mountain.bg ? `url(${mountain.bg})` : mountain.gradient;
  const bgStyle = mountain.bg ? { backgroundImage: `url(${mountain.bg})` } : { background: mountain.gradient };
  return (
    <div style={css.postcard}>
      <div style={{ ...css.postcardImg, ...bgStyle }}>
        <div style={css.postcardImgFade} />
      </div>
      <div style={css.postcardText}>
        <div>
          <div style={css.pcWm}>MNTA — A MOUNTAIN FOR YOU</div>
          <div style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 22, color: 'var(--bone)', marginTop: 10, lineHeight: 1.1 }}>
            {mountain.name}, <em style={{ color: 'var(--horizon)' }}>{mountain.mood}</em>.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--parchment-dim)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>{mountain.where}</div>
        </div>
        <div style={css.pcMsg}>“{message || 'For you. Stand here a minute.'}”</div>
        <div style={css.pcMeta}>
          <span>To — {recipient || 'someone'}</span>
          <span>From — yours</span>
        </div>
      </div>
    </div>
  );
}

function SendAMountain() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState('whitney');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState(PROMPTS[0]);
  const [channel, setChannel] = useState('email');
  const [sent, setSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const mountain = useMemo(() => MOUNTAINS.find(m => m.id === picked), [picked]);

  const canAdvance = (
    (step === 0 && !!picked) ||
    (step === 1 && recipient.trim().length > 0 && message.trim().length > 0) ||
    (step === 2)
  );

  const next = () => {
    if (!canAdvance) return;
    if (step === 2) {
      setSent(true);
      return;
    }
    setStep(s => s + 1);
  };
  const back = () => { if (step > 0) setStep(s => s - 1); };
  const reset = () => { setSent(false); setStep(0); setRecipient(''); setMessage(PROMPTS[0]); };

  const stepLabel = (i, label) => (
    <div
      style={{ ...css.step, ...(step === i ? css.stepActive : null) }}
      onClick={() => !sent && setStep(i)}
    >
      <span style={{ ...css.stepDot, ...(step === i ? css.stepDotActive : null) }}></span>
      0{i + 1} — {label}
    </div>
  );

  // LEFT — controls
  let leftContent;
  if (sent) {
    leftContent = (
      <div style={css.done}>
        <div style={css.doneLbl}>— Sent</div>
        <div style={css.doneH}>The mountain is on its way.</div>
        <div style={css.doneR}>{recipient || 'Someone'} will receive {mountain.name}, {mountain.mood}, by {channel}. They can hold on to it as long as they like.</div>
        <button style={css.doneAgain} onClick={reset}>Send another</button>
      </div>
    );
  } else if (step === 0) {
    leftContent = (
      <>
        <div style={css.q}>Choose a mountain.</div>
        <div style={css.mtnList}>
          {MOUNTAINS.map(m => <Card key={m.id} m={m} active={picked === m.id} onClick={() => setPicked(m.id)} />)}
        </div>
      </>
    );
  } else if (step === 1) {
    leftContent = (
      <>
        <div style={css.q}>Write a quiet line.</div>
        <div style={css.field}>
          <div style={css.fieldL}>To — a name, a word</div>
          <input style={css.input} placeholder="Mom" value={recipient} onChange={e => setRecipient(e.target.value)} />
        </div>
        <div style={css.field}>
          <div style={css.fieldL}>A line, only if you want one</div>
          <textarea style={css.textarea} value={message} onChange={e => setMessage(e.target.value)} maxLength={140} />
          <div style={css.prompts}>
            {PROMPTS.map(p => (
              <div
                key={p}
                style={css.prompt}
                onClick={() => setMessage(p)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--horizon)'; e.currentTarget.style.color = 'var(--horizon)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--parchment-dim)'; }}
              >
                {p.length > 26 ? p.slice(0, 24) + '…' : p}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } else {
    leftContent = (
      <>
        <div style={css.q}>How should it arrive?</div>
        <div style={css.field}>
          <div style={css.fieldL}>Channel</div>
          <div style={css.channelRow}>
            {['email', 'text', 'paper'].map(c => (
              <div
                key={c}
                style={{ ...css.channel, ...(channel === c ? css.channelActive : null) }}
                onClick={() => setChannel(c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={css.field}>
          <div style={css.fieldL}>Summary</div>
          <div style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 18, color: 'var(--bone)', lineHeight: 1.4, marginTop: 8 }}>
            <em style={{ color: 'var(--horizon)' }}>{mountain.name}</em>, {mountain.mood}, sent to <em style={{ color: 'var(--horizon)' }}>{recipient || 'someone'}</em> by {channel}.
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ ...css.shell, ...(isMobile ? css.shellMobile : null) }}>
      <div style={{ ...css.left, ...(isMobile ? { borderRight: 'none', borderBottom: '1px solid var(--hairline)' } : null) }}>
        {!sent && (
          <div style={css.steps}>
            {stepLabel(0, 'Mountain')}
            {stepLabel(1, 'Words')}
            {stepLabel(2, 'Send')}
          </div>
        )}
        {leftContent}
        {!sent && (
          <div style={css.controls}>
            <button style={css.back} onClick={back} disabled={step === 0} aria-disabled={step === 0}>
              {step === 0 ? '' : '← Back'}
            </button>
            <button
              style={{ ...css.next, ...(canAdvance ? null : css.nextDisabled) }}
              onClick={next}
              disabled={!canAdvance}
              onMouseEnter={(e) => { if (canAdvance) e.currentTarget.style.background = 'var(--horizon)'; }}
              onMouseLeave={(e) => { if (canAdvance) e.currentTarget.style.background = 'var(--bone)'; }}
            >
              {step === 2 ? 'Send the mountain →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>

      <div style={css.right}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--stone-2)', textTransform: 'uppercase' }}>
          <span>Live preview</span>
          <span>Postcard · 5×3</span>
        </div>
        <Postcard mountain={mountain} message={message} recipient={recipient} />
        <div style={{ marginTop: 32, fontFamily: 'Libre Caslon Text, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--parchment-dim)', lineHeight: 1.55, maxWidth: 420 }}>
          The recipient receives a still card and a 30-second loop of the same place — a small window of weather, light, and silence. They can keep it. They can return to it. There is no feed.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('send-app')).render(<SendAMountain />);
