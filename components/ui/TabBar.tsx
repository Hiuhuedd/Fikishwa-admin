interface TabBarProps<T extends string> {
  tabs: { label: string; value: T }[];
  active: T;
  onChange: (val: T) => void;
}

export default function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            active === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
