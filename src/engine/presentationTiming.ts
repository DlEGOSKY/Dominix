export function roundTransitionTiming(boss: boolean, fast: boolean, reduced: boolean) {
  if (reduced) return {hold:0,exit:0};
  return boss ? {hold:fast?400:850,exit:fast?100:180} : {hold:fast?180:400,exit:fast?80:150};
}
