import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-8 border-b border-gray-700">
      <Link href="/">
        <h1 className="text-2xl font-bold text-white hover:text-primary-light transition-colors">
          AI Image Describer
        </h1>
      </Link>
    </header>
  );
} 