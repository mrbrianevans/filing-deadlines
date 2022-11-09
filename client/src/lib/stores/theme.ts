import {writable} from "svelte/store";

// could be replaced with $colorScheme from 'svelteuidev/core'
export let isDark = writable(false);
export function toggleTheme() {
  isDark.update(prev=>!prev);
}
