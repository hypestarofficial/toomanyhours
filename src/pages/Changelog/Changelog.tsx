import Page from "../../components/page/Page"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Badge from "../../components/badge/Badge"
import { changelog } from "../../changelog"

/**
 * Read-only, no state, no query. The list is bundled at build time, so this
 * page cannot fail to load — which is why there is no loading or error branch.
 */
const Changelog: React.FC = () => (
  <Page align="start" className="overflow-y-auto">
    <MotionContainer className="flex w-full max-w-2xl flex-col gap-8 p-10">
      <h1 className="text-2xl font-semibold">What&apos;s new</h1>

      {changelog.map((entry, index) => (
        <div key={entry.version} className="flex w-full flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold">v{entry.version}</h2>
            {/* Only the first entry, because the array is ordered newest first
                and that ordering is pinned by a test. */}
            {index === 0 && <Badge variant="dark">current</Badge>}
            <span className="text-xs opacity-60">{entry.date}</span>
          </div>

          <ul className="flex flex-col gap-1">
            {entry.changes.map((change) => (
              <li key={change} className="text-sm opacity-90">
                — {change}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Says where the record starts, so the gap reads as a known boundary
          rather than missing data. */}
      <p className="text-xs opacity-60">Versions before 0.4.0 are not recorded — the number sat at 0.1.0 and did not move.</p>
    </MotionContainer>
  </Page>
)

export default Changelog
