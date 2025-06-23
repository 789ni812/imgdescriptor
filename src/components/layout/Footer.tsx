import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="footer" className="w-full bg-gray-800 shadow-md-top mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 text-sm text-gray-400">
          <p>© {currentYear} AI Image Describer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 