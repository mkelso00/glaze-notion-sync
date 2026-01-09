export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Gradient Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-screen pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full blur-3xl opacity-60"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-1/2 h-screen pointer-events-none overflow-hidden">
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.3em] text-black mb-6">
          GLAZE
        </h1>
        <p className="text-gray-500 text-lg md:text-xl text-center max-w-md mb-8">
          Client Dashboard Portal
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
        <p className="text-gray-400 text-sm mt-8 text-center">
          Access your project dashboard through your unique client link.
        </p>
      </div>

      <footer className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-gray-400 text-sm">
          Powered by{' '}
          <a
            href="https://glazedigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Glaze Digital
          </a>
        </p>
      </footer>
    </div>
  );
}
