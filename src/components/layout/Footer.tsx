import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-8 mt-auto border-t border-gray-700 text-center text-gray-400 text-sm">
      <p>© {currentYear} AI Image Describer. All rights reserved.</p>
      <Link
        href="https://github.com/789ni812/imgdescriptor"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block hover:text-primary-light transition-colors"
      >
        View Source on GitHub
      </Link>
    </footer>
  );
} 