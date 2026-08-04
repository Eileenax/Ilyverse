export const displayNotification = (isError, message) => {
  let container = document.getElementById("notification-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className =
      "fixed top-24 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const bgClass = isError
    ? "bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
    : "bg-ily-dark/90 border-ily-purple-300 text-ily-purple-100 shadow-[0_0_15px_rgba(199,125,255,0.6)]";

  toast.className = `p-4 rounded-lg border backdrop-blur-md text-xs font-pixel-base transition-all duration-300 transform translate-x-10 opacity-0 ${bgClass}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-x-10", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("translate-x-10", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
