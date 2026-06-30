import { UserButton } from "@clerk/clerk-react";

export default function Topbar({ title }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-white px-6">
      <h1 className="text-sm font-semibold text-[var(--text)]">{title}</h1>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </header>
  );
}
