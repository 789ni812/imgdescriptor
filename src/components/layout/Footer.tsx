export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="footer" className="w-full bg-gray-800 shadow-md-top mt-auto border-t-4 border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 text-xs text-gray-400">
          <p>© {currentYear}</p>
        </div>
      </div>
    </footer>
  );
} 