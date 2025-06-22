import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="footer" className="w-full bg-gray-800 shadow-md-top mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 text-sm text-gray-400">
          <p>© {currentYear} AI Image Describer. All rights reserved.</p>
          <Link
            href="https://github.com/789ni812/imgdescriptor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-light transition-colors"
          >
            View Source on GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
} 