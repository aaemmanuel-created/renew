import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

// ─── Neural Network Simulation ───
// Joshua 1:8 — "This Book of the Law shall not depart from your mouth..."

// ─── Load JetBrains Mono + Inter ───
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@200;300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('link[href*="JetBrains+Mono"]')) {
  document.head.appendChild(fontLink);
}

const FONT = "'JetBrains Mono', monospace";
const FONT_BODY = "'Inter', -apple-system, sans-serif"; // For scripture text & body copy

// ─── Inject CSS Keyframe Animations ───
const STYLE_ID = "renew-keyframes";
if (!document.getElementById(STYLE_ID)) {
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    /* ── Silk-smooth easing curves ── */
    /* Soft deceleration — like settling into place */
    /* cubic-bezier(0.22, 1, 0.36, 1) = smooth overshoot-free ease-out */
    /* cubic-bezier(0.0, 0, 0.2, 1)  = Material-style decelerate */

    @keyframes renewFadeInUp {
      0% {
        opacity: 0;
        transform: translateY(22px) scale(0.98);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
      }
    }
    @keyframes renewFadeIn {
      0% { opacity: 0; filter: blur(4px); }
      100% { opacity: 1; filter: blur(0px); }
    }
    @keyframes renewBreathe {
      0%, 100% { opacity: 0.25; }
      50% { opacity: 0.55; }
    }
    @keyframes renewPulseGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(124, 106, 255, 0.12), 0 0 50px rgba(124, 106, 255, 0.04); }
      50% { box-shadow: 0 0 28px rgba(124, 106, 255, 0.22), 0 0 60px rgba(124, 106, 255, 0.08); }
    }
    @keyframes renewStatusPulse {
      0%, 100% { opacity: 0.65; }
      50% { opacity: 1; }
    }
    @keyframes renewStaggerIn {
      0% {
        opacity: 0;
        transform: translateY(14px) scale(0.98);
        filter: blur(4px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
      }
    }
    @keyframes renewShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes renewStreakFlicker {
      0%, 100% { opacity: 0.7; text-shadow: 0 0 4px rgba(251,146,60,0.3); }
      25% { opacity: 0.9; text-shadow: 0 0 8px rgba(251,146,60,0.5); }
      50% { opacity: 1; text-shadow: 0 0 12px rgba(251,146,60,0.6); }
      75% { opacity: 0.85; text-shadow: 0 0 6px rgba(251,146,60,0.4); }
    }
    @keyframes renewLogoEntrance {
      0% {
        opacity: 0;
        transform: scale(0.6) translateY(12px);
        filter: blur(10px);
      }
      60% {
        opacity: 0.8;
        transform: scale(1.03) translateY(-1px);
        filter: blur(1px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: blur(0px);
      }
    }
    @keyframes renewDividerGrow {
      0% { width: 0; opacity: 0; }
      100% { width: 32px; opacity: 1; }
    }
    @keyframes renewCountUp {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(0.95);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
      }
    }
    /* Soft float-in for screen transitions */
    @keyframes renewScreenEnter {
      0% {
        opacity: 0;
        transform: translateY(12px);
        filter: blur(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0px);
      }
    }
    /* Noise texture overlay */
    .renew-noise::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 256px 256px;
      pointer-events: none;
      z-index: 1;
    }
    /* Button tap feedback — silk-smooth */
    .renew-btn-tap {
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, opacity 0.3s ease;
      will-change: transform;
    }
    .renew-btn-tap:active { transform: scale(0.96) !important; }
    /* Smooth scrolling for passage lists */
    .renew-smooth-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
    /* Screen transitions — silk float-in */
    .renew-screen-enter {
      animation: renewScreenEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
  `;
  document.head.appendChild(styleEl);
}

// ─── Palette: pure black + cool accents ───
const P = {
  black: "#000000",
  bg: "#000000",
  surface: "#0A0A0A",
  card: "#0D0D0D",
  cardBorder: "#1A1A1A",
  cardHover: "#141414",
  white: "#FFFFFF",
  text: "#E8E8E8",
  textSoft: "#888888",
  textDim: "#444444",
  textGhost: "#2A2A2A",
  // Accent: cool blue-violet neural
  accent: "#7C6AFF",
  accentSoft: "#6355D8",
  accentGlow: "rgba(124, 106, 255, 0.15)",
  // Fire / speaking
  fire: "#C084FC",
  fireGlow: "rgba(192, 132, 252, 0.12)",
  // Synapse
  synapse: "#4F46E5",
  synapseGlow: "#818CF8",
  // Neuron
  neuronCore: "#A5B4FC",
  neuronFire: "#E0CBFF",
  // Streak
  streak: "#FB923C",
  streakGlow: "rgba(251, 146, 60, 0.1)",
  // Danger
  danger: "#EF4444",
};

// ─── Pillar Color Palettes ───
// Each pillar has a distinct color temperature for neural network rendering
// PERSON = rose-violet (warm), VEHICLE = blue-indigo (cool), ASSIGNMENT = white-gold (bright)
const PILLAR_COLORS = {
  DEFAULT: {
    fog: [124, 106, 255],
    deep: [79, 70, 229],
    bright: [220, 215, 255],
    mid: [200, 195, 255],
    soft: [180, 175, 240],
    dim: [120, 110, 200],
    fire: [192, 132, 252],
    soma: [240, 237, 255],
  },
  PERSON: {
    fog: [210, 120, 175],
    deep: [140, 60, 115],
    bright: [245, 210, 235],
    mid: [225, 185, 215],
    soft: [210, 165, 200],
    dim: [155, 95, 140],
    fire: [240, 155, 210],
    soma: [255, 240, 248],
  },
  VEHICLE: {
    fog: [80, 110, 245],
    deep: [45, 55, 185],
    bright: [195, 210, 255],
    mid: [165, 185, 255],
    soft: [140, 160, 240],
    dim: [80, 95, 195],
    fire: [125, 160, 252],
    soma: [238, 242, 255],
  },
  ASSIGNMENT: {
    fog: [220, 190, 110],
    deep: [140, 115, 55],
    bright: [250, 238, 200],
    mid: [235, 215, 170],
    soft: [215, 195, 150],
    dim: [155, 135, 85],
    fire: [245, 215, 130],
    soma: [255, 250, 238],
  },
};

function getPillarColors(pillar) {
  return PILLAR_COLORS[pillar] || PILLAR_COLORS.DEFAULT;
}

// ─── Performance: pre-computed RGBA prefix strings per palette ───
// Avoids thousands of template literal allocations per frame.
// Usage: `${pc.fogRGB}${alpha})` instead of `rgba(${pc.fog[0]}, ${pc.fog[1]}, ${pc.fog[2]}, ${alpha})`
const PILLAR_CACHE = {};
function getPillarCached(pillar) {
  const key = pillar || 'DEFAULT';
  if (PILLAR_CACHE[key]) return PILLAR_CACHE[key];
  const pc = getPillarColors(pillar);
  const cached = { ...pc };
  for (const k of Object.keys(pc)) {
    const v = pc[k];
    if (Array.isArray(v)) {
      cached[k + 'RGB'] = `rgba(${v[0]}, ${v[1]}, ${v[2]}, `;
    }
  }
  PILLAR_CACHE[key] = cached;
  return cached;
}

// ─── Scripture Library ───
// Three pillars: Person (who you are), Vehicle (how you move), Assignment (what you're called to)
const SCRIPTURE_CATEGORIES = [
  {
    name: "PERSON",
    subtitle: "this is you",
    icon: "\u{1FA9E}",
    passages: [
      // Identity
      { ref: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
      { ref: "1 Peter 2:9", text: "But you are a chosen race, a royal priesthood, a holy nation, a people for his own possession, that you may proclaim the excellencies of him who called you out of darkness into his marvelous light." },
      { ref: "John 1:12", text: "But to all who did receive him, who believed in his name, he gave the right to become children of God." },
      { ref: "Galatians 2:20", text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me." },
      // Purpose
      { ref: "Ephesians 2:10", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them." },
      { ref: "Jeremiah 1:5", text: "Before I formed you in the womb I knew you, and before you were born I consecrated you; I appointed you a prophet to the nations." },
      { ref: "Colossians 3:3", text: "For you have died, and your life is hidden with Christ in God." },
      // Spirit
      { ref: "Romans 8:16", text: "The Spirit himself bears witness with our spirit that we are children of God." },
      { ref: "John 4:24", text: "God is spirit, and those who worship him must worship in spirit and truth." },
      { ref: "1 Corinthians 2:12", text: "Now we have received not the spirit of the world, but the Spirit who is from God, that we might understand the things freely given us by God." },
      // Soul
      { ref: "Psalm 139:14", text: "I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well." },
      { ref: "Psalm 42:1-2", text: "As a deer pants for flowing streams, so pants my soul for you, O God. My soul thirsts for God, for the living God." },
      { ref: "3 John 1:2", text: "Beloved, I pray that all may go well with you and that you may be in good health, as it goes well with your soul." },
      // Body
      { ref: "1 Corinthians 6:19-20", text: "Do you not know that your body is a temple of the Holy Spirit within you, whom you have from God? You are not your own, for you were bought with a price. So glorify God in your body." },
      { ref: "Romans 12:1", text: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship." },
      // Spirit, Soul & Body
      { ref: "1 Thessalonians 5:23", text: "Now may the God of peace himself sanctify you completely, and may your whole spirit and soul and body be kept blameless at the coming of our Lord Jesus Christ." },
      // Praise & Worship
      { ref: "Psalm 146:1-2", text: "Praise the Lord! Praise the Lord, O my soul! I will praise the Lord as long as I live; I will sing praises to my God while I have my being." },
      // Peace & Mind
      { ref: "Isaiah 26:3", text: "You keep him in perfect peace whose mind is stayed on you, because he trusts in you." },
      { ref: "Isaiah 26:7", text: "The path of the righteous is level; you make level the way of the righteous." },
      // Character & Conduct
      { ref: "James 1:19-21", text: "Know this, my beloved brothers: let every person be quick to hear, slow to speak, slow to anger; for the anger of man does not produce the righteousness of God. Therefore put away all filthiness and rampant wickedness and receive with meekness the implanted word, which is able to save your souls." },
    ]
  },
  {
    name: "VEHICLE",
    subtitle: "this is the structure God gives",
    icon: "\u{1F54A}\u{FE0F}",
    passages: [
      // Provision
      { ref: "Philippians 4:19", text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus." },
      { ref: "Psalm 23:1-4", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
      { ref: "Deuteronomy 8:18", text: "You shall remember the Lord your God, for it is he who gives you power to get wealth, that he may confirm his covenant that he swore to your fathers, as it is this day." },
      { ref: "2 Corinthians 9:8", text: "And God is able to make all grace abound to you, so that having all sufficiency in all things at all times, you may abound in every good work." },
      { ref: "Malachi 3:10", text: "Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need." },
      // Resources & Strength
      { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
      { ref: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
      { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
      // Systems & Structures
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
      { ref: "Proverbs 24:3-4", text: "By wisdom a house is built, and by understanding it is established; by knowledge the rooms are filled with all precious and pleasant riches." },
      { ref: "1 Corinthians 14:40", text: "But all things should be done decently and in order." },
      { ref: "Habakkuk 2:2", text: "And the Lord answered me: Write the vision; make it plain on tablets, so he may run who reads it." },
      // Government & Authority
      { ref: "Romans 13:1", text: "Let every person be subject to the governing authorities. For there is no authority except from God, and those that exist have been instituted by God." },
      { ref: "Proverbs 29:2", text: "When the righteous increase, the people rejoice, but when the wicked rule, the people groan." },
      { ref: "Isaiah 9:6-7", text: "For to us a child is born, to us a son is given; and the government shall be upon his shoulder, and his name shall be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace. Of the increase of his government and of peace there will be no end." },
      { ref: "Psalm 75:6-7", text: "For not from the east or from the west and not from the wilderness comes lifting up, but it is God who executes judgment, putting down one and lifting up another." },
      // Faith & Trust
      { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
      { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
    ]
  },
  {
    name: "ASSIGNMENT",
    subtitle: "this is the mission God gives",
    icon: "\u{1F525}",
    passages: [
      // God's Plan & Purpose
      { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
      { ref: "Proverbs 19:21", text: "Many are the plans in the mind of a man, but it is the purpose of the Lord that will stand." },
      { ref: "Isaiah 46:10", text: "Declaring the end from the beginning and from ancient times things not yet done, saying, My counsel shall stand, and I will accomplish all my purpose." },
      { ref: "Psalm 138:8", text: "The Lord will fulfill his purpose for me; your steadfast love, O Lord, endures forever. Do not forsake the work of your hands." },
      { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
      // Times & Seasons
      { ref: "Ecclesiastes 3:1", text: "For everything there is a season, and a time for every matter under heaven." },
      { ref: "Acts 1:7", text: "He said to them, It is not for you to know times or seasons that the Father has fixed by his own authority." },
      { ref: "Habakkuk 2:3", text: "For still the vision awaits its appointed time; it hastens to the end -- it will not lie. If it seems slow, wait for it; it will surely come; it will not delay." },
      { ref: "Psalm 31:15", text: "My times are in your hand; rescue me from the hand of my enemies and from my persecutors!" },
      { ref: "Galatians 6:9", text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up." },
      { ref: "Isaiah 60:22", text: "The least one shall become a clan, and the smallest one a mighty nation; I am the Lord; in its time I will hasten it." },
      // Mission & Calling
      { ref: "Joshua 1:8-9", text: "This Book of the Law shall not depart from your mouth, but you shall meditate on it day and night, so that you may be careful to do according to all that is written in it. For then you will make your way prosperous, and then you will have good success. Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
      { ref: "Matthew 28:19-20", text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age." },
      { ref: "Isaiah 6:8", text: "And I heard the voice of the Lord saying, Whom shall I send, and who will go for us? Then I said, Here I am! Send me." },
      { ref: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?" },
      // Courage & Strength for the Assignment
      { ref: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control." },
      { ref: "Ephesians 6:10-11", text: "Finally, be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the schemes of the devil." },
      { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you." },
      { ref: "Esther 4:14", text: "For if you keep silent at this time, relief and deliverance will rise for the Jews from another place, but you and your father's house will perish. And who knows whether you have not come to the kingdom for such a time as this?" },
    ]
  },
];

// ─── Neuron / Synapse ───
class Neuron {
  constructor(x, y, id, pillar) {
    this.id = id; this.x = x; this.y = y;
    this.pillar = pillar || null;
    this.vx = (Math.random() - 0.5) * 0.04;
    this.vy = (Math.random() - 0.5) * 0.04;
    this.radius = 5 + Math.random() * 4; // larger soma like microscopy
    this.energy = 0.15; this.fireLevel = 0; this.totalFired = 0;
    this.connections = []; this.pulsePhase = Math.random() * Math.PI * 2; this.maturity = 0;
    // Irregular cell body shape — 10 vertices with noise for organic soma
    this.bodyShape = Array.from({length: 10}, (_, i) => ({
      angle: (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.2,
      r: 0.7 + Math.random() * 0.6, // radius multiplier 0.7-1.3
    }));
    // Radiating neurites — starburst pattern like real microscopy
    // One axon (longest) + many shorter dendrites
    const numNeurites = 8 + Math.floor(Math.random() * 7); // 8-14 radiating arms
    const axonIdx = Math.floor(Math.random() * numNeurites);
    this.dendrites = Array.from({length: numNeurites}, (_, i) => {
      const isAxon = i === axonIdx;
      // Distribute angles evenly with jitter for natural starburst
      const baseAngle = (i / numNeurites) * Math.PI * 2;
      const angle = baseAngle + (Math.random() - 0.5) * 0.6;
      // Axon is significantly longer
      const length = isAxon
        ? 60 + Math.random() * 80   // axon: 60-140px
        : 20 + Math.random() * 55;  // dendrites: 20-75px
      const curve1 = (Math.random() - 0.5) * 25;
      const curve2 = (Math.random() - 0.5) * 18;
      // Sub-branches — axon gets more, dendrites sometimes branch
      const numBranches = isAxon
        ? 1 + Math.floor(Math.random() * 3)   // axon: 1-3 branches
        : (Math.random() < 0.45 ? 1 + Math.floor(Math.random() * 2) : 0);
      const branches = Array.from({length: numBranches}, () => ({
        t: 0.25 + Math.random() * 0.55,
        angle: angle + (Math.random() - 0.5) * 1.4,
        length: 10 + Math.random() * 30,
        curve: (Math.random() - 0.5) * 18,
      }));
      // Growth cone at tip — small bulb for "reaching" effect
      const growthCone = {
        size: isAxon ? 1.2 + Math.random() * 1.0 : 0.6 + Math.random() * 0.8,
        filopodia: Array.from({length: 2 + Math.floor(Math.random() * 3)}, () => ({
          angle: angle + (Math.random() - 0.5) * 1.5,
          length: 4 + Math.random() * 10,
        })),
      };
      return {
        angle, length, curve1, curve2, branches, growthCone, isAxon,
        width: isAxon ? 0.9 + Math.random() * 0.6 : 0.4 + Math.random() * 0.7,
      };
    });
    // Internal membrane blobs for organic cell body
    this.membraneBlobs = Array.from({length: 2 + Math.floor(Math.random() * 3)}, () => ({
      dx: (Math.random() - 0.5) * 0.55,
      dy: (Math.random() - 0.5) * 0.55,
      size: 0.25 + Math.random() * 0.4,
      opacity: 0.06 + Math.random() * 0.12,
    }));
  }
}
class Synapse {
  constructor(fromId, toId, id) {
    this.id = id; this.from = fromId; this.to = toId;
    this.strength = 0.02; this.activity = 0; this.pulsePos = -1;
    this.totalPulses = 0; this.width = 0.4;
    // Curved organic synapse — bezier control point offset
    this.cx = (Math.random() - 0.5) * 60;
    this.cy = (Math.random() - 0.5) * 60;
    // Taper: width multiplier at start vs end
    this.taperStart = 0.8 + Math.random() * 0.6; // thicker near soma
    this.taperEnd = 0.15 + Math.random() * 0.25;  // thinner at endpoint
    // Animated connection formation — "reaching moment"
    this.forming = true;     // synapse is still growing/reaching
    this.formProgress = 0;   // 0 to 1 animation progress
  }
}

function createInitialState(w, h, pillar) {
  const n = new Neuron(w / 2, h / 2, 0, pillar);
  n.energy = 0.85; n.maturity = 1; n.radius = 8;
  // Start as a bare cell — no dendrites yet. They grow as you speak.
  n.dendrites = [];
  return { neurons: [n], synapses: [], nextId: 1, totalSpeakTime: 0, sessionFires: 0 };
}

// Grow a new dendrite on a neuron — called gradually during speaking
function growDendrite(neuron) {
  const existing = neuron.dendrites.length;
  const maxDendrites = 10 + Math.floor(Math.random() * 5); // cap at 10-14
  if (existing >= maxDendrites) return;
  // First dendrite is the axon (longest)
  const isAxon = existing === 0;
  // Distribute angle away from existing dendrites
  let angle;
  if (existing === 0) {
    angle = Math.random() * Math.PI * 2;
  } else {
    // Find the largest gap between existing dendrite angles
    const angles = neuron.dendrites.map(d => d.angle).sort((a, b) => a - b);
    let bestGap = 0, bestMid = Math.random() * Math.PI * 2;
    for (let i = 0; i < angles.length; i++) {
      const next = i < angles.length - 1 ? angles[i + 1] : angles[0] + Math.PI * 2;
      const gap = next - angles[i];
      if (gap > bestGap) { bestGap = gap; bestMid = angles[i] + gap / 2; }
    }
    angle = bestMid + (Math.random() - 0.5) * 0.4;
  }
  const length = isAxon
    ? 70 + Math.random() * 90
    : 20 + Math.random() * 55;
  const curve1 = (Math.random() - 0.5) * 25;
  const curve2 = (Math.random() - 0.5) * 18;
  const numBranches = isAxon
    ? 1 + Math.floor(Math.random() * 3)
    : (Math.random() < 0.45 ? 1 + Math.floor(Math.random() * 2) : 0);
  const branches = Array.from({length: numBranches}, () => ({
    t: 0.25 + Math.random() * 0.55,
    angle: angle + (Math.random() - 0.5) * 1.4,
    length: 10 + Math.random() * 30,
    curve: (Math.random() - 0.5) * 18,
  }));
  const growthCone = {
    size: isAxon ? 1.2 + Math.random() * 1.0 : 0.6 + Math.random() * 0.8,
    filopodia: Array.from({length: 2 + Math.floor(Math.random() * 3)}, () => ({
      angle: angle + (Math.random() - 0.5) * 1.5,
      length: 4 + Math.random() * 10,
    })),
  };
  const dendrite = {
    angle, length: 0, targetLength: length, // starts at 0, grows to targetLength
    curve1, curve2, branches, growthCone, isAxon,
    width: isAxon ? 0.9 + Math.random() * 0.6 : 0.4 + Math.random() * 0.7,
  };
  neuron.dendrites.push(dendrite);
}
function dst(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

// ─── Bezier helper (outside render loop to avoid per-frame closure allocation) ───
function bezPt(p0x, p0y, cpx, cpy, p1x, p1y, t) {
  const mt = 1 - t;
  return [mt * mt * p0x + 2 * mt * t * cpx + t * t * p1x, mt * mt * p0y + 2 * mt * t * cpy + t * t * p1y];
}

function addNeuron(state, w, h, pillar) {
  const id = state.nextId++;
  const parent = state.neurons[Math.floor(Math.random() * state.neurons.length)];
  const ang = Math.random() * Math.PI * 2;
  const d = 55 + Math.random() * 95;
  const neuron = new Neuron(
    Math.max(35, Math.min(w - 35, parent.x + Math.cos(ang) * d)),
    Math.max(75, Math.min(h - 95, parent.y + Math.sin(ang) * d)), id, pillar
  );
  neuron.dendrites = []; // Start bare — dendrites grow organically as you speak
  state.neurons.push(neuron);
  const sId = state.nextId++;
  state.synapses.push(new Synapse(parent.id, neuron.id, sId));
  parent.connections.push(sId); neuron.connections.push(sId);
  for (const o of state.neurons) {
    if (o.id !== id && o.id !== parent.id && dst(o, neuron) < 130 && Math.random() < 0.4) {
      const s2 = state.nextId++;
      state.synapses.push(new Synapse(o.id, neuron.id, s2));
      o.connections.push(s2); neuron.connections.push(s2); break;
    }
  }
  return neuron;
}

function fireNeuron(state, neuron, sMap) {
  neuron.fireLevel = 0.5; neuron.totalFired++;
  neuron.energy = Math.min(1, neuron.energy + 0.003);
  state.sessionFires++;
  for (const sid of neuron.connections) {
    const s = sMap ? sMap.get(sid) : state.synapses.find(x => x.id === sid);
    if (s && !s.forming) { // only fire through formed connections
      s.pulsePos = s.from === neuron.id ? 0 : 1;
      s.activity = 0.4;
      s.strength = Math.min(1, s.strength + 0.0005);
      s.totalPulses++;
      s.width = Math.min(1.8, 0.3 + s.totalPulses * 0.002);
    }
  }
}

function fmtTime(s) { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; }
function fmtShort(s) { if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s / 60)}m`; return `${(s / 3600).toFixed(1)}h`; }

