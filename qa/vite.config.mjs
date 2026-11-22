import base from "../vite.config.ts";

// Only this explicitly launched development server injects the fixture.
// The production entry and build configuration never import qa/.
function replaceOnce(source, marker, replacement) {
  if (source.split(marker).length !== 2) throw new Error(`QA fixture marker changed: ${marker}`);
  return source.replace(marker, replacement);
}

export default {
  ...base,
  cacheDir: 'node_modules/.vite-qa',
  plugins: [...base.plugins, {
    name: "dominix-isolated-boss-scenario", enforce: "pre", apply: "serve",
    transform(source, id) {
      if (id.replaceAll("\\", "/").endsWith("/src/engine/celebrate.ts")) {
        // QA-only observation of the real helper; never emitted by production.
        return { code: replaceOnce(source, 'export function celebrateBigEvent() {', 'export function celebrateBigEvent() {\n  window.dispatchEvent(new Event("dominix-qa-boss-celebration"));'), map: null };
      }
      if (!id.replaceAll("\\", "/").endsWith("/src/components/GameBoard.tsx")) return;
      let code = replaceOnce(source, 'mapMode ? { ...initResult.state, result: "map_select" as const } : initResult.state', "qaState(initResult.state)");
      code = replaceOnce(code, 'const [currentBoss, setCurrentBoss] = useRunValue(resume, "currentBoss", null)', 'const [currentBoss, setCurrentBoss] = useRunValue(resume, "currentBoss", qaBoss)');
      code = replaceOnce(code, 'const [tutorialStep, setTutorialStep] = useRunValue(resume, "tutorialStep", () => isTutorialComplete() ? -1 : 0)', 'const [tutorialStep, setTutorialStep] = useRunValue(resume, "tutorialStep", -1)');
      return { code: 'import { qaState, qaBoss } from "/qa/scenario";\n' + code, map: null };
    },
  }],
};
