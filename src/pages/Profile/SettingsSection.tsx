type SettingsSectionProps = {
  title: string
  /** One line under the heading. What the field is for, not how to use it. */
  description?: string
  /**
   * The id of the control this section titles. Given one, the heading *is* the
   * label — which is why the controls below pass no `label` of their own: two
   * labels for one field is what made the old page look arbitrary, with "Game
   * tag" beside its input and "Bio" above its box.
   */
  htmlFor?: string
  children: React.ReactNode
  /** The row under the control: a counter, a status line, a hint. */
  footer?: React.ReactNode
}

/**
 * One setting: heading, description, control, and an optional footer row.
 *
 * It exists so consistency is structural rather than remembered. The page was
 * a column of hand-built blocks, and each had drifted — a label to the left of
 * one field and above another, a counter under one and not the next, a Save
 * full-width here and small and right-aligned there.
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, htmlFor, children, footer }) => (
  <section className="flex flex-col gap-3 border-t border-white/10 px-6 py-5">
    <div className="flex flex-col gap-0.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {title}
        </label>
      ) : (
        <h2 className="text-sm font-semibold">{title}</h2>
      )}
      {description && <p className="text-xs opacity-60">{description}</p>}
    </div>

    {children}

    {/* min-h so a section whose footer is conditional — the game tag's
        availability line appears only while typing — does not jump the ones
        below it up and down as you type. */}
    {footer && <div className="flex min-h-4 items-center justify-between gap-3 text-xs">{footer}</div>}
  </section>
)

export default SettingsSection