// ─── Component ───
export default function Renew() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const particlesRef = useRef(null);  // Ambient void particles
  const breathPhaseRef = useRef(0);   // Global heartbeat rhythm
  const toneRef = useRef(null);
  const sessionStartRef = useRef({ neurons: 0, synapses: 0, dendrites: 0, speakTime: 0 });
  const lastGrowthRef = useRef(null);

  const [screen, setScreen] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customRef, setCustomRef] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [neuronCount, setNeuronCount] = useState(1);
  const [synapseCount, setSynapseCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ─── Per-passage persistent neural networks ───
  // Map: passage ref string → { neurons: [...serialized], synapses: [...serialized], nextId, totalSpeakTime }
  const passageNetworksRef = useRef({});

  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lifetimeSeconds, setLifetimeSeconds] = useState(0);
  const [lifetimeNeurons, setLifetimeNeurons] = useState(0);

  // Helper: check if first time (no sessions and no lifetime data)
  const isFirstTime = sessionHistory.length === 0 && lifetimeSeconds === 0;

  // Helper: get the passage key
  const getPassageKey = (p) => p ? (p.ref || "Custom") : "Custom";

  // Helper: save current sim state to the passage network store
  const saveCurrentNetwork = useCallback(() => {
    if (!stateRef.current || !selectedPassage) return;
    const key = getPassageKey(selectedPassage);
    passageNetworksRef.current[key] = JSON.parse(JSON.stringify(stateRef.current));
  }, [selectedPassage]);

  // Helper: load or create state for a passage
  const loadOrCreateNetwork = useCallback((passage, w, h, pillar) => {
    const key = getPassageKey(passage);
    const saved = passageNetworksRef.current[key];
    if (saved) {
      // Restore classes from plain objects — pillar is preserved in saved data
      const st = { ...saved };
      st.neurons = saved.neurons.map(n => Object.assign(new Neuron(n.x, n.y, n.id, n.pillar), n));
      st.synapses = saved.synapses.map(s => Object.assign(new Synapse(s.from, s.to, s.id), s));
      return st;
    }
    return createInitialState(w, h, pillar);
  }, []);

  // Helper: build combined state from all passage networks for home screen
  const buildCombinedState = useCallback((w, h) => {
    const all = Object.values(passageNetworksRef.current);
    if (all.length === 0) return createInitialState(w, h);

    const combined = { neurons: [], synapses: [], nextId: 0, totalSpeakTime: 0, sessionFires: 0 };
    let idOffset = 0;

    all.forEach((saved, groupIdx) => {
      const count = all.length;
      // Position each network's neurons in a region of the canvas
      const angle = (groupIdx / count) * Math.PI * 2 - Math.PI / 2;
      const cx = w / 2 + Math.cos(angle) * (count > 1 ? Math.min(w, h) * 0.22 : 0);
      const cy = h / 2 + Math.sin(angle) * (count > 1 ? Math.min(w, h) * 0.22 : 0);

      // Find center of saved neurons to compute offset
      let sx = 0, sy = 0;
      saved.neurons.forEach(n => { sx += n.x; sy += n.y; });
      sx /= saved.neurons.length || 1;
      sy /= saved.neurons.length || 1;
      const dx = cx - sx, dy = cy - sy;

      const idMap = {};
      saved.neurons.forEach(n => {
        const newId = n.id + idOffset;
        idMap[n.id] = newId;
        const nn = Object.assign(new Neuron(n.x + dx, n.y + dy, newId, n.pillar), n);
        nn.id = newId; nn.x = n.x + dx; nn.y = n.y + dy;
        nn.connections = [];
        combined.neurons.push(nn);
      });
      saved.synapses.forEach(s => {
        const newId = s.id + idOffset;
        const ns = Object.assign(new Synapse(idMap[s.from], idMap[s.to], newId), s);
        ns.id = newId; ns.from = idMap[s.from]; ns.to = idMap[s.to];
        combined.synapses.push(ns);
        // reconnect
        const fromN = combined.neurons.find(n => n.id === ns.from);
        const toN = combined.neurons.find(n => n.id === ns.to);
        if (fromN) fromN.connections.push(newId);
        if (toN) toN.connections.push(newId);
      });

      idOffset += saved.nextId + 1;
      combined.totalSpeakTime += saved.totalSpeakTime;
    });

    combined.nextId = idOffset + 1;
    return combined;
  }, []);

  const speakAccRef = useRef(0);
  const lastFireRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const resize = () => {
      c.width = c.parentElement.clientWidth;
      c.height = c.parentElement.clientHeight;
      if (!stateRef.current) stateRef.current = createInitialState(c.width, c.height);
      // Initialize ambient particle system
      if (!particlesRef.current) {
        particlesRef.current = Array.from({length: 40}, () => ({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: 0.5 + Math.random() * 1.5,
          opacity: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
        }));
      }
    };
    resize(); window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // When returning to non-session screens, load combined network or clear canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    if (screen === "home") {
      // Home screen: show faint ambient network if passages have been spoken
      const combined = buildCombinedState(c.width, c.height);
      if (combined.neurons.length > 1) {
        // Dim the network for ambient background effect
        combined.neurons.forEach(n => { n.energy = Math.max(0.08, n.energy * 0.3); n.fireLevel = 0; });
        stateRef.current = combined;
      } else {
        stateRef.current = { neurons: [], synapses: [], nextId: 0, totalSpeakTime: 0, sessionFires: 0 };
        const ctx2 = c.getContext("2d");
        if (ctx2) { ctx2.fillStyle = "#000000"; ctx2.fillRect(0, 0, c.width, c.height); }
      }
    } else if (screen === "summary" || screen === "history" || screen === "pick-category" || screen === "pick-passage" || screen === "custom") {
      const combined = buildCombinedState(c.width, c.height);
      if (combined.neurons.length > 0) {
        // Dim neurons slightly for background ambient effect
        if (screen !== "summary") {
          combined.neurons.forEach(n => { n.energy = Math.max(0.08, n.energy * 0.35); n.fireLevel = 0; });
        }
        stateRef.current = combined;
        setNeuronCount(combined.neurons.length);
        setSynapseCount(combined.synapses.length);
      }
    }
  }, [screen, buildCombinedState]);

  const initTone = useCallback(async () => {
    try {
      await Tone.start();
      const rev = new Tone.Reverb({ decay: 4, wet: 0.6 }).toDestination();
      const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.15, wet: 0.3 }).connect(rev);
      // Ambient drone — very soft, low, continuous
      const drone = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 2, decay: 0, sustain: 1, release: 3 },
        volume: -32,
      }).connect(rev);
      // Crystalline tone for neuron fires
      const fireSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.05, decay: 0.8, sustain: 0, release: 1.2 },
        volume: -28,
      }).connect(delay);
      // Harmonic for new connections forming
      const connectSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.3, decay: 1.5, sustain: 0, release: 2 },
        volume: -26,
      }).connect(rev);
      // Deeper tone for new neuron spawn
      const spawnSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.5, decay: 2, sustain: 0.1, release: 2 },
        volume: -24,
      }).connect(rev);
      // Start drone on a low note
      drone.triggerAttack("C2");
      toneRef.current = { drone, fireSynth, connectSynth, spawnSynth, rev, delay };
    } catch (e) {
      // Tone.js may not be available in preview environment — fail silently
      toneRef.current = null;
    }
  }, []);

  const disposeTone = useCallback(() => {
    if (toneRef.current) {
      const t = toneRef.current;
      try { t.drone.triggerRelease(); } catch {}
      setTimeout(() => {
        try {
          t.drone.dispose();
          t.fireSynth.dispose();
          t.connectSynth.dispose();
          t.spawnSynth.dispose();
          t.delay.dispose();
          t.rev.dispose();
        } catch {}
        toneRef.current = null;
      }, 3000); // let release tails fade
    }
  }, []);

  const startListening = useCallback(async (passage) => {
    const p = passage || selectedPassage;
    // Load existing network for this passage, or create new
    const c = canvasRef.current;
    if (c) {
      stateRef.current = loadOrCreateNetwork(p, c.width, c.height, selectedCategory?.name);
      setNeuronCount(stateRef.current.neurons.length);
      setSynapseCount(stateRef.current.synapses.length);
      setTotalTime(Math.floor(stateRef.current.totalSpeakTime || 0));
      speakAccRef.current = 0;
      // Capture session start snapshot
      sessionStartRef.current = {
        neurons: stateRef.current.neurons.length,
        synapses: stateRef.current.synapses.length,
        dendrites: stateRef.current.neurons.reduce((sum, n) => sum + n.dendrites.length, 0),
        speakTime: Math.floor(stateRef.current.totalSpeakTime || 0),
      };
    }
    setScreen("session");
    setPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const a = ctx.createAnalyser(); a.fftSize = 256; a.smoothingTimeConstant = 0.8;
      ctx.createMediaStreamSource(stream).connect(a);
      audioCtxRef.current = ctx; analyserRef.current = a;
      setIsListening(true);
      initTone();
    } catch { setPermissionDenied(true); }
  }, [selectedPassage, selectedCategory, loadOrCreateNetwork, initTone]);

  const stopListening = useCallback(() => {
    disposeTone();
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    audioCtxRef.current?.close(); audioCtxRef.current = null; analyserRef.current = null;
    setIsListening(false); setIsSpeaking(false); setVolume(0);
  }, [disposeTone]);

  const playEndSound = useCallback(() => {
    try {
      // Gentle descending chime — signals completion
      const t = toneRef.current;
      if (t && t.fireSynth) {
        t.fireSynth.triggerAttackRelease("E5", "8n", Tone.now());
        t.fireSynth.triggerAttackRelease("C5", "8n", Tone.now() + 0.12);
        t.fireSynth.triggerAttackRelease("G4", "4n", Tone.now() + 0.24);
      }
    } catch {}
  }, []);

  const endSession = useCallback(() => {
    playEndSound();
    // Small delay so the chime is heard before Tone disposes
    setTimeout(() => disposeTone(), 600);
    const dur = totalTime, nc = neuronCount, pc = synapseCount;
    // Capture ending stats and compute growth
    const endStats = {
      neurons: stateRef.current?.neurons.length || 0,
      synapses: stateRef.current?.synapses.length || 0,
      dendrites: stateRef.current?.neurons.reduce((sum, n) => sum + n.dendrites.length, 0) || 0,
    };
    const startStats = sessionStartRef.current;
    const grew = {
      neurons: endStats.neurons - startStats.neurons,
      synapses: endStats.synapses - startStats.synapses,
      dendrites: endStats.dendrites - startStats.dendrites,
      speakTime: dur - startStats.speakTime,
    };
    lastGrowthRef.current = grew;
    // Save this passage's neural network state
    saveCurrentNetwork();
    stopListening();
    if (dur >= 5) {
      const today = new Date().toISOString().slice(0, 10);
      const ref = selectedPassage ? selectedPassage.ref : (customRef || "Custom");
      setSessionHistory(prev => [...prev, { date: today, ref, duration: dur, neurons: nc, pathways: pc, grew }]);
      setLifetimeSeconds(prev => prev + dur); setLifetimeNeurons(prev => prev + nc);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak); if (newStreak > longestStreak) setLongestStreak(newStreak);
      setScreen("summary");
    } else { setScreen(selectedCategory ? "pick-passage" : "home"); }
  }, [totalTime, neuronCount, synapseCount, selectedPassage, selectedCategory, customRef, stopListening, saveCurrentNetwork, currentStreak, longestStreak, disposeTone, playEndSound]);

  // ─── Render loop ───
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); let run = true;
    const loop = () => {
      if (!run) return;
      const w = c.width, h = c.height, st = stateRef.current;
      if (!st) { animRef.current = requestAnimationFrame(loop); return; }
      const now = Date.now();

      // ─── Performance: build O(1) lookup maps once per frame ───
      const neuronMap = new Map();
      for (const n of st.neurons) neuronMap.set(n.id, n);
      const synapseMap = new Map();
      for (const s of st.synapses) synapseMap.set(s.id, s);

      // Derive session pillar from neurons for color identity
      const sessionPillar = (st.neurons.length > 0 && st.neurons[0].pillar) || null;
      const spc = getPillarCached(sessionPillar);
      let vol = 0;
      if (analyserRef.current) {
        const d = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(d);
        vol = d.reduce((a, b) => a + b, 0) / d.length / 255;
      }
      const spk = vol > 0.06;
      // Throttle React state updates — only update when values actually change
      if (Math.abs(vol - volume) > 0.015) setVolume(vol);
      if (spk !== isSpeaking) setIsSpeaking(spk);

      // Modulate drone volume based on voice
      if (toneRef.current && toneRef.current.drone) {
        try {
          const targetVol = spk ? -28 + vol * 8 : -35;
          toneRef.current.drone.volume.rampTo(targetVol, 0.3);
        } catch {}
      }

      // Gentle ambient firing on non-session screens (home/summary/history)
      const isSessionScreen = screen === "session";
      if (!isSessionScreen && st.neurons.length > 1 && Math.random() < 0.005) {
        const n = st.neurons[Math.floor(Math.random() * st.neurons.length)];
        n.fireLevel = Math.min(1, n.fireLevel + 0.4);
        for (const sid of n.connections) {
          const syn = synapseMap.get(sid);
          if (syn) { syn.activity = Math.min(1, syn.activity + 0.3); syn.pulsePos = syn.from === n.id ? 0 : 1; }
        }
      }

      if (spk && isSessionScreen) {
        speakAccRef.current += 1 / 60; st.totalSpeakTime += 1 / 60;
        const newTime = Math.floor(st.totalSpeakTime);
        if (newTime !== totalTime) setTotalTime(newTime);

        // Fire neurons — every 3-5 seconds, like a slow heartbeat
        if (now - lastFireRef.current > Math.max(3000, 5000 - vol * 2000)) {
          lastFireRef.current = now;
          fireNeuron(st, st.neurons[Math.floor(Math.random() * st.neurons.length)], synapseMap);
          // Sound: crystalline fire tone
          if (toneRef.current) {
            const notes = ["C5", "E5", "G5", "B5", "D6", "A5"];
            const note = notes[Math.floor(Math.random() * notes.length)];
            try { toneRef.current.fireSynth.triggerAttackRelease(note, "8n"); } catch {}
          }
        }

        // Grow dendrites on neurons — a new neurite sprouts every ~8-15s of speaking
        for (const neuron of st.neurons) {
          if (Math.random() < 0.001 + vol * 0.0008) { // ~once every 8-15s at normal volume
            growDendrite(neuron);
          }
        }

        // Spawn new neuron — requires 60-120+ seconds of accumulated speaking
        const si = 60 + Math.min(st.neurons.length * 5, 60);
        if (speakAccRef.current > si && st.neurons.length < 50) {
          speakAccRef.current = 0; addNeuron(st, w, h, sessionPillar);
          setNeuronCount(st.neurons.length); setSynapseCount(st.synapses.length);
          // Sound: deep spawn tone
          if (toneRef.current) {
            const notes = ["C3", "E3", "G3", "A3"];
            const note = notes[Math.floor(Math.random() * notes.length)];
            try { toneRef.current.spawnSynth.triggerAttackRelease(note, "2n"); } catch {}
          }

          // Rarely form extra connections (15% chance)
          if (Math.random() < 0.15) {
            const a = st.neurons[Math.floor(Math.random() * st.neurons.length)];
            for (const b of st.neurons) {
              if (a.id !== b.id && dst(a, b) < 120 && !st.synapses.some(s => (s.from === a.id && s.to === b.id) || (s.from === b.id && s.to === a.id))) {
                const sid = st.nextId++; const syn = new Synapse(a.id, b.id, sid);
                st.synapses.push(syn); a.connections.push(sid); b.connections.push(sid);
                setSynapseCount(st.synapses.length); break;
              }
            }
          }
        }
      }

      // Global heartbeat rhythm — slow in silence, quickens with voice
      const breathSpeed = isSessionScreen && spk ? 0.03 + vol * 0.04 : 0.008;
      breathPhaseRef.current += breathSpeed;
      const breath = Math.sin(breathPhaseRef.current) * 0.5 + 0.5; // 0 to 1

      // Update ambient particles
      if (particlesRef.current) {
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.01;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
      }

      for (const n of st.neurons) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 30 || n.x > w - 30) n.vx *= -0.95;
        if (n.y < 70 || n.y > h - 70) n.vy *= -0.95;
        n.x = Math.max(20, Math.min(w - 20, n.x));
        n.y = Math.max(60, Math.min(h - 60, n.y));
        n.fireLevel *= 0.993;
        // Animate dendrite growth — slowly extend toward targetLength
        for (const d of n.dendrites) {
          if (d.targetLength && d.length < d.targetLength) {
            d.length = Math.min(d.targetLength, d.length + 0.15); // slow organic extension
          }
        }
        n.maturity = Math.min(1, n.maturity + 0.0002); // new neurons take ~80 seconds to fully appear
        n.pulsePhase += 0.006;     // very slow breathing
        n.energy = Math.max(0.08, n.energy - 0.00005);
      }
      for (const s of st.synapses) {
        // Animate synapse formation — "reaching moment"
        if (s.forming) {
          s.formProgress = Math.min(1, s.formProgress + 0.008); // ~2 seconds to fully form
          if (s.formProgress >= 1) {
            s.forming = false;
            // Sound: gentle connection harmonic
            if (toneRef.current) {
              const notes = ["E4", "G4", "B4", "D5"];
              const note = notes[Math.floor(Math.random() * notes.length)];
              try { toneRef.current.connectSynth.triggerAttackRelease(note, "4n"); } catch {}
            }
          }
        }
        if (s.pulsePos >= 0 && s.pulsePos <= 1) {
          s.pulsePos += 0.007;     // pulses crawl along pathways
          if (s.pulsePos > 1) {
            s.pulsePos = -1;
            const target = neuronMap.get(s.to);
            if (target && !s.forming) { // only if synapse is fully formed
              // Cascade: receiving neuron fires at reduced intensity
              const cascadeStrength = s.strength * 0.5; // weaker cascade based on synapse strength
              if (Math.random() < cascadeStrength && target.fireLevel < 0.3) {
                target.fireLevel = Math.min(0.8, target.fireLevel + 0.35);
                target.totalFired++;
                target.energy = Math.min(1, target.energy + 0.001);
                // Propagate cascade through target's connections (but weaker)
                for (const sid2 of target.connections) {
                  const s2 = synapseMap.get(sid2);
                  if (s2 && !s2.forming && s2.pulsePos < 0) { // only if not already pulsing and formed
                    s2.pulsePos = s2.from === target.id ? 0 : 1;
                    s2.activity = Math.min(1, s2.activity + 0.25);
                  }
                }
              }
            }
          }
        }
        s.activity *= 0.995;      // activity barely fades
      }

      // ─── RENDER ───
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; // barely fading — light persists in the void
      ctx.fillRect(0, 0, w, h);

      // Subtle depth fog gradient that breathes
      const fogGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      const fogOpacity = (0.02 + breath * 0.03) * (isSessionScreen && spk ? 1 : 0.6);
      fogGradient.addColorStop(0, `${spc.fogRGB}${fogOpacity * 0.08})`);
      fogGradient.addColorStop(0.5, `${spc.fogRGB}${fogOpacity * 0.04})`);
      fogGradient.addColorStop(1, `${spc.fogRGB}0)`);
      ctx.fillStyle = fogGradient;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.max(w, h), 0, Math.PI * 2); ctx.fill();

      // Ambient particle system — persistent glowing dots
      if (particlesRef.current) {
        for (const p of particlesRef.current) {
          const pulseFade = Math.sin(p.phase) * 0.5 + 0.5;
          const pOp = p.opacity * (0.6 + pulseFade * 0.4);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          g.addColorStop(0, `${spc.fogRGB}${pOp})`);
          g.addColorStop(1, `${spc.deepRGB}0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ─── Synapses — tapered, wispy, organic curves ───
      for (const s of st.synapses) {
        const from = neuronMap.get(s.from), to = neuronMap.get(s.to);
        if (!from || !to) continue;
        const sc = getPillarCached(from.pillar); // synapse inherits color from source neuron
        const baseAlpha = 0.06 + s.strength * 0.35 + s.activity * 0.25;
        const baseW = s.width * (1 + s.activity * 0.8);
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
        const cpx = mx + s.cx, cpy = my + s.cy;

        // When forming, increase brightness and adjust drawing endpoint
        const drawEnd = s.forming ? s.formProgress : 1;
        const formingAlphaBoost = s.forming ? 1.5 : 1; // forming synapses are brighter

        // Draw tapered synapse as segmented line that thins along the curve
        const segments = 10;
        for (let i = 0; i < segments; i++) {
          const t0 = i / segments, t1 = (i + 1) / segments;
          if (t0 >= drawEnd) break; // don't draw beyond formation progress
          const actualT1 = Math.min(t1, drawEnd);
          const [x0, y0] = bezPt(from.x, from.y, cpx, cpy, to.x, to.y, t0);
          const [x1, y1] = bezPt(from.x, from.y, cpx, cpy, to.x, to.y, actualT1);
          const tMid = (t0 + actualT1) / 2;
          // Taper: thick at start, thin at end
          const taperW = baseW * (s.taperStart * (1 - tMid) + s.taperEnd * tMid);
          // Fade alpha slightly at the thin end
          const segAlpha = baseAlpha * (0.5 + 0.5 * (1 - tMid * 0.6)) * formingAlphaBoost;
          ctx.strokeStyle = s.activity > 0.1
            ? `${sc.midRGB}${segAlpha})`
            : `${sc.dimRGB}${segAlpha * 0.35})`;
          ctx.lineWidth = taperW;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }

        // If forming, draw a reaching growth cone at the tip
        if (s.forming) {
          const [tipX, tipY] = bezPt(from.x, from.y, cpx, cpy, to.x, to.y, s.formProgress);
          const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 8);
          tipGlow.addColorStop(0, `${sc.brightRGB}0.5)`);
          tipGlow.addColorStop(0.4, `${sc.fireRGB}0.2)`);
          tipGlow.addColorStop(1, `${sc.fogRGB}0)`);
          ctx.fillStyle = tipGlow; ctx.beginPath(); ctx.arc(tipX, tipY, 8, 0, Math.PI * 2); ctx.fill();
        }

        // Soft glow halo along high-strength synapses (skip if forming — no halo until complete)
        if (s.strength > 0.3 && !s.forming) {
          ctx.strokeStyle = `${sc.softRGB}${s.strength * 0.04 + s.activity * 0.06})`;
          ctx.lineWidth = baseW * s.taperStart + 4;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(cpx, cpy, to.x, to.y); ctx.stroke();
        }

        // Pulse traveling along the curve (skip if forming — no pulses until formed)
        if (s.pulsePos >= 0 && s.pulsePos <= 1 && !s.forming) {
          const [px, py] = bezPt(from.x, from.y, cpx, cpy, to.x, to.y, s.pulsePos);
          const g = ctx.createRadialGradient(px, py, 0, px, py, 14);
          g.addColorStop(0, `${sc.brightRGB}0.4)`);
          g.addColorStop(0.3, `${sc.fireRGB}0.15)`);
          g.addColorStop(0.7, `${sc.fogRGB}0.04)`);
          g.addColorStop(1, `${sc.deepRGB}0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ─── Neurons — luminous cell bodies with radiating neurites ───
      // Inspired by live-cell microscopy: bright soma, starburst neurites, growth cones
      for (const n of st.neurons) {
        const pc = getPillarCached(n.pillar); // per-neuron pillar palette (cached RGB strings)
        const pulse = Math.sin(n.pulsePhase) * 0.06 + 0.94;
        const r = n.radius * n.maturity * pulse, fire = n.fireLevel, energy = n.energy;
        const breathMod = 1 + breath * 0.12;
        const lum = 0.4 + energy * 0.6; // luminosity factor — brighter with energy

        // ── Neurites: radiating arms with growth cones and branches ──
        for (const d of n.dendrites) {
          if (d.length < 0.5) continue; // skip invisible dendrites still growing
          // Neurites are BRIGHT — tinted by pillar color
          const baseAlpha = (0.12 + energy * 0.2 + fire * 0.15) * n.maturity;
          const axonBoost = d.isAxon ? 1.3 : 1;
          const tipX = n.x + Math.cos(d.angle) * d.length;
          const tipY = n.y + Math.sin(d.angle) * d.length;
          const cp1x = n.x + Math.cos(d.angle) * d.length * 0.35 + d.curve1;
          const cp1y = n.y + Math.sin(d.angle) * d.length * 0.35 + d.curve2;

          // Wispy glow halo along neurite (drawn first, behind)
          ctx.strokeStyle = `${pc.midRGB}${baseAlpha * 0.15 * axonBoost})`;
          ctx.lineWidth = (d.width * n.maturity + 3) * axonBoost;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.quadraticCurveTo(cp1x, cp1y, tipX, tipY); ctx.stroke();

          // Main neurite — tapered, bright, pillar-tinted
          const dSegs = 8;
          for (let i = 0; i < dSegs; i++) {
            const t0 = i / dSegs, t1 = (i + 1) / dSegs;
            const [x0, y0] = bezPt(n.x, n.y, cp1x, cp1y, tipX, tipY, t0);
            const [x1, y1] = bezPt(n.x, n.y, cp1x, cp1y, tipX, tipY, t1);
            const tMid = (t0 + t1) / 2;
            const tWidth = d.width * n.maturity * axonBoost * (1 - tMid * 0.8);
            const tAlpha = baseAlpha * axonBoost * (1 - tMid * 0.4);
            // Pillar-tinted neurite color with fire boost
            const r_ = Math.round(Math.min(255, pc.mid[0] + fire * 40));
            const g_ = Math.round(Math.min(255, pc.mid[1] + fire * 35));
            const b_ = Math.round(Math.min(255, pc.mid[2] + fire * 20));
            ctx.strokeStyle = `rgba(${r_}, ${g_}, ${b_}, ${tAlpha})`;
            ctx.lineWidth = Math.max(0.25, tWidth);
            ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          }

          // Growth cone at tip — small bright bulb with filopodia
          const gc = d.growthCone;
          const gcAlpha = baseAlpha * 0.7 * axonBoost;
          const gcR = gc.size * n.maturity;
          if (gcR > 0.3) {
            // Growth cone glow
            const gcGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, gcR * 4);
            gcGlow.addColorStop(0, `${pc.brightRGB}${gcAlpha * 0.3})`);
            gcGlow.addColorStop(0.5, `${pc.softRGB}${gcAlpha * 0.1})`);
            gcGlow.addColorStop(1, `${pc.dimRGB}0)`);
            ctx.fillStyle = gcGlow; ctx.beginPath(); ctx.arc(tipX, tipY, gcR * 4, 0, Math.PI * 2); ctx.fill();
            // Growth cone body
            ctx.fillStyle = `${pc.brightRGB}${gcAlpha * 0.5})`;
            ctx.beginPath(); ctx.arc(tipX, tipY, gcR, 0, Math.PI * 2); ctx.fill();
            // Filopodia — tiny hair-like extensions reaching out from the tip
            for (const fp of gc.filopodia) {
              const fpX = tipX + Math.cos(fp.angle) * fp.length * n.maturity;
              const fpY = tipY + Math.sin(fp.angle) * fp.length * n.maturity;
              ctx.strokeStyle = `${pc.softRGB}${gcAlpha * 0.35})`;
              ctx.lineWidth = 0.4;
              ctx.lineCap = "round";
              ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(fpX, fpY); ctx.stroke();
            }
          }

          // Sub-branches
          for (const br of d.branches) {
            const [brX, brY] = bezPt(n.x, n.y, cp1x, cp1y, tipX, tipY, br.t);
            const brTipX = brX + Math.cos(br.angle) * br.length;
            const brTipY = brY + Math.sin(br.angle) * br.length;
            const brCpX = brX + Math.cos(br.angle) * br.length * 0.4 + br.curve;
            const brCpY = brY + Math.sin(br.angle) * br.length * 0.4 + br.curve * 0.7;
            // Branch glow
            ctx.strokeStyle = `${pc.softRGB}${baseAlpha * 0.1})`;
            ctx.lineWidth = d.width * 0.5 * n.maturity + 2;
            ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(brX, brY); ctx.quadraticCurveTo(brCpX, brCpY, brTipX, brTipY); ctx.stroke();
            // Branch segments
            const brSegs = 5;
            for (let i = 0; i < brSegs; i++) {
              const t0 = i / brSegs, t1 = (i + 1) / brSegs;
              const [bx0, by0] = bezPt(brX, brY, brCpX, brCpY, brTipX, brTipY, t0);
              const [bx1, by1] = bezPt(brX, brY, brCpX, brCpY, brTipX, brTipY, t1);
              const tMid = (t0 + t1) / 2;
              const bw = d.width * 0.45 * n.maturity * (1 - tMid * 0.9);
              ctx.strokeStyle = `${pc.midRGB}${baseAlpha * 0.55 * (1 - tMid * 0.5)})`;
              ctx.lineWidth = Math.max(0.2, bw);
              ctx.lineCap = "round";
              ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by1); ctx.stroke();
            }
          }
        }

        // ── Outer glow — wide, luminous, breathes ──
        const glowR = (r + 25 + fire * 35 + energy * 14) * breathMod;
        const glow = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, glowR);
        if (fire > 0.1) {
          glow.addColorStop(0, `${pc.brightRGB}${fire * 0.22 * lum})`);
          glow.addColorStop(0.15, `${pc.midRGB}${fire * 0.12 * lum})`);
          glow.addColorStop(0.4, `${pc.softRGB}${fire * 0.05})`);
          glow.addColorStop(1, `${pc.deepRGB}0)`);
        } else {
          glow.addColorStop(0, `${pc.brightRGB}${energy * 0.16 * lum})`);
          glow.addColorStop(0.3, `${pc.softRGB}${energy * 0.07})`);
          glow.addColorStop(1, `${pc.deepRGB}0)`);
        }
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2); ctx.fill();

        // ── Irregular cell body (soma) — bright, luminous like microscopy ──
        ctx.beginPath();
        for (let i = 0; i <= n.bodyShape.length; i++) {
          const v = n.bodyShape[i % n.bodyShape.length];
          const vr = r * v.r;
          const vx = n.x + Math.cos(v.angle) * vr;
          const vy = n.y + Math.sin(v.angle) * vr;
          if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        // Very bright soma — near-white center with pillar tint
        const somaGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 1.15);
        if (fire > 0.2) {
          somaGrad.addColorStop(0, `rgba(255, ${pc.soma[1]}, 255, ${(0.6 + fire * 0.35) * lum})`);
          somaGrad.addColorStop(0.25, `${pc.brightRGB}${(0.45 + fire * 0.25) * lum})`);
          somaGrad.addColorStop(0.6, `${pc.softRGB}${(0.2 + fire * 0.12) * lum})`);
          somaGrad.addColorStop(1, `${pc.dimRGB}${0.06 * lum})`);
        } else {
          somaGrad.addColorStop(0, `${pc.somaRGB}${(0.35 + energy * 0.35) * lum})`);
          somaGrad.addColorStop(0.3, `${pc.brightRGB}${(0.22 + energy * 0.2) * lum})`);
          somaGrad.addColorStop(0.65, `${pc.dimRGB}${(0.08 + energy * 0.08) * lum})`);
          somaGrad.addColorStop(1, `${pc.deepRGB}${0.03})`);
        }
        ctx.fillStyle = somaGrad; ctx.fill();

        // Translucent membrane edge — pillar-tinted
        ctx.strokeStyle = `${pc.brightRGB}${(0.12 + fire * 0.15 + energy * 0.08) * n.maturity})`;
        ctx.lineWidth = 0.7; ctx.stroke();

        // ── Internal membrane blobs ──
        for (const blob of n.membraneBlobs) {
          const bx = n.x + blob.dx * r, by = n.y + blob.dy * r;
          const br = r * blob.size;
          const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
          bg.addColorStop(0, `${pc.somaRGB}${blob.opacity * (1.2 + fire * 2.5) * lum})`);
          bg.addColorStop(1, `${pc.midRGB}0)`);
          ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
        }

        // ── Bright nucleus — hot white center ──
        const hlR = r * 0.4;
        const hlX = n.x - r * 0.1, hlY = n.y - r * 0.1;
        const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR);
        hlGrad.addColorStop(0, `rgba(255, 253, 255, ${(0.2 + fire * 0.35 + energy * 0.15) * n.maturity * lum})`);
        hlGrad.addColorStop(0.5, `${pc.brightRGB}${(0.08 + fire * 0.12) * n.maturity * lum})`);
        hlGrad.addColorStop(1, `${pc.midRGB}0)`);
        ctx.fillStyle = hlGrad; ctx.beginPath(); ctx.arc(hlX, hlY, hlR, 0, Math.PI * 2); ctx.fill();
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { run = false; cancelAnimationFrame(animRef.current); };
  }, [isListening, screen]);

  useEffect(() => () => stopListening(), [stopListening]);

  // ─── Session pillar colors for UI elements ───
  const sessionPillarUI = getPillarColors(selectedCategory?.name);
  const pillarAccentCSS = `rgb(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]})`;

  // ─── Shared styles — silk-smooth transitions ───
  const silk = "cubic-bezier(0.22, 1, 0.36, 1)"; // smooth deceleration
  const card = {
    background: P.card,
    border: `1px solid ${P.cardBorder}`,
    borderRadius: 14,
    padding: 18,
    fontFamily: FONT,
    transition: `border-color 0.4s ${silk}, background 0.4s ${silk}, box-shadow 0.5s ${silk}`,
  };

  const btnMain = {
    background: "linear-gradient(135deg, #7C6AFF 0%, #6355D8 100%)",
    color: P.white,
    border: "none",
    borderRadius: 10,
    padding: "14px 36px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: `all 0.4s ${silk}`,
    boxShadow: `0 0 30px ${P.accentGlow}, 0 2px 8px rgba(0,0,0,0.3)`,
  };

  const btnGhost = {
    background: "transparent",
    color: P.textSoft,
    border: `1px solid ${P.cardBorder}`,
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: FONT,
    fontWeight: 500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    transition: `all 0.4s ${silk}`,
  };

  const backBtn = {
    background: "none", border: "none", color: P.textSoft, fontSize: 12,
    cursor: "pointer", fontFamily: FONT, padding: "4px 0", marginBottom: 16,
    letterSpacing: 0.8, fontWeight: 500, transition: `color 0.35s ${silk}`,
  };

  const labelStyle = {
    color: P.textDim, fontSize: 9, fontWeight: 600, letterSpacing: 2,
    textTransform: "uppercase", fontFamily: FONT, marginBottom: 4,
  };

  const statNum = (color) => ({
    color, fontSize: 20, fontWeight: 700, fontFamily: FONT, lineHeight: 1,
  });

  const statLabel = {
    color: P.textDim, fontSize: 8, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", fontFamily: FONT, marginTop: 4,
  };

  // ─── SCREENS ───

  const renderHome = () => (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 40%, rgba(124,106,255,0.06) 0%, rgba(79,70,229,0.02) 40%, #000 70%)",
      padding: "0 28px",
      paddingTop: "max(60px, env(safe-area-inset-top, 60px))",
      paddingBottom: "max(60px, calc(60px + env(safe-area-inset-bottom, 0px)))",
      paddingLeft: "max(28px, env(safe-area-inset-left, 28px))",
      paddingRight: "max(28px, env(safe-area-inset-right, 28px))",
      fontFamily: FONT,
    }}>

      {/* Logo mark — silky entrance */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,180,252,0.18), rgba(79,70,229,0.06) 60%, transparent 80%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 12,
        animation: "renewLogoEntrance 1.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: "0.15s",
      }}>
        <div style={{
          width: 9, height: 9, borderRadius: "50%",
          background: "radial-gradient(circle, #A5B4FC, #6366F1)",
          boxShadow: "0 0 20px rgba(165,180,252,0.5), 0 0 40px rgba(124,106,255,0.15)",
          animation: "renewPulseGlow 5s ease-in-out infinite",
        }} />
      </div>

      <h1 style={{
        color: P.white, fontSize: 15, fontWeight: 700, margin: 0,
        letterSpacing: 8, textTransform: "uppercase", fontFamily: FONT,
        animation: "renewFadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: "0.4s",
      }}>
        RENEW
      </h1>

      <div style={{
        height: 1, background: `linear-gradient(90deg, transparent, ${P.cardBorder}, transparent)`,
        margin: "10px 0",
        animation: "renewDividerGrow 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: "0.65s",
      }} />

      {isFirstTime ? (
        <div style={{
          animation: "renewFadeInUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.85s", textAlign: "center",
        }}>
          <p style={{
            color: P.textSoft, fontSize: 14, fontWeight: 300, textAlign: "center",
            maxWidth: 280, lineHeight: 1.8, margin: "0 0 4px", fontFamily: FONT_BODY,
            opacity: 0.9,
          }}>
            speak the Word
          </p>
          <p style={{
            color: P.textDim, fontSize: 11, fontWeight: 400, textAlign: "center",
            maxWidth: 280, lineHeight: 1.6, margin: "0 0 16px", fontFamily: FONT_BODY,
            letterSpacing: 0.3,
          }}>
            And watch what grows.
          </p>
        </div>
      ) : (
        <div style={{
          animation: "renewFadeInUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.85s", textAlign: "center",
        }}>
          <p style={{
            color: P.textSoft, fontSize: 13, fontWeight: 300, textAlign: "center",
            maxWidth: 300, lineHeight: 1.6, margin: "0 0 4px", fontFamily: FONT_BODY,
          }}>
            Your mind is being renewed.
          </p>
          <p style={{
            color: P.textDim, fontSize: 10, fontWeight: 400, textAlign: "center",
            maxWidth: 300, lineHeight: 1.5, margin: "0 0 16px", fontFamily: FONT_BODY,
          }}>
            {lifetimeNeurons} neurons formed across {sessionHistory.length} session{sessionHistory.length !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {/* Streak — top right corner with flicker animation */}
      {currentStreak > 0 && (
        <div style={{
          position: "absolute", top: "max(20px, env(safe-area-inset-top, 20px))", right: "max(22px, env(safe-area-inset-right, 22px))",
          display: "flex", alignItems: "center", gap: 5,
          cursor: "pointer",
          animation: "renewStreakFlicker 3s ease-in-out infinite",
        }} onClick={() => setScreen("history")}>
          <span style={{ color: P.streak, fontSize: 18, fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>
            {currentStreak}
          </span>
          <span style={{ fontSize: 12, lineHeight: 1 }}>{"\u{1F525}"}</span>
        </div>
      )}

      <div style={{
        animation: "renewFadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: "1.15s", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <button className="renew-btn-tap" onClick={() => setScreen("pick-category")} style={{
          ...btnMain,
          background: "linear-gradient(135deg, #7C6AFF 0%, #6355D8 100%)",
          boxShadow: "0 0 30px rgba(124,106,255,0.2), 0 2px 8px rgba(0,0,0,0.3)",
          animation: "renewPulseGlow 3s ease-in-out infinite",
          borderRadius: 10,
        }}>
          {isFirstTime ? "Begin" : "Choose Scripture"}
        </button>

        {!isFirstTime && (
          <button className="renew-btn-tap" onClick={() => setScreen("history")} style={{
            ...btnGhost, marginTop: 14, border: "none", color: P.accent, fontSize: 10,
            letterSpacing: 1,
          }}>
            View History
          </button>
        )}
      </div>

      {/* Footer verse — breathing opacity animation */}
      <div style={{
        position: "absolute", bottom: "max(24px, env(safe-area-inset-bottom, 24px))", left: 20, right: 20, textAlign: "center",
        animation: "renewBreathe 8s cubic-bezier(0.37, 0, 0.63, 1) infinite",
      }}>
        <div style={{ color: P.textGhost, fontSize: 9, fontStyle: "italic", lineHeight: 1.6, fontFamily: FONT_BODY, letterSpacing: 0.3 }}>
          "This Book of the Law shall not depart from your mouth..."
        </div>
        <div style={{ color: P.textGhost, fontSize: 8, marginTop: 4, fontWeight: 700, letterSpacing: 2, fontFamily: FONT }}>
          JOSHUA 1:8
        </div>
      </div>
    </div>
  );

  const renderPickCategory = () => {
    const catColors = { PERSON: sessionPillarUI.fire, VEHICLE: getPillarColors("VEHICLE").fire, ASSIGNMENT: getPillarColors("ASSIGNMENT").fire };
    return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.88)", padding: 24,
      paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
      paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
      overflowY: "auto", fontFamily: FONT,
    }}>
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}>{"\u2190  back"}</button>
      <div style={labelStyle}>Choose a pillar</div>
      <h2 style={{ color: P.white, fontSize: 18, fontWeight: 700, margin: "4px 0 22px", fontFamily: FONT, letterSpacing: 4 }}>
        SCRIPTURE
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SCRIPTURE_CATEGORIES.map((cat, i) => {
          const cc = getPillarColors(cat.name).fire;
          const accentCSS = `rgb(${cc[0]}, ${cc[1]}, ${cc[2]})`;
          return (
          <button className="renew-btn-tap" key={i} onClick={() => { setSelectedCategory(cat); setScreen("pick-passage"); }} style={{
            ...card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
            textAlign: "left", position: "relative", overflow: "hidden", padding: "18px 18px 18px 22px",
            borderLeft: `3px solid ${accentCSS}`,
            animation: `renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${i * 0.08}s`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accentCSS; e.currentTarget.style.background = P.surface; e.currentTarget.style.boxShadow = `0 0 20px rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.08)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = P.cardBorder; e.currentTarget.style.borderLeftColor = accentCSS; e.currentTarget.style.background = P.card; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div>
              <div style={{ color: P.text, fontSize: 13, fontWeight: 700, fontFamily: FONT, letterSpacing: 3 }}>{cat.name}</div>
              <div style={{ color: P.textSoft, fontSize: 10, fontFamily: FONT_BODY, fontWeight: 400, marginTop: 2 }}>{cat.subtitle}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT, marginTop: 4, letterSpacing: 0.5 }}>{cat.passages.length} passages</div>
            </div>
          </button>
        );
        })}
      </div>

      <button className="renew-btn-tap" onClick={() => setScreen("custom")} style={{ ...btnGhost, marginTop: 18, alignSelf: "flex-start" }}>
        enter your own scripture
      </button>
    </div>
  );
  };

  const renderPickPassage = () => (
    <div className="renew-smooth-scroll" style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.88)", padding: 24,
      paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
      paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
      overflowY: "auto", fontFamily: FONT,
    }}>
      <button className="renew-btn-tap" onClick={() => setScreen("pick-category")} style={backBtn}>{"\u2190  back"}</button>
      <div style={{ marginBottom: 4 }}>
        <div style={labelStyle}>Pillar</div>
        <h2 style={{ color: P.white, fontSize: 16, fontWeight: 700, margin: "4px 0 0", fontFamily: FONT, letterSpacing: 3 }}>{selectedCategory?.name}</h2>
      </div>
      <div style={{ color: P.textDim, fontSize: 10, margin: "4px 0 18px", fontFamily: FONT_BODY }}>
        Tap a passage to begin speaking it aloud
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {selectedCategory?.passages.map((p, i) => {
          const saved = passageNetworksRef.current[getPassageKey(p)];
          const hasSaved = !!saved;
          return (
            <button className="renew-btn-tap" key={i} onClick={() => { setSelectedPassage(p); startListening(p); }} style={{
              ...card, cursor: "pointer", textAlign: "left",
              borderLeft: `3px solid ${pillarAccentCSS}`,
              padding: "16px 16px 16px 20px",
              background: hasSaved ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.03)` : P.card,
              boxShadow: hasSaved ? `inset 0 0 30px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.04)` : "none",
              animation: `renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
              animationDelay: `${Math.min(i * 0.04, 0.6)}s`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = pillarAccentCSS; e.currentTarget.style.background = P.surface; e.currentTarget.style.boxShadow = `0 0 20px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.08)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = P.cardBorder; e.currentTarget.style.borderLeftColor = pillarAccentCSS; e.currentTarget.style.background = hasSaved ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.03)` : P.card; e.currentTarget.style.boxShadow = hasSaved ? `inset 0 0 30px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.04)` : "none"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ color: pillarAccentCSS, fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: 1 }}>
                  {p.ref}
                </div>
                {saved && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, marginLeft: 8,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: pillarAccentCSS,
                      boxShadow: `0 0 10px ${pillarAccentCSS}`,
                    }} />
                    <span style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>
                      {saved.neurons.length} neurons
                    </span>
                  </div>
                )}
              </div>
              <div style={{
                color: P.textSoft, fontSize: 12, lineHeight: 1.75, fontFamily: FONT_BODY, fontWeight: 300,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {p.text}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCustom = () => (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.9)", padding: 24,
      paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
      paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
      fontFamily: FONT,
    }}>
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}>{"\u2190  back"}</button>
      <div style={labelStyle}>Custom passage</div>
      <h2 style={{ color: P.white, fontSize: 16, fontWeight: 700, margin: "4px 0 24px", fontFamily: FONT, letterSpacing: 2 }}>
        Enter your Scripture
      </h2>

      <div style={{ marginBottom: 16 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Reference</div>
        <input value={customRef} onChange={e => setCustomRef(e.target.value)}
          placeholder="e.g. Psalm 91:1-2"
          style={{
            width: "100%", boxSizing: "border-box",
            background: P.surface, border: `1px solid ${P.cardBorder}`,
            borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
            fontFamily: FONT, outline: "none", fontWeight: 400,
            transition: "border-color 0.25s",
          }} />
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Scripture text</div>
        <textarea value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder="Type or paste the Scripture here..."
          rows={6}
          style={{
            width: "100%", boxSizing: "border-box",
            background: P.surface, border: `1px solid ${P.cardBorder}`,
            borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
            fontFamily: FONT_BODY, outline: "none", resize: "vertical", lineHeight: 1.85, fontWeight: 300,
            transition: "border-color 0.25s",
          }} />
      </div>

      <button className="renew-btn-tap"
        onClick={() => { const p = { ref: customRef || "Custom", text: customText }; setSelectedPassage(p); startListening(p); }}
        disabled={!customText.trim()}
        style={{ ...btnMain, alignSelf: "center", opacity: customText.trim() ? 1 : 0.3, cursor: customText.trim() ? "pointer" : "not-allowed" }}
      >
        Begin Speaking
      </button>
      {permissionDenied && (
        <p style={{ color: P.danger, fontSize: 10, marginTop: 12, textAlign: "center", fontFamily: FONT_BODY }}>
          Microphone access required. Please allow and try again.
        </p>
      )}
    </div>
  );

  const renderSession = () => (
    <>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "14px 18px",
        paddingTop: "max(14px, env(safe-area-inset-top, 14px))",
        paddingLeft: "max(18px, env(safe-area-inset-left, 18px))",
        paddingRight: "max(18px, env(safe-area-inset-right, 18px))",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        zIndex: 10, background: "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)", fontFamily: FONT,
      }}>
        <div>
          <div style={{ color: P.white, fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>
            RENEW
          </div>
          <div style={{ color: P.textDim, fontSize: 8, marginTop: 3, letterSpacing: 1.2, fontWeight: 500, fontFamily: FONT_BODY }}>
            speak the Word &middot; renew your mind
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[
            { val: neuronCount, label: "Neurons", color: P.neuronCore },
            { val: synapseCount, label: "Pathways", color: P.fire },
            { val: fmtTime(totalTime), label: "Speaking", color: P.accent },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "right" }}>
              <div style={{ color: s.color, fontSize: 15, fontWeight: 700, fontFamily: FONT }}>{s.val}</div>
              <div style={{ ...statLabel, fontSize: 7 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scripture card — glassmorphism */}
      {selectedPassage && (
        <div style={{ position: "absolute", top: "calc(56px + env(safe-area-inset-top, 0px))", left: 14, right: 14, zIndex: 10 }}>
          <div style={{
            ...card, padding: "14px 18px",
            background: isSpeaking ? "rgba(10,10,10,0.75)" : "rgba(10,10,10,0.45)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderColor: isSpeaking ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.25)` : "rgba(255,255,255,0.06)",
            transition: "all 0.5s", maxHeight: 130, overflowY: "auto",
            boxShadow: isSpeaking ? `0 0 30px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.06)` : "none",
          }}>
            <div style={{ color: pillarAccentCSS, fontSize: 9, fontWeight: 700, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase", fontFamily: FONT }}>
              {selectedPassage.ref}
            </div>
            <div style={{
              color: isSpeaking ? P.text : P.textSoft,
              fontSize: 12, lineHeight: 1.9, fontWeight: 300, fontFamily: FONT_BODY,
              transition: "color 0.5s",
            }}>
              {selectedPassage.text}
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls — Joshua 1:8 + waveform + status + end */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        zIndex: 10, fontFamily: FONT,
        paddingBottom: "max(40px, calc(40px + env(safe-area-inset-bottom, 0px)))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingTop: 14,
        background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
      }}>
        {/* Joshua 1:8 — compact with breathing */}
        <div style={{ textAlign: "center", padding: "0 20px", marginBottom: 3 }}>
          <div style={{
            color: isSpeaking ? P.textDim : P.textGhost,
            fontSize: 8, fontStyle: "italic", lineHeight: 1.5, transition: "color 0.5s",
            fontWeight: 300, fontFamily: FONT_BODY,
          }}>
            "This Book of the Law shall not depart from your mouth..."
          </div>
          <div style={{
            color: isSpeaking ? P.textDim : P.textGhost,
            fontSize: 7, marginTop: 2, fontWeight: 700, letterSpacing: 2, transition: "color 0.5s",
            fontFamily: FONT,
          }}>
            JOSHUA 1:8
          </div>
        </div>

        {/* Live waveform visualizer — organic with varied widths and glow */}
        <div style={{
          display: "flex", alignItems: "center", gap: 2, height: 32,
          padding: "0 12px",
        }}>
          {Array.from({length: 20}, (_, i) => {
            const center = 9.5;
            const dist = Math.abs(i - center) / center;
            const wave = 1 - dist * 0.65;
            const phase = Date.now() * 0.004 + i * 0.5;
            const ripple = Math.sin(phase) * 0.3 + 0.7;
            const h = isSpeaking
              ? 4 + volume * 60 * wave * ripple
              : 2 + Math.sin(Date.now() * 0.002 + i * 0.4) * 1.2;
            const barWidth = 1.8 + Math.sin(i * 0.7) * 0.6; // varied widths
            return (
              <div key={i} style={{
                width: barWidth, borderRadius: 3,
                background: isSpeaking
                  ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${0.5 + volume * 0.5})`
                  : P.textDim,
                height: `${h}px`,
                transition: "height 0.06s ease-out, background 0.3s",
                opacity: isSpeaking ? 0.65 + volume * 0.35 : 0.2,
                boxShadow: isSpeaking && volume > 0.08
                  ? `0 0 ${5 + volume * 10}px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${volume * 0.35})`
                  : "none",
              }} />
            );
          })}
        </div>

        <span style={{
          fontSize: 9, color: isSpeaking ? pillarAccentCSS : P.textDim,
          fontWeight: 600, letterSpacing: 2, fontFamily: FONT,
          textTransform: "uppercase", transition: "color 0.3s",
          animation: isSpeaking ? "renewStatusPulse 2s ease-in-out infinite" : "none",
        }}>
          {isSpeaking ? "speaking" : "listening"}
        </span>

        {/* End button — large touch target for mobile */}
        <button className="renew-btn-tap" onClick={endSession} style={{
          ...btnGhost,
          marginTop: 4,
          padding: "12px 40px",
          fontSize: 11,
          letterSpacing: 2,
          borderColor: "rgba(255,255,255,0.08)",
          color: P.textSoft,
          borderRadius: 24,
          minHeight: 44,
          WebkitTapHighlightColor: "transparent",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>END</button>
      </div>

      {/* Speaking vignette pulse — syncs with volume */}
      {isSpeaking && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
          boxShadow: `inset 0 0 ${60 + volume * 100}px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${0.02 + volume * 0.12})`,
          transition: "box-shadow 0.15s ease-out",
        }} />
      )}
    </>
  );

  const renderSummary = () => {
    const last = sessionHistory[sessionHistory.length - 1];
    const grew = lastGrowthRef.current || { neurons: 0, synapses: 0, dendrites: 0, speakTime: 0 };
    const growthItems = [
      grew.neurons > 0 && { label: "New neurons formed", value: `+${grew.neurons}`, color: P.neuronCore },
      grew.dendrites > 0 && { label: "Neurites sprouted", value: `+${grew.dendrites}`, color: P.fire },
      grew.synapses > 0 && { label: "Connections formed", value: `+${grew.synapses}`, color: P.accent },
    ].filter(Boolean);

    return (
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 40%, rgba(192,132,252,0.06) 0%, rgba(79,70,229,0.02) 40%, #000 70%)",
        padding: 28,
        paddingTop: "max(28px, env(safe-area-inset-top, 28px))",
        paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))",
        paddingLeft: "max(28px, env(safe-area-inset-left, 28px))",
        paddingRight: "max(28px, env(safe-area-inset-right, 28px))",
        fontFamily: FONT,
      }}>
        <div style={{
          animation: "renewFadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.1s", textAlign: "center",
        }}>
          <div style={labelStyle}>Session complete</div>
          <h2 style={{ color: P.white, fontSize: 22, fontWeight: 300, margin: "6px 0 4px", letterSpacing: 1.5, fontFamily: FONT_BODY }}>
            Well done.
          </h2>
          <div style={{ color: pillarAccentCSS, fontSize: 11, fontWeight: 600, letterSpacing: 1, fontFamily: FONT, marginBottom: 24 }}>
            {last?.ref}
          </div>
        </div>

        {/* Time spoken this session */}
        <div style={{
          animation: "renewCountUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.3s", textAlign: "center",
        }}>
          <div style={{ color: P.white, fontSize: 30, fontWeight: 200, fontFamily: FONT, letterSpacing: 3, marginBottom: 4 }}>
            {fmtTime(grew.speakTime)}
          </div>
          <div style={{ ...labelStyle, marginBottom: 24, color: P.textDim }}>spoken this session</div>
        </div>

        {/* Growth this session — staggered reveal */}
        <div style={{
          ...card, padding: "16px 20px", marginBottom: 20, width: "100%", maxWidth: 300,
          animation: "renewFadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.5s",
        }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>This session</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {growthItems.map((item, idx) => (
              <div key={idx} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                animation: "renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: `${0.7 + idx * 0.12}s`,
              }}>
                <span style={{ color: P.textSoft, fontSize: 11, fontFamily: FONT_BODY }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>{item.value}</span>
              </div>
            ))}
            {growthItems.length === 0 && (
              <div style={{ color: P.textDim, fontSize: 11, fontFamily: FONT_BODY, textAlign: "center" }}>
                Your network strengthened. Growth takes time.
              </div>
            )}
          </div>
        </div>

        {/* Lifetime network */}
        <div style={{
          ...card, padding: "12px 20px", marginBottom: 24, width: "100%", maxWidth: 300,
          borderColor: "rgba(251,146,60,0.15)", background: P.surface,
          animation: "renewFadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.8s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: P.streak, fontSize: 14, fontWeight: 700, fontFamily: FONT, animation: "renewStreakFlicker 3s ease-in-out infinite" }}>{currentStreak} day streak</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>best: {longestStreak} days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: P.textSoft, fontSize: 11, fontFamily: FONT }}>{lifetimeNeurons} total neurons</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>{sessionHistory.length} sessions</div>
            </div>
          </div>
        </div>

        <div style={{
          animation: "renewFadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "1s", display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <button className="renew-btn-tap" onClick={() => { setSelectedPassage(null); setScreen(selectedCategory ? "pick-passage" : "home"); }} style={btnMain}>
            Continue
          </button>
          <button className="renew-btn-tap" onClick={() => { setSelectedPassage(null); setScreen("home"); }} style={{ ...btnGhost, marginTop: 12 }}>
            Home
          </button>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="renew-smooth-scroll" style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      padding: 24,
      paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
      paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
      overflowY: "auto", fontFamily: FONT,
    }}>
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}>{"\u2190  back"}</button>
      <div style={labelStyle}>Your journey</div>
      <h2 style={{ color: P.white, fontSize: 18, fontWeight: 700, margin: "4px 0 22px", fontFamily: FONT, letterSpacing: 3 }}>
        History & Stats
      </h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Total time", value: fmtShort(lifetimeSeconds), color: P.accent },
          { label: "Streak", value: `${currentStreak}d`, color: P.streak },
          { label: "Best", value: `${longestStreak}d`, color: P.fire },
          { label: "Neurons", value: lifetimeNeurons, color: P.neuronCore },
        ].map((s, i) => (
          <div key={i} style={{
            ...card, padding: "12px 6px", flex: 1, textAlign: "center",
            animation: `renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ ...statNum(s.color), fontSize: 16 }}>{s.value}</div>
            <div style={{ ...statLabel, fontSize: 7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...labelStyle, marginBottom: 10 }}>Past sessions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...sessionHistory].reverse().map((s, i) => (
          <div key={i} style={{
            ...card, padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: P.surface, display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${P.cardBorder}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: `radial-gradient(circle, ${P.neuronCore}, ${P.synapse})`,
                boxShadow: `0 0 8px ${P.accentGlow}`,
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: P.text, fontSize: 12, fontWeight: 600, fontFamily: FONT }}>{s.ref}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>
                {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: P.accent, fontSize: 12, fontWeight: 600, fontFamily: FONT }}>{fmtShort(s.duration)}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>{s.neurons} neurons</div>
            </div>
          </div>
        ))}
      </div>
      {sessionHistory.length === 0 && (
        <div style={{ color: P.textDim, fontSize: 11, textAlign: "center", marginTop: 40, fontFamily: FONT }}>
          No sessions yet. Start speaking the Word.
        </div>
      )}
    </div>
  );

  // Screen content wrapper with transition animation
  const screenContent = (() => {
    switch (screen) {
      case "home": return renderHome();
      case "pick-category": return renderPickCategory();
      case "pick-passage": return renderPickPassage();
      case "custom": return renderCustom();
      case "session": return renderSession();
      case "summary": return renderSummary();
      case "history": return renderHistory();
      default: return null;
    }
  })();

  return (
    <div className="renew-noise" style={{
      background: P.black, width: "100%", height: "100%",
      position: "relative", overflow: "hidden", fontFamily: FONT,
    }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
      <div key={screen} className={screen !== "session" ? "renew-screen-enter" : ""} style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        {screenContent}
      </div>
    </div>
  );
}
