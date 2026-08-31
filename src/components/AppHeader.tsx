type AppHeaderProps = {
  label: string;
  accent: string;
  rightContent: React.ReactNode;
};

export function AppHeader({ label, accent, rightContent }: AppHeaderProps) {
  return (
    <header className="topbar">
      <span className="brand">
        <img src="/connected-sa-mark.svg" alt="" aria-hidden="true" />
        {label} <em>{accent}</em>
      </span>
      {rightContent}
    </header>
  );
}
