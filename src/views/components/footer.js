export const renderFooter = () => {
  const container = document.getElementById("footer-container");
  if (!container) return;

  container.innerHTML = `
    <footer class="w-full py-6 border-t border-ily-purple-300/20 bg-ily-dark/80 backdrop-blur-sm text-center text-xs text-[#a09abc] font-pixel-base mt-auto">
      <p>© ${new Date().getFullYear()} <span class="text-ily-purple-300">Ilyverse</span>. Todos los derechos reservados. 💜</p>
    </footer>
  `;
};
