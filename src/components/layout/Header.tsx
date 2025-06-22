import Link from 'next/link';

export function Header() {
  return (
    <header data-testid="header" className="w-full bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white hover:text-primary-light transition-colors">
              <h1 className="text-2xl font-bold">
                AI Image Describer
              </h1>
            </Link>
          </div>
          <div className="text-sm text-gray-400">
            Upload an image and let our AI describe it for you.
          </div>
        </div>
      </div>
    </header>
  );
} 