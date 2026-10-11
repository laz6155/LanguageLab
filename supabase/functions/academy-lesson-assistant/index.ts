// LanguageLab Academy only. Rule-based teacher pack generator, not a third-party LLM.
// Does not replace the old Speaking Club educator-assistant function.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

const LEVEL_SUPPORT: Record<string,string> = {
  "Pre-A1":"Use single words, chunks and one very short model sentence.",
  "A1":"Use short, concrete sentences and visible language support.",
  "A2":"Use 2–4 sentence answers and ask one simple follow-up.",
  "B1":"Explain opinions, give reasons and add a real-life example.",
  "B2":"Develop ideas, compare perspectives and justify choices.",
  "C1":"Make nuanced claims, qualify evidence, compare competing explanations and respond to counter-arguments.",
  "C2":"Synthesize complex, potentially conflicting positions; examine implicit assumptions and communicate precise concessions."
};

const TOPIC_BANKS = [
  {keys:["travel","trip","holiday","tourism","journey"], words:["destination","booking","luggage","departure","accommodation","itinerary","local","explore"]},
  {keys:["food","meal","restaurant","cooking","kitchen"], words:["ingredient","recipe","portion","flavour","healthy","order","recommend","traditional"]},
  {keys:["school","education","class","study","exam"], words:["assignment","deadline","subject","research","schedule","project","revise","feedback"]},
  {keys:["technology","internet","phone","computer","ai"], words:["device","privacy","screen","application","algorithm","message","digital","automation"]},
  {keys:["work","career","job","office"], words:["deadline","colleague","schedule","task","responsibility","meeting","skill","feedback"]},
  {keys:["health","sport","fitness","exercise"], words:["routine","energy","habit","balanced","recover","active","goal","progress"]},
  {keys:["environment","nature","climate"], words:["waste","energy","protect","reduce","recycle","resource","pollution","sustainable"]}
];

