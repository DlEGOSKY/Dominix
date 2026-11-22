const TUTORIAL_KEY="dominix_tutorial_done";
export function isTutorialComplete():boolean {try{return localStorage.getItem(TUTORIAL_KEY)==="1";}catch{return false;}}
export function markTutorialComplete():boolean {try{localStorage.setItem(TUTORIAL_KEY,"1");return true;}catch{return false;}}
export function resetTutorial():void {try{localStorage.removeItem(TUTORIAL_KEY);}catch{/* Practice remains available in How to play. */}}
