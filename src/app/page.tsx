import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "11connect – Clubmanagement für EA FC Clubs",
  description:
    "Kader, Spiele, Statistiken und Taktik in einer Plattform für ambitionierte EA FC Clubs.",
};

const features = [
  {
    icon: "◫",
    eyebrow: "Kader",
    title: "Alle Spieler an einem Ort",
    text: "EA-ID, Position, Trikotnummer und Leistungsdaten sauber verwalten.",
  },
  {
    icon: "⚽",
    eyebrow: "Spieltage",
    title: "Matches lückenlos erfassen",
    text: "Ergebnisse, Aufstellungen und individuelle Leistungen direkt dokumentieren.",
  },
  {
    icon: "↗",
    eyebrow: "Analyse",
    title: "Entwicklung sichtbar machen",
    text: "Form, Scorer, Bewertungen und Teamleistung schnell vergleichen.",
  },
  {
    icon: "✎",
    eyebrow: "Taktiktafel",
    title: "Spielzüge klar erklären",
    text: "Spieler platzieren, Laufwege zeichnen und Varianten als Bild teilen.",
  },
  {
    icon: "▣",
    eyebrow: "Screenshots",
    title: "Weniger manuelle Arbeit",
    text: "Spielberichte und Screenshots zentral beim jeweiligen Match ablegen.",
  },
  {
    icon: "◎",
    eyebrow: "Saisons",
    title: "Wettbewerbe im Blick behalten",
    text: "Mehrere Saisons und Wettbewerbe strukturiert voneinander trennen.",
  },
];

const boardPlayers = [
  { number: "1", label: "TW", left: "10%", top: "50%" },
  { number: "3", label: "IV", left: "27%", top: "30%" },
  { number: "5", label: "IV", left: "27%", top: "70%" },
  { number: "6", label: "ZDM", left: "47%", top: "42%" },
  { number: "8", label: "ZM", left: "57%", top: "68%" },
  { number: "10", label: "ZOM", left: "71%", top: "31%" },
  { number: "9", label: "ST", left: "85%", top: "52%" },
];