function safeText(v: unknown, max=180){
  return String(v ?? "").trim().replace(/[<>]/g,"").slice(0,max);
}
function pickWords(topic:string){
  const t=topic.toLowerCase();
  const found=TOPIC_BANKS.find(b=>b.keys.some(k=>t.includes(k)));
  return found?.words ?? ["experience","choice","reason","example","challenge","solution","opinion","improve"];
}
function minutes(total:number, weights:number[]){
  const raw=weights.map(w=>Math.max(2,Math.floor(total*w)));
  let diff=total-raw.reduce((a,b)=>a+b,0);
  let i=0;
  while(diff>0){ raw[i%raw.length]++; diff--; i++; }
  while(diff<0){
    const idx=raw.findIndex(x=>x>2);
    if(idx<0) break;
    raw[idx]--; diff++;
  }
  return raw;
}
function questionSet(topic:string, level:string){
  if(level==="C1"||level==="C2")return [
    `Which assumptions shape the usual debate about ${topic}?`,
    `Under what conditions might your preferred argument about ${topic} be wrong?`,
    `Whose perspective is most often overlooked in discussions of ${topic}, and why?`,
    `What evidence would most seriously challenge your initial view of ${topic}?`,
    `How would you reach a cautious, balanced conclusion about ${topic}?`
  ];
  const harder=level==="B1"||level==="B2";
  return [
    `What do you already know about ${topic}?`,
    `What is one useful example of ${topic} in real life?`,
    `What is one advantage and one disadvantage connected with ${topic}?`,
    harder ? `How might different people have different opinions about ${topic}?` : `What do you like or dislike about ${topic}? Why?`,
    harder ? `What would you change or improve about ${topic}, and why?` : `What would you like to learn next about ${topic}?`
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers:cors});
  if (req.method !== "POST") return new Response(JSON.stringify({error:"METHOD_NOT_ALLOWED"}), {status:405,headers:cors});

  try {
    const body = await req.json().catch(()=>({}));
    const topic=safeText(body.topic || "daily life",100) || "daily life";
    const level=["Pre-A1","A1","A2","B1","B2","C1","C2"].includes(body.level) ? body.level : "A2";
    const age=safeText(body.age_group || "12-14",30) || "12-14";
    const goal=["speaking","vocabulary","grammar","mixed"].includes(body.goal) ? body.goal : "speaking";
    const context=safeText(body.context || "",500);
    const duration=Math.max(20,Math.min(120,Number(body.duration)||40));
    const classSize=Math.max(1,Math.min(80,Number(body.class_size)||8));
    const words=pickWords(topic);
    const qs=questionSet(topic,level);
    const support=LEVEL_SUPPORT[level] || LEVEL_SUPPORT.A2;
    const advanced=level==='C1'||level==='C2';
    const mins=minutes(duration,[.12,.22,.18,.36,.12]);

    const game = advanced
      ? {name:"Role Play",instructions:"Assign distinct stakeholder roles. Require evidence, a concession and a balanced summary.",prompt:qs[2]}
      : goal==="grammar"
      ? {name:"Error Hunter",instructions:"Show a sentence related to the topic with one mistake. Students correct it and explain the rule.",prompt:`Create a short incorrect sentence about ${topic} using today's target language.`}
      : goal==="vocabulary"
      ? {name:"Taboo",instructions:"One student explains the target word without saying the forbidden clues.",prompt:`Use these target words: ${words.slice(0,6).join(", ")}.`}
      : {name:"Speaking Wheel",instructions:"Students answer one prompt, then ask a follow-up before the next round.",prompt:qs[2]};

    const grammarFocus = level==="Pre-A1"||level==="A1"
      ? "simple present + can/can't"
      : level==="A2"
      ? "comparatives + because / so"
      : level==="B1"
      ? "first/second conditional + linking words"
      : level==="B2"
      ? "hedging + contrast + complex conditionals"
      : level==="C1"
      ? "concessive clauses + cautious claims + discourse framing"
      : "precise rhetorical stance + synthesis + complex concession";

    const plan=[
      {stage:"WARM-UP",title:"Activate the topic",duration:`${mins[0]} min`,mode:"Whole class",prompt:qs[0]},
      {stage:"VOCABULARY",title:"Build useful language",duration:`${mins[1]} min`,mode:classSize<=4?"Teacher + learner":"Pairs / board",prompt:`Teach and recycle: ${words.slice(0,6).join(", ")}.`},
      {stage:"PRACTICE GAME",title:game.name,duration:`${mins[2]} min`,mode:"Optional teams",prompt:game.prompt},
      {stage:"SPEAKING",title:"Guided to freer speaking",duration:`${mins[3]} min`,mode:classSize===1?"1-to-1":classSize<=4?"Pairs":"Pairs / groups",prompt:qs[3]},
      {stage:"EXIT",title:"Check + next step",duration:`${mins[4]} min`,mode:"Individual",prompt:`Use one new word and give one final idea about ${topic}.`}
    ];

    const worksheet=advanced ? [
      `Identify three hidden assumptions in a position about ${topic}.`,
      `Write a qualified claim and a counter-argument using cautious language.`,
      `Develop a brief evidence standard: which data would change your view?`,
      `Synthesize two stakeholder perspectives without caricaturing either one.`,
      `Exit ticket: explain one limitation of your strongest argument.`
    ] : [
      `Match 6 target words to short definitions: ${words.slice(0,6).join(", ")}.`,
      `Complete 5 topic sentences using the target vocabulary.`,
      `Language focus: ${grammarFocus}. Write 4 short contextual examples.`,
      `Answer two speaking prompts in notes before speaking: “${qs[1]}” and “${qs[2]}”`,
      `Exit ticket: write one new phrase you can use again.`
    ];

    const homework=advanced ? [
      `Prepare a two-minute oral synthesis on ${topic} with two competing perspectives.`,
      `Write 180–250 words responding to “${qs[4]}”, including one concession and one limitation.`,
      `Record one precise follow-up question you would ask someone who disagrees.`
    ] : [
      `Review the 6 target words and write one original sentence for each.`,
      `Answer “${qs[4]}” in 80–120 words or a 60–90 second voice note.`,
      `Prepare two questions to ask a partner in the next lesson.`
    ];

    const pack={
      engine:"smart-rules-v2",
      title:`${topic} · ${level} ${goal.charAt(0).toUpperCase()+goal.slice(1)} Lesson`,
      topic,level,age_group:age,duration_minutes:duration,goal,class_size:classSize,
      objective: goal==="mixed"
        ? `Students will use topic vocabulary, controlled language and spoken interaction around ${topic}.`
        : `Students will improve ${goal} through a practical lesson about ${topic}.`,
      teacher_note: `${context?context+' ':''}Keep instructions clear, model a response, and maximise student talking time. ${support}`,
      success_criteria:advanced?["State a qualified claim","Address a substantial counter-argument","Use a concrete example or an evidence standard","Synthesize a balanced conclusion"]:["Complete the communication task","Use the target language clearly","Respond to one follow-up question"],
      reflection_prompt:advanced?"Which assumption or evidence changed your position?":"Which phrase could you use again in your next conversation?",
      target_vocabulary:words,
      language_focus:grammarFocus,
      plan,
      speaking_questions:qs,
      worksheet,
      homework,
      game,
      differentiation:{
        support:`For learners who need support: ${support}`,
        stretch: level==="B1"||level==="B2"||level==="C1"||level==="C2"
          ? "Ask for evidence, counter-arguments and one follow-up question."
          : "Ask for one reason, one example and one follow-up question."
      }
    };

    return new Response(JSON.stringify({ok:true,pack}), {status:200,headers:cors});
  } catch (error) {
    return new Response(JSON.stringify({ok:false,error:String(error?.message||error)}), {status:400,headers:cors});
  }
});
