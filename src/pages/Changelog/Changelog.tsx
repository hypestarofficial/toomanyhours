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

          {/* Prose, so no dash and a little more room beneath it: this is the
              paragraph the list hangs off, not the first item in it. */}
          {entry.intro && <p className="mb-1 text-sm leading-relaxed opacity-80">{entry.intro}</p>}

          <ul className="flex flex-col gap-1.5">
            {entry.changes.map((change) => (
              // The dash is a hanging marker: `flex` puts it beside the text
              // rather than in it, so a line that wraps lines up under the
              // first word instead of under the dash.
              <li key={change} className="flex gap-2 text-sm leading-relaxed opacity-90">
                <span aria-hidden="true" className="opacity-60 select-none">
                  —
                </span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </MotionContainer>
  </Page>
)

export default Changelog
