import {writable} from "svelte/store";

export let isDark = writable(false);
export function toggleTheme() {
  isDark.update(prev=>!prev);
}
