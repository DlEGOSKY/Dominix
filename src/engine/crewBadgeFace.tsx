import { CollectionPortrait } from "./collectionPortraits";

const PIPS = [[], [[50,86]], [[30,80],[70,92]], [[30,80],[50,86],[70,92]], [[30,80],[70,80],[30,92],[70,92]], [[30,80],[70,80],[50,86],[30,92],[70,92]], [[30,80],[50,80],[70,80],[30,92],[50,92],[70,92]]];

/** The enamel is the playing face; exact pips stay independent of generated art. */
export function CrewBadgeFace({ value, comparisonAtlas }: { value: number; comparisonAtlas?: string }) {
  return <span data-numeric-face="among_us" data-face-value={value} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: 3, background: "#0c1530" }}>
    <span data-crew-portrait style={{ position: "absolute", inset: 0 }}>{comparisonAtlas ? <span data-crew-value={value} style={{ display:"block",width:"100%",height:"100%",backgroundImage:`url(${comparisonAtlas})`,backgroundSize:"700% 100%",backgroundPosition:`${value/6*100}% 0` }}/> : <CollectionPortrait collection="among_us" value={value}/>}</span>
    {value === 0 ? <span data-empty-value style={{ position: "absolute", top: "86%", left: "42%", width: "16%", height: 1, background: "#93b3cd" }}/>
      : PIPS[value]!.map(([x,y], i) => <span key={i} data-value-mark="signal" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: "9%", height: "9%", transform: "translate(-50%,-50%)", background: "#f1ebce", borderRadius: "50%", boxShadow: "inset 0 1px 1px #fff9,0 0 0 1px #071324" }}/>) }
  </span>;
}