export default function LandingPage() {
  return (
    <div className="public-landing">
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Hauptnavigation">
          <Link href="/" className="landing-brand" aria-label="11connect Startseite">
            <span>11</span>connect
          </Link>

          <div className="landing-nav-links">
            <a href="#features">Funktionen</a>
            <a href="#taktikboard">Taktikboard</a>
            <a href="#ablauf">So funktioniert&apos;s</a>
            <a href="#kontakt">Kontakt</a>
          </div>

          <Link href="/dashboard" className="landing-login-link">
            Hub öffnen <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-pill">
                <span /> Für ambitionierte EA FC Clubs
              </div>

              <h1>
                Dein Club.
                <span>Eine klare Linie.</span>
              </h1>

              <p>
                11connect verbindet Kaderverwaltung, Spielanalyse und taktische
                Planung in einem Hub – damit aus Einzelspielern ein besseres Team wird.
              </p>

              <div className="landing-hero-actions">
                <a href="#features" className="landing-button landing-button--primary">
                  Funktionen entdecken <span aria-hidden="true">↓</span>
                </a>
                <a href="#kontakt" className="landing-button landing-button--ghost">
                  Kontakt aufnehmen
                </a>
              </div>

              <div className="landing-hero-proof">
                <span><i>✓</i> Einfache Bedienung</span>
                <span><i>✓</i> Desktop & Mobil</span>
                <span><i>✓</i> Für den ganzen Club</span>
              </div>
            </div>

            <div
              className="landing-product-preview"
              role="img"
              aria-label="Produktvorschau von 11connect mit Dashboard und Taktikfeld"
            >
              <div className="landing-product-topbar">
                <div><span /><span /><span /></div>
                <strong>11connect Hub</strong>
                <span>Live</span>
              </div>

              <div className="landing-product-body">
                <aside aria-hidden="true">
                  <strong>11</strong>
                  <span className="active">⌂</span>
                  <span>◫</span>
                  <span>⚽</span>
                  <span>↗</span>
                  <span>✎</span>
                </aside>

                <div className="landing-product-main">
                  <div className="landing-product-heading">
                    <div><small>TEAMZENTRALE</small><strong>Guten Abend, Coach.</strong></div>
                    <span>Aktive Saison</span>
                  </div>

                  <div className="landing-product-kpis">
                    <div><small>Spiele</small><strong>24</strong><em>+3 diesen Monat</em></div>
                    <div><small>Siegquote</small><strong>67%</strong><em>Form steigt</em></div>
                    <div><small>Tore</small><strong>58</strong><em>2,4 pro Spiel</em></div>
                  </div>

                  <div className="landing-product-lower">
                    <div className="landing-mini-board">
                      <span className="dashboard-preview-outline" />
                      <span className="dashboard-preview-halfway" />
                      <span className="dashboard-preview-center" />
                      <span className="landing-mini-player" style={{ left: "18%", top: "50%" }}>1</span>
                      <span className="landing-mini-player" style={{ left: "39%", top: "28%" }}>6</span>
                      <span className="landing-mini-player" style={{ left: "43%", top: "70%" }}>8</span>
                      <span className="landing-mini-player" style={{ left: "72%", top: "48%" }}>10</span>
                      <span className="landing-mini-arrow" />
                    </div>

                    <div className="landing-form-card">
                      <small>LETZTE 5 SPIELE</small>
                      <div><span className="win">S</span><span className="win">S</span><span className="draw">U</span><span className="win">S</span><span className="loss">N</span></div>
                      <strong>10 Punkte</strong>
                      <p>Stabile Formkurve</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-strip" aria-label="Produktbereiche">
          <div className="landing-container">
            <span>Kaderverwaltung</span><i />
            <span>Matchberichte</span><i />
            <span>Leistungsdaten</span><i />
            <span>Taktikplanung</span><i />
            <span>Saisonübersicht</span>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div>
                <span className="landing-kicker">Ein System statt fünf Listen</span>
                <h2>Alles, was dein Club wirklich braucht.</h2>
              </div>
              <p>
                Von der Spielerpflege bis zur Matchanalyse: Alle wichtigen Abläufe
                greifen ineinander und bleiben für das Team nachvollziehbar.
              </p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature) => (
                <article className="landing-feature-card" key={feature.title}>
                  <div className="landing-feature-icon" aria-hidden="true">{feature.icon}</div>
                  <span>{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-board-section" id="taktikboard">
          <div className="landing-container landing-board-grid">
            <div className="landing-board-copy">
              <span className="landing-kicker">Taktikboard</span>
              <h2>Deine Idee wird für alle sichtbar.</h2>
              <p>
                Stelle deinen Kader automatisch auf, verschiebe Spieler frei und
                zeichne jede Bewegung so ein, wie du sie im Spiel sehen möchtest.
              </p>

              <ul className="landing-check-list">
                <li><span>✓</span><div><strong>Kader direkt übernehmen</strong><small>EA-ID und Trikotnummer bleiben sichtbar.</small></div></li>
                <li><span>✓</span><div><strong>Pfeile und Laufwege zeichnen</strong><small>Farben und Linienstärken frei wählen.</small></div></li>
                <li><span>✓</span><div><strong>Varianten speichern und teilen</strong><small>Taktiken laden oder als PNG exportieren.</small></div></li>
              </ul>

              <Link href="/taktiktafel" className="landing-inline-link">
                Taktikboard im Hub öffnen <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div
              className="landing-board-window"
              role="img"
              aria-label="Taktikboard mit Spielern, Gegnern und eingezeichneten Laufwegen"
            >
              <div className="landing-board-toolbar">
                <div><span className="active">↖</span><span>●</span><span>➜</span><span>⌁</span><span>✎</span></div>
                <strong>Angriff über rechts</strong>
                <span>4-2-3-1</span>
              </div>

              <div className="dashboard-preview-pitch landing-board-pitch">
                <span className="dashboard-preview-outline" />
                <span className="dashboard-preview-halfway" />
                <span className="dashboard-preview-center" />
                <span className="dashboard-preview-center-dot" />
                <span className="dashboard-preview-box dashboard-preview-box--left" />
                <span className="dashboard-preview-box dashboard-preview-box--right" />
                <span className="dashboard-preview-goalbox dashboard-preview-goalbox--left" />
                <span className="dashboard-preview-goalbox dashboard-preview-goalbox--right" />
                <span className="dashboard-preview-goal dashboard-preview-goal--left" />
                <span className="dashboard-preview-goal dashboard-preview-goal--right" />
                <span className="dashboard-preview-arrow dashboard-preview-arrow--one" />
                <span className="dashboard-preview-arrow dashboard-preview-arrow--two" />
                <span className="dashboard-preview-run" />

                {boardPlayers.map((player) => (
                  <span
                    className="dashboard-preview-player landing-board-player"
                    key={`${player.label}-${player.number}`}
                    style={{ left: player.left, top: player.top }}
                  >
                    <span>{player.number}</span>
                    <small>{player.label}</small>
                  </span>
                ))}

                <span className="dashboard-preview-opponent" style={{ left: "50%", top: "18%" }}>4</span>
                <span className="dashboard-preview-opponent" style={{ left: "66%", top: "52%" }}>6</span>
                <span className="dashboard-preview-opponent" style={{ left: "80%", top: "74%" }}>3</span>
                <span className="dashboard-preview-ball">⚽</span>
              </div>

              <div className="landing-board-status">
                <span><i /> Automatisch gespeichert</span>
                <span>Rückgängig</span>
                <span>PNG exportieren</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-workflow" id="ablauf">
          <div className="landing-container">
            <div className="landing-centered-heading">
              <span className="landing-kicker">Vom Spieltag zur Erkenntnis</span>
              <h2>Drei Schritte. Ein gemeinsames Bild.</h2>
              <p>Der Hub bringt Informationen genau dorthin, wo dein Team sie braucht.</p>
            </div>

            <div className="landing-steps">
              <article><span>01</span><div><strong>Erfassen</strong><p>Kader, Match und Leistungsdaten strukturiert eintragen.</p></div></article>
              <article><span>02</span><div><strong>Verstehen</strong><p>Entwicklung, Form und Stärken auf einen Blick erkennen.</p></div></article>
              <article><span>03</span><div><strong>Verbessern</strong><p>Erkenntnisse direkt in Aufstellung und Taktik übersetzen.</p></div></article>
            </div>
          </div>
        </section>

        <section className="landing-contact" id="kontakt">
          <div className="landing-container landing-contact-card">
            <div>
              <span className="landing-kicker">Interesse an 11connect?</span>
              <h2>Lass uns über deinen Club sprechen.</h2>
              <p>
                Du möchtest den Hub für dein Team nutzen oder hast Fragen zu den
                Funktionen? Schreib uns – wir melden uns persönlich bei dir.
              </p>
            </div>

            <div className="landing-contact-actions">
              <a
                className="landing-button landing-button--primary"
                href="mailto:kontakt@11connect.com?subject=Interesse%20an%2011connect"
              >
                E-Mail schreiben <span aria-hidden="true">↗</span>
              </a>
              <span>kontakt@11connect.com</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <Link href="/" className="landing-brand"><span>11</span>connect</Link>
          <p>Clubmanagement, Spielanalyse und Taktik für EA FC Clubs.</p>
          <div><a href="#features">Funktionen</a><a href="#kontakt">Kontakt</a><Link href="/dashboard">Hub öffnen</Link></div>
        </div>
      </footer>
    </div>
  );
}
