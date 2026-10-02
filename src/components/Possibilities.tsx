import SpaceWorlds from "./SpaceWorlds";
import styles from "./SpaceWorlds.module.css";
export default function Possibilities() {
  return (
    <section id="possibilities" className={styles.section} aria-labelledby="possibilities-heading">
      <header className={styles.heading}>
        <p className="eyebrow">02 / MADE AROUND YOU</p>
        <h2 id="possibilities-heading">
          Your Idea. Your Tile.<br /><em>Your Space.</em>
        </h2>
        <p>Every space begins with a different story.<br />Step into yours.</p>
      </header>
      <SpaceWorlds />
      <p className={styles.note}>
        A glimpse of what could be. Interiors are concept visualizations, not completed projects.
        Materials, finishes and suitability are reviewed for your space.
      </p>
    </section>
  );
}
