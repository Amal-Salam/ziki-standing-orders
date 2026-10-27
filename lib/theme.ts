export const THEME_KEY = "zk-theme";

/** Runs before paint so a saved dark choice doesn't flash light first. */
export const themeScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
