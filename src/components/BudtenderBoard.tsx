import styles from "./BudtenderBoard.module.css";

export type Budtender = {
  id: string;
  name: string;
  picks_note_override?: string | null;
};

export type BoardPick = {
  id: string;
  product_name: string;
  category_line: string;
  note: string;
  doodle_key?: string | null;
  rank: number;
};

type BudtenderBoardProps = {
  budtender: Budtender;
  picks: BoardPick[];
};

export function BudtenderBoard({ budtender, picks }: BudtenderBoardProps) {
  const intro =
    budtender.picks_note_override ??
    `Hey, I’m ${budtender.name}. These are the things I actually grab for myself – ask me why.`;

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{budtender.name}&apos;s Picks</h1>
          <span className={styles.appName}>Guidelight</span>
        </div>

        <div className={styles.introBubble}>{intro}</div>
      </header>

      <main className={styles.grid}>
        {picks.map((pick) => (
          <article key={pick.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{pick.product_name}</h2>
            {pick.category_line && (
              <p className={styles.cardCategory}>“{pick.category_line}”</p>
            )}
            {pick.note && <p className={styles.cardNote}>“{pick.note}”</p>}

            {pick.doodle_key && (
              <div className={styles.cardDoodle}>
                {/* Replace with real DoodleIcon when wired up */}
                <span className={styles.doodleFallback}>{pick.doodle_key}</span>
              </div>
            )}
          </article>
        ))}
      </main>

      <footer className={styles.footer}>
        <span className={styles.signature}>Xylent Studios</span>
      </footer>
    </div>
  );
}
