'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 will-change-transform w-full h-full">
      {children}
    </div>
  );
}
