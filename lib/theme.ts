export const THEME_KEY = "zk-theme";

/** Background patterns on trial. `?bg=<name>` picks one and remembers it; `?bg=none` turns it off. */
export const BACKGROUNDS = ["nodes", "squares", "arcs", "flow", "cubes"] as const;

const bgScript = `try{var q=new URLSearchParams(location.search).get("bg");if(q)localStorage.setItem("zk-bg",q);var b=localStorage.getItem("zk-bg")||"nodes";if(${JSON.stringify(BACKGROUNDS)}.indexOf(b)>-1)document.documentElement.dataset.bg=b}catch(e){}`;

/** Runs before paint so a saved dark choice (and the background pattern) doesn't flash in late. */
export const themeScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}${bgScript}`;
