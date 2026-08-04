export const renderNavbar = (currentPage) => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  const isLogin = currentPage === "login";
  const linkHref = isLogin ? "/signup" : "/login";
  const linkText = isLogin
    ? "¿No tienes cuenta? Regístrate"
    : "¿Ya tienes cuenta? Inicia sesión";

  container.innerHTML = `
    <nav class="flex justify-between items-center px-8 py-6 border-b border-ily-purple-300/30 bg-ily-dark/80 backdrop-blur-sm fixed top-0 left-0 w-full z-40">
      <a href="/" class="text-2xl font-bold tracking-wide font-pixel-logo">
        <span class="text-ily-purple-300 drop-shadow-neon-purple-lg">ily</span>verse
      </a>
      <a href="${linkHref}" class="text-xs md:text-sm font-semibold text-[#a09abc] hover:text-ily-purple-300 transition-all">
        ${linkText}
      </a>
    </nav>
  `;
};
