import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { auth, googleProvider, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
        transform: translateY(18px) scale(0.97);
        filter: blur(12px);
      }
      40% {
        opacity: 0.6;
        filter: blur(4px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
      }
    }
    @keyframes renewFadeIn {
      0% { opacity: 0; filter: blur(10px); }
      50% { opacity: 0.7; filter: blur(3px); }
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
        transform: translateY(14px) scale(0.97);
        filter: blur(10px);
      }
      50% {
        opacity: 0.7;
        filter: blur(2px);
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
        transform: scale(0.5) translateY(14px);
        filter: blur(16px);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.02) translateY(-1px);
        filter: blur(3px);
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
        filter: blur(12px);
      }
      45% {
        opacity: 0.6;
        filter: blur(3px);
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
        transform: translateY(10px);
        filter: blur(14px);
      }
      45% {
        opacity: 0.65;
        filter: blur(4px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0px);
      }
    }
    /* v2: Divider shimmer — light catching a wire */
    @keyframes renewDividerShimmer {
      0% { background-position: -100px 0; }
      100% { background-position: 100px 0; }
    }
    /* v2: Achievement flash — stat glow on reveal */
    @keyframes renewAchievementFlash {
      0% {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
        filter: blur(8px);
        text-shadow: none;
      }
      50% {
        opacity: 1;
        text-shadow: 0 0 18px currentColor;
        filter: blur(0px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
        text-shadow: 0 0 6px currentColor;
      }
    }
    /* v2: Radial burst behind summary */
    @keyframes renewRadialBurst {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      40% {
        opacity: 0.12;
      }
      100% {
        opacity: 0.06;
        transform: scale(1);
      }
    }
    /* v2: Concentric rings expanding */
    @keyframes renewRingExpand {
      0% { transform: scale(0.3); opacity: 0.2; }
      100% { transform: scale(1.2); opacity: 0; }
    }
    /* v2: Breathing fog on home */
    @keyframes renewFogBreathe {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    /* v2: Scroll edge fades */
    .renew-scroll-container {
      position: relative;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .renew-scroll-container::before,
    .renew-scroll-container::after {
      content: '';
      position: sticky;
      display: block;
      left: 0;
      right: 0;
      height: 32px;
      pointer-events: none;
      z-index: 5;
    }
    .renew-scroll-container::before {
      top: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
    }
    .renew-scroll-container::after {
      bottom: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    }
    /* v2: Input focus glow */
    .renew-input:focus {
      border-color: rgba(124, 106, 255, 0.4) !important;
      box-shadow: 0 0 16px rgba(124, 106, 255, 0.1), inset 0 0 8px rgba(124, 106, 255, 0.03) !important;
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
    /* Splash → Login transition animations */
    @keyframes renewSplashExit {
      0% { opacity: 1; transform: scale(1); filter: blur(0px); }
      100% { opacity: 0; transform: scale(1.05); filter: blur(20px); }
    }
    @keyframes renewLoginEnter {
      0% { opacity: 0; transform: translateY(20px); filter: blur(8px); }
      100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
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
// ─── Scripture Library ───
// Translation: English Standard Version (ESV)
// Three pillars: Person (who you are), Vehicle (how you move), Assignment (what you're called to)
// All passages arranged in canonical Bible order within each pillar
const SCRIPTURE_TRANSLATION = "ESV";

const SCRIPTURE_CATEGORIES = [
  {
    name: "PERSON",
    subtitle: "this is you",
    icon: "\u{1FA9E}",
    passages: [
      // ── Psalms — identity, soul, worship, inner life ──
      { ref: "Psalm 1:1-3", text: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night. He is like a tree planted by streams of water that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers." },
      { ref: "Psalm 8:4-6", text: "What is man that you are mindful of him, and the son of man that you care for him? Yet you have made him a little lower than the heavenly beings and crowned him with glory and honor. You have given him dominion over the works of your hands; you have put all things under his feet." },
      { ref: "Psalm 16:11", text: "You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore." },
      { ref: "Psalm 17:15", text: "As for me, I shall behold your face in righteousness; when I awake, I shall be satisfied with your likeness." },
      { ref: "Psalm 23:1-3", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake." },
      { ref: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?" },
      { ref: "Psalm 27:4", text: "One thing have I asked of the Lord, that will I seek after: that I may dwell in the house of the Lord all the days of my life, to gaze upon the beauty of the Lord and to inquire in his temple." },
      { ref: "Psalm 34:8", text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!" },
      { ref: "Psalm 36:9", text: "For with you is the fountain of life; in your light do we see light." },
      { ref: "Psalm 42:1-2", text: "As a deer pants for flowing streams, so pants my soul for you, O God. My soul thirsts for God, for the living God." },
      { ref: "Psalm 46:10", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!" },
      { ref: "Psalm 51:10-12", text: "Create in me a clean heart, O God, and renew a right spirit within me. Cast me not away from your presence, and take not your Holy Spirit from me. Restore to me the joy of your salvation, and uphold me with a willing spirit." },
      { ref: "Psalm 63:1-3", text: "O God, you are my God; earnestly I seek you; my soul thirsts for you; my flesh faints for you, as in a dry and weary land where there is no water. So I have looked upon you in the sanctuary, beholding your power and glory. Because your steadfast love is better than life, my lips will praise you." },
      { ref: "Psalm 84:10-11", text: "For a day in your courts is better than a thousand elsewhere. I would rather be a doorkeeper in the house of my God than dwell in the tents of wickedness. For the Lord God is a sun and shield; the Lord bestows favor and honor. No good thing does he withhold from those who walk uprightly." },
      { ref: "Psalm 91:1-2", text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the Lord, My refuge and my fortress, my God, in whom I trust." },
      { ref: "Psalm 103:1-5", text: "Bless the Lord, O my soul, and all that is within me, bless his holy name! Bless the Lord, O my soul, and forget not all his benefits, who forgives all your iniquity, who heals all your diseases, who redeems your life from the pit, who crowns you with steadfast love and mercy, who satisfies you with good so that your youth is renewed like the eagle's." },
      { ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path." },
      { ref: "Psalm 139:13-14", text: "For you formed my inward parts; you knitted me together in my mother's womb. I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well." },
      { ref: "Psalm 139:23-24", text: "Search me, O God, and know my heart! Try me and know my thoughts! And see if there be any grievous way in me, and lead me in the way everlasting!" },
      { ref: "Psalm 143:8", text: "Let me hear in the morning of your steadfast love, for in you I trust. Make me know the way I should go, for to you I lift up my soul." },
      { ref: "Psalm 146:1-2", text: "Praise the Lord! Praise the Lord, O my soul! I will praise the Lord as long as I live; I will sing praises to my God while I have my being." },
      // ── Proverbs — heart, character, wisdom, inner man ──
      { ref: "Proverbs 2:6-7", text: "For the Lord gives wisdom; from his mouth come knowledge and understanding; he stores up sound wisdom for the upright; he is a shield to those who walk in integrity." },
      { ref: "Proverbs 3:1-2", text: "My son, do not forget my teaching, but let your heart keep my commandments, for length of days and years of life and peace they will add to you." },
      { ref: "Proverbs 3:13-15", text: "Blessed is the one who finds wisdom, and the one who gets understanding, for the gain from her is better than gain from silver and her profit better than gold. She is more precious than jewels, and nothing you desire can compare with her." },
      { ref: "Proverbs 4:23", text: "Keep your heart with all vigilance, for from it flow the springs of life." },
      { ref: "Proverbs 14:30", text: "A tranquil heart gives life to the flesh, but envy makes the bones rot." },
      { ref: "Proverbs 15:13", text: "A glad heart makes a cheerful face, but by sorrow of heart the spirit is crushed." },
      { ref: "Proverbs 16:32", text: "Whoever is slow to anger is better than the mighty, and he who rules his spirit than he who takes a city." },
      { ref: "Proverbs 17:22", text: "A joyful heart is good medicine, but a crushed spirit dries up the bones." },
      { ref: "Proverbs 18:21", text: "Death and life are in the power of the tongue, and those who love it will eat its fruits." },
      { ref: "Proverbs 20:27", text: "The spirit of man is the lamp of the Lord, searching all his innermost parts." },
      { ref: "Proverbs 23:7", text: "For as he thinks in his heart, so is he." },
      { ref: "Proverbs 25:28", text: "A man without self-control is like a city broken into and left without walls." },
      // ── Prophets ──
      { ref: "Isaiah 26:3", text: "You keep him in perfect peace whose mind is stayed on you, because he trusts in you." },
      { ref: "Isaiah 26:7", text: "The path of the righteous is level; you make level the way of the righteous." },
      { ref: "Isaiah 43:1", text: "But now thus says the Lord, he who created you, O Jacob, he who formed you, O Israel: Fear not, for I have redeemed you; I have called you by name, you are mine." },
      { ref: "Isaiah 43:4", text: "Because you are precious in my eyes, and honored, and I love you, I give men in return for you, peoples in exchange for your life." },
      { ref: "Isaiah 54:17", text: "No weapon that is fashioned against you shall succeed, and you shall refute every tongue that rises against you in judgment. This is the heritage of the servants of the Lord and their vindication from me, declares the Lord." },
      { ref: "Jeremiah 1:5", text: "Before I formed you in the womb I knew you, and before you were born I consecrated you; I appointed you a prophet to the nations." },
      { ref: "Jeremiah 17:7-8", text: "Blessed is the man who trusts in the Lord, whose trust is the Lord. He is like a tree planted by water, that sends out its roots by the stream, and does not fear when heat comes, for its leaves remain green, and is not anxious in the year of drought, for it does not cease to bear fruit." },
      { ref: "Ezekiel 36:26", text: "And I will give you a new heart, and a new spirit I will put within you. And I will remove the heart of stone from your flesh and give you a heart of flesh." },
      // ── Gospels ──
      { ref: "John 1:12", text: "But to all who did receive him, who believed in his name, he gave the right to become children of God." },
      { ref: "John 4:24", text: "God is spirit, and those who worship him must worship in spirit and truth." },
      { ref: "John 10:10", text: "The thief comes only to steal and kill and destroy. I came that they may have life and have it abundantly." },
      { ref: "John 15:5", text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing." },
      // ── Epistles ──
      { ref: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us." },
      { ref: "Romans 8:1", text: "There is therefore now no condemnation for those who are in Christ Jesus." },
      { ref: "Romans 8:16-17", text: "The Spirit himself bears witness with our spirit that we are children of God, and if children, then heirs -- heirs of God and fellow heirs with Christ, provided we suffer with him in order that we may also be glorified with him." },
      { ref: "Romans 12:1-2", text: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship. Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect." },
      { ref: "1 Corinthians 2:12", text: "Now we have received not the spirit of the world, but the Spirit who is from God, that we might understand the things freely given us by God." },
      { ref: "1 Corinthians 6:19-20", text: "Do you not know that your body is a temple of the Holy Spirit within you, whom you have from God? You are not your own, for you were bought with a price. So glorify God in your body." },
      { ref: "2 Corinthians 3:18", text: "And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another. For this comes from the Lord who is the Spirit." },
      { ref: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
      { ref: "Galatians 2:20", text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me." },
      { ref: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law." },
      { ref: "Ephesians 1:4-5", text: "Even as he chose us in him before the foundation of the world, that we should be holy and blameless before him. In love he predestined us for adoption to himself as sons through Jesus Christ, according to the purpose of his will." },
      { ref: "Ephesians 2:10", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them." },
      { ref: "Ephesians 3:16-17", text: "That according to the riches of his glory he may grant you to be strengthened with power through his Spirit in your inner being, so that Christ may dwell in your hearts through faith." },
      { ref: "Philippians 1:6", text: "And I am sure of this, that he who began a good work in you will bring it to completion at the day of Jesus Christ." },
      { ref: "Philippians 4:8", text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things." },
      { ref: "Colossians 3:1-3", text: "If then you have been raised with Christ, seek the things that are above, where Christ is, seated at the right hand of God. Set your minds on things that are above, not on things that are on earth. For you have died, and your life is hidden with Christ in God." },
      { ref: "1 Thessalonians 5:23", text: "Now may the God of peace himself sanctify you completely, and may your whole spirit and soul and body be kept blameless at the coming of our Lord Jesus Christ." },
      { ref: "James 1:19-21", text: "Know this, my beloved brothers: let every person be quick to hear, slow to speak, slow to anger; for the anger of man does not produce the righteousness of God. Therefore put away all filthiness and rampant wickedness and receive with meekness the implanted word, which is able to save your souls." },
      { ref: "1 Peter 2:9", text: "But you are a chosen race, a royal priesthood, a holy nation, a people for his own possession, that you may proclaim the excellencies of him who called you out of darkness into his marvelous light." },
      { ref: "1 John 3:1", text: "See what kind of love the Father has given to us, that we should be called children of God; and so we are." },
      { ref: "3 John 1:2", text: "Beloved, I pray that all may go well with you and that you may be in good health, as it goes well with your soul." },
    ]
  },
  {
    name: "VEHICLE",
    subtitle: "this is the structure God gives",
    icon: "\u{1F54A}\u{FE0F}",
    passages: [
      // ── Torah — covenant foundations of provision ──
      { ref: "Genesis 12:2-3", text: "And I will make of you a great nation, and I will bless you and make your name great, so that you will be a blessing. I will bless those who bless you, and him who dishonors you I will curse, and in you all the families of the earth shall be blessed." },
      { ref: "Genesis 22:14", text: "So Abraham called the name of that place, The Lord will provide; as it is said to this day, On the mount of the Lord it shall be provided." },
      { ref: "Deuteronomy 8:18", text: "You shall remember the Lord your God, for it is he who gives you power to get wealth, that he may confirm his covenant that he swore to your fathers, as it is this day." },
      { ref: "Deuteronomy 28:1-2", text: "And if you faithfully obey the voice of the Lord your God, being careful to do all his commandments that I command you today, the Lord your God will set you high above all the nations of the earth. And all these blessings shall come upon you and overtake you, if you obey the voice of the Lord your God." },
      { ref: "Deuteronomy 28:12-13", text: "The Lord will open to you his good treasury, the heavens, to give the rain to your land in its season and to bless all the work of your hands. And you shall lend to many nations, but you shall not borrow. And the Lord will make you the head and not the tail, and you shall only go up and not down." },
      // ── Psalms — provision, blessing, favour, structure ──
      { ref: "Psalm 1:1-3", text: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night. He is like a tree planted by streams of water that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers." },
      { ref: "Psalm 23:1-6", text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever." },
      { ref: "Psalm 24:1", text: "The earth is the Lord's and the fullness thereof, the world and those who dwell therein." },
      { ref: "Psalm 35:27", text: "Let those who delight in my righteousness shout for joy and be glad and say evermore, Great is the Lord, who delights in the welfare of his servant!" },
      { ref: "Psalm 37:4-5", text: "Delight yourself in the Lord, and he will give you the desires of your heart. Commit your way to the Lord; trust in him, and he will act." },
      { ref: "Psalm 37:25-26", text: "I have been young, and now am old, yet I have not seen the righteous forsaken or his children begging for bread. He is ever lending generously, and his children become a blessing." },
      { ref: "Psalm 50:10-12", text: "For every beast of the forest is mine, the cattle on a thousand hills. I know all the birds of the hills, and all that moves in the field is mine. If I were hungry, I would not tell you, for the world and its fullness are mine." },
      { ref: "Psalm 67:1-2", text: "May God be gracious to us and bless us and make his face to shine upon us, that your way may be known on earth, your saving power among all nations." },
      { ref: "Psalm 67:5-7", text: "Let the peoples praise you, O God; let all the peoples praise you! The earth has yielded its increase; God, our God, shall bless us. God shall bless us; let all the ends of the earth fear him!" },
      { ref: "Psalm 75:6-7", text: "For not from the east or from the west and not from the wilderness comes lifting up, but it is God who executes judgment, putting down one and lifting up another." },
      { ref: "Psalm 90:17", text: "Let the favor of the Lord our God be upon us, and establish the work of our hands upon us; yes, establish the work of our hands!" },
      { ref: "Psalm 112:1-3", text: "Praise the Lord! Blessed is the man who fears the Lord, who greatly delights in his commandments! His offspring will be mighty in the land; the generation of the upright will be blessed. Wealth and riches are in his house, and his righteousness endures forever." },
      { ref: "Psalm 115:14-16", text: "May the Lord give you increase, you and your children! May you be blessed by the Lord, who made heaven and earth! The heavens are the Lord's heavens, but the earth he has given to the children of man." },
      { ref: "Psalm 127:1", text: "Unless the Lord builds the house, those who build it labor in vain. Unless the Lord watches over the city, the watchman stays awake in vain." },
      { ref: "Psalm 128:1-4", text: "Blessed is everyone who fears the Lord, who walks in his ways! You shall eat the fruit of the labor of your hands; you shall be blessed, and it shall be well with you. Your wife will be like a fruitful vine within your house; your children will be like olive shoots around your table. Behold, thus shall the man be blessed who fears the Lord." },
      { ref: "Psalm 145:15-16", text: "The eyes of all look to you, and you give them their food in due season. You open your hand; you satisfy the desire of every living thing." },
      // ── Proverbs — wisdom, diligence, wealth, stewardship, counsel ──
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
      { ref: "Proverbs 3:9-10", text: "Honor the Lord with your wealth and with the firstfruits of all your produce; then your barns will be filled with plenty, and your vats will be bursting with wine." },
      { ref: "Proverbs 8:12", text: "I, wisdom, dwell with prudence, and I find knowledge and discretion." },
      { ref: "Proverbs 8:17-21", text: "I love those who love me, and those who seek me diligently find me. Riches and honor are with me, enduring wealth and righteousness. My fruit is better than gold, even fine gold, and my yield than choice silver. I walk in the way of righteousness, in the paths of justice, granting an inheritance to those who love me, and filling their treasuries." },
      { ref: "Proverbs 10:4", text: "A slack hand causes poverty, but the hand of the diligent makes rich." },
      { ref: "Proverbs 10:22", text: "The blessing of the Lord makes rich, and he adds no sorrow with it." },
      { ref: "Proverbs 11:14", text: "Where there is no guidance, a people falls, but in an abundance of counselors there is safety." },
      { ref: "Proverbs 11:24-25", text: "One gives freely, yet grows all the richer; another withholds what he should give, and only suffers want. Whoever brings blessing will be enriched, and one who waters will himself be watered." },
      { ref: "Proverbs 13:11", text: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it." },
      { ref: "Proverbs 13:22", text: "A good man leaves an inheritance to his children's children, but the sinner's wealth is laid up for the righteous." },
      { ref: "Proverbs 16:3", text: "Commit your work to the Lord, and your plans will be established." },
      { ref: "Proverbs 21:5", text: "The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty." },
      { ref: "Proverbs 22:4", text: "The reward for humility and fear of the Lord is riches and honor and life." },
      { ref: "Proverbs 24:3-4", text: "By wisdom a house is built, and by understanding it is established; by knowledge the rooms are filled with all precious and pleasant riches." },
      { ref: "Proverbs 27:23-24", text: "Know well the condition of your flocks, and give attention to your herds, for riches do not last forever; and does a crown endure to all generations?" },
      { ref: "Proverbs 29:2", text: "When the righteous increase, the people rejoice, but when the wicked rule, the people groan." },
      // ── Prophets — nations bringing resources, divine economy, government ──
      { ref: "Isaiah 2:2-3", text: "It shall come to pass in the latter days that the mountain of the house of the Lord shall be established as the highest of the mountains, and shall be lifted up above the hills; and all the nations shall flow to it, and many peoples shall come, and say: Come, let us go up to the mountain of the Lord, to the house of the God of Jacob, that he may teach us his ways and that we may walk in his paths." },
      { ref: "Isaiah 9:6-7", text: "For to us a child is born, to us a son is given; and the government shall be upon his shoulder, and his name shall be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace. Of the increase of his government and of peace there will be no end." },
      { ref: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
      { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
      { ref: "Isaiah 45:3", text: "I will give you the treasures of darkness and the hoards in secret places, that you may know that it is I, the Lord, the God of Israel, who call you by your name." },
      { ref: "Isaiah 60:5-7", text: "Then you shall see and be radiant; your heart shall thrill and exult, because the abundance of the sea shall be turned to you, the wealth of the nations shall come to you. A multitude of camels shall cover you, the young camels of Midian and Ephah; all those from Sheba shall come. They shall bring gold and frankincense, and shall bring good news, the praises of the Lord." },
      { ref: "Isaiah 60:10-11", text: "Foreigners shall build up your walls, and their kings shall minister to you; for in my wrath I struck you, but in my favor I have had mercy on you. Your gates shall be open continually; day and night they shall not be shut, that people may bring to you the wealth of the nations, with their kings led in procession." },
      { ref: "Isaiah 61:5-6", text: "Strangers shall stand and tend your flocks; foreigners shall be your plowmen and vinedressers; but you shall be called the priests of the Lord; they shall speak of you as the ministers of our God; you shall eat the wealth of the nations, and in their glory you shall boast." },
      { ref: "Haggai 2:7-8", text: "And I will shake all nations, so that the treasures of all nations shall come in, and I will fill this house with glory, says the Lord of hosts. The silver is mine, and the gold is mine, declares the Lord of hosts." },
      { ref: "Habakkuk 2:2", text: "And the Lord answered me: Write the vision; make it plain on tablets, so he may run who reads it." },
      { ref: "Malachi 3:10-11", text: "Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need. I will rebuke the devourer for you, so that it will not destroy the fruits of your soil, and your vine in the field shall not fail to bear, says the Lord of hosts." },
      // ── Gospels & Acts ──
      { ref: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you." },
      { ref: "Luke 6:38", text: "Give, and it will be given to you. Good measure, pressed down, shaken together, running over, will be put into your lap. For with the measure you use it will be measured back to you." },
      // ── Epistles ──
      { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
      { ref: "Romans 13:1", text: "Let every person be subject to the governing authorities. For there is no authority except from God, and those that exist have been instituted by God." },
      { ref: "1 Corinthians 14:40", text: "But all things should be done decently and in order." },
      { ref: "2 Corinthians 9:6-8", text: "The point is this: whoever sows sparingly will also reap sparingly, and whoever sows bountifully will also reap bountifully. Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to make all grace abound to you, so that having all sufficiency in all things at all times, you may abound in every good work." },
      { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
      { ref: "Philippians 4:19", text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus." },
      { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
      { ref: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him." },
    ]
  },
  {
    name: "ASSIGNMENT",
    subtitle: "this is the mission God gives",
    icon: "\u{1F525}",
    passages: [
      // ── Torah — courage and obedience ──
      { ref: "Genesis 1:28", text: "And God blessed them. And God said to them, Be fruitful and multiply and fill the earth and subdue it, and have dominion over the fish of the sea and over the birds of the heavens and over every living thing that moves on the earth." },
      { ref: "Deuteronomy 28:13", text: "And the Lord will make you the head and not the tail, and you shall only go up and not down, if you obey the commandments of the Lord your God, which I command you today, being careful to do them." },
      { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you." },
      { ref: "Deuteronomy 31:8", text: "It is the Lord who goes before you. He will be with you; he will not leave you or forsake you. Do not fear or be dismayed." },
      // ── History ──
      { ref: "Joshua 1:8-9", text: "This Book of the Law shall not depart from your mouth, but you shall meditate on it day and night, so that you may be careful to do according to all that is written in it. For then you will make your way prosperous, and then you will have good success. Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
      { ref: "1 Samuel 17:47", text: "And that all this assembly may know that the Lord saves not with sword and spear. For the battle is the Lord's, and he will give you into our hand." },
      { ref: "1 Chronicles 4:10", text: "Jabez called upon the God of Israel, saying, Oh that you would bless me and enlarge my border, and that your hand might be with me, and that you would keep me from harm so that it might not bring me pain! And God granted what he asked." },
      { ref: "2 Chronicles 20:15", text: "And he said, Listen, all Judah and inhabitants of Jerusalem and King Jehoshaphat: Thus says the Lord to you, Do not be afraid and do not be dismayed at this great horde, for the battle is not yours but God's." },
      { ref: "Esther 4:14", text: "For if you keep silent at this time, relief and deliverance will rise for the Jews from another place, but you and your father's house will perish. And who knows whether you have not come to the kingdom for such a time as this?" },
      // ── Psalms — guidance, purpose, times, boldness ──
      { ref: "Psalm 2:8", text: "Ask of me, and I will make the nations your heritage, and the ends of the earth your possession." },
      { ref: "Psalm 5:12", text: "For you bless the righteous, O Lord; you cover him with favor as with a shield." },
      { ref: "Psalm 18:29", text: "For by you I can run against a troop, and by my God I can leap over a wall." },
      { ref: "Psalm 20:4", text: "May he grant you your heart's desire and fulfill all your plans!" },
      { ref: "Psalm 25:4-5", text: "Make me to know your ways, O Lord; teach me your paths. Lead me in your truth and teach me, for you are the God of my salvation; for you I wait all the day long." },
      { ref: "Psalm 31:15", text: "My times are in your hand; rescue me from the hand of my enemies and from my persecutors!" },
      { ref: "Psalm 32:8", text: "I will instruct you and teach you in the way you should go; I will counsel you with my eye upon you." },
      { ref: "Psalm 37:5-6", text: "Commit your way to the Lord; trust in him, and he will act. He will bring forth your righteousness as the light, and your justice as the noonday." },
      { ref: "Psalm 37:23-24", text: "The steps of a man are established by the Lord, when he delights in his way; though he fall, he shall not be cast headlong, for the Lord upholds his hand." },
      { ref: "Psalm 57:2", text: "I cry out to God Most High, to God who fulfills his purpose for me." },
      { ref: "Psalm 90:12", text: "So teach us to number our days that we may get a heart of wisdom." },
      { ref: "Psalm 110:1-3", text: "The Lord says to my Lord: Sit at my right hand, until I make your enemies your footstool. The Lord sends forth from Zion your mighty scepter. Rule in the midst of your enemies! Your people will offer themselves freely on the day of your power, in holy garments; from the womb of the morning, the dew of your youth will be yours." },
      { ref: "Psalm 126:5-6", text: "Those who sow in tears shall reap with shouts of joy! He who goes out weeping, bearing the seed for sowing, shall come home with shouts of joy, bringing his sheaves with him." },
      { ref: "Psalm 138:8", text: "The Lord will fulfill his purpose for me; your steadfast love, O Lord, endures forever. Do not forsake the work of your hands." },
      // ── Proverbs — diligence, calling, purpose, leadership ──
      { ref: "Proverbs 3:27", text: "Do not withhold good from those to whom it is due, when it is in your power to do it." },
      { ref: "Proverbs 11:30", text: "The fruit of the righteous is a tree of life, and whoever captures souls is wise." },
      { ref: "Proverbs 14:23", text: "In all toil there is profit, but mere talk tends only to poverty." },
      { ref: "Proverbs 16:1", text: "The plans of the heart belong to man, but the answer of the tongue is from the Lord." },
      { ref: "Proverbs 16:9", text: "The heart of man plans his way, but the Lord establishes his steps." },
      { ref: "Proverbs 18:16", text: "A man's gift makes room for him and brings him before great men." },
      { ref: "Proverbs 19:21", text: "Many are the plans in the mind of a man, but it is the purpose of the Lord that will stand." },
      { ref: "Proverbs 22:29", text: "Do you see a man skillful in his work? He will stand before kings; he will not stand before obscure men." },
      { ref: "Proverbs 29:18", text: "Where there is no prophetic vision the people cast off restraint, but blessed is he who keeps the law." },
      // ── Prophets — mission, calling, times, nations ──
      { ref: "Ecclesiastes 3:1", text: "For everything there is a season, and a time for every matter under heaven." },
      { ref: "Ecclesiastes 3:11", text: "He has made everything beautiful in its time. Also, he has put eternity into man's heart, yet so that he cannot find out what God has done from the beginning to the end." },
      { ref: "Ecclesiastes 9:10", text: "Whatever your hand finds to do, do it with your might, for there is no work or thought or knowledge or wisdom in Sheol, to which you are going." },
      { ref: "Isaiah 6:8", text: "And I heard the voice of the Lord saying, Whom shall I send, and who will go for us? Then I said, Here I am! Send me." },
      { ref: "Isaiah 46:10", text: "Declaring the end from the beginning and from ancient times things not yet done, saying, My counsel shall stand, and I will accomplish all my purpose." },
      { ref: "Isaiah 55:11", text: "So shall my word be that goes out from my mouth; it shall not return to me empty, but it shall accomplish that which I purpose, and shall succeed in the thing for which I sent it." },
      { ref: "Isaiah 60:1-3", text: "Arise, shine, for your light has come, and the glory of the Lord has risen upon you. For behold, darkness shall cover the earth, and thick darkness the peoples; but the Lord will arise upon you, and his glory will be seen upon you. And nations shall come to your light, and kings to the brightness of your rising." },
      { ref: "Isaiah 60:22", text: "The least one shall become a clan, and the smallest one a mighty nation; I am the Lord; in its time I will hasten it." },
      { ref: "Jeremiah 1:7-8", text: "But the Lord said to me, Do not say, I am only a youth; for to all to whom I send you, you shall go, and whatever I command you, you shall speak. Do not be afraid of them, for I am with you to deliver you, declares the Lord." },
      { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
      { ref: "Habakkuk 2:3", text: "For still the vision awaits its appointed time; it hastens to the end -- it will not lie. If it seems slow, wait for it; it will surely come; it will not delay." },
      { ref: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?" },
      { ref: "Zechariah 4:6", text: "Then he said to me, This is the word of the Lord to Zerubbabel: Not by might, nor by power, but by my Spirit, says the Lord of hosts." },
      // ── Gospels ──
      { ref: "Matthew 5:14-16", text: "You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house. In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven." },
      { ref: "Matthew 28:18-20", text: "And Jesus came and said to them, All authority in heaven and on earth has been given to me. Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age." },
      { ref: "Mark 16:15", text: "And he said to them, Go into all the world and proclaim the gospel to the whole creation." },
      { ref: "Luke 4:18-19", text: "The Spirit of the Lord is upon me, because he has anointed me to proclaim good news to the poor. He has sent me to proclaim liberty to the captives and recovering of sight to the blind, to set at liberty those who are oppressed, to proclaim the year of the Lord's favor." },
      { ref: "John 15:16", text: "You did not choose me, but I chose you and appointed you that you should go and bear fruit and that your fruit should abide, so that whatever you ask the Father in my name, he may give it to you." },
      // ── Epistles ──
      { ref: "Acts 1:8", text: "But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth." },
      { ref: "Acts 17:26-27", text: "And he made from one man every nation of mankind to live on all the face of the earth, having determined allotted periods and the boundaries of their dwelling place, that they should seek God, and perhaps feel their way toward him and find him." },
      { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
      { ref: "1 Corinthians 15:58", text: "Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord, knowing that in the Lord your labor is not in vain." },
      { ref: "Galatians 6:9", text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up." },
      { ref: "Ephesians 2:10", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them." },
      { ref: "Ephesians 6:10-11", text: "Finally, be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the schemes of the devil." },
      { ref: "Colossians 3:23-24", text: "Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward. You are serving the Lord Christ." },
      { ref: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control." },
      { ref: "2 Timothy 4:7", text: "I have fought the good fight, I have finished the race, I have kept the faith." },
      { ref: "Hebrews 12:1-2", text: "Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith." },
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
  // Start with a few short dendrites so the neuron looks alive from the start
  n.dendrites = [];
  for (let i = 0; i < 3; i++) growDendrite(n);
  // Give the starter dendrites partial extension so they're visible immediately
  n.dendrites.forEach(d => { d.length = d.targetLength * (0.3 + Math.random() * 0.3); });
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
  // Start with 2 short dendrites so new neurons look alive immediately
  neuron.dendrites = [];
  for (let i = 0; i < 2; i++) growDendrite(neuron);
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
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const swipeOverlayRef = useRef(null);

  const [appLoaded, setAppLoaded] = useState(false);
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

  // ─── Authentication ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "signup"
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const cloudSaveTimer = useRef(null);
  const dataLoadedRef = useRef(false);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

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

  // ─── Cloud Sync: Load data from Firestore on login ───
  useEffect(() => {
    if (!user || dataLoadedRef.current) return;
    const loadCloud = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.sessionHistory) setSessionHistory(d.sessionHistory);
          if (d.currentStreak !== undefined) setCurrentStreak(d.currentStreak);
          if (d.longestStreak !== undefined) setLongestStreak(d.longestStreak);
          if (d.lifetimeSeconds !== undefined) setLifetimeSeconds(d.lifetimeSeconds);
          if (d.lifetimeNeurons !== undefined) setLifetimeNeurons(d.lifetimeNeurons);
          if (d.passageNetworks) passageNetworksRef.current = d.passageNetworks;
        }
        dataLoadedRef.current = true;
      } catch (e) {
        console.warn("Cloud load failed, using local state:", e);
        dataLoadedRef.current = true;
      }
    };
    loadCloud();
  }, [user]);

  // ─── Cloud Sync: Save data to Firestore (debounced) ───
  const saveToCloud = useCallback(() => {
    if (!user || !dataLoadedRef.current) return;
    // Debounce: wait 3s after last change before writing
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "users", user.uid), {
          sessionHistory,
          currentStreak,
          longestStreak,
          lifetimeSeconds,
          lifetimeNeurons,
          passageNetworks: passageNetworksRef.current,
          lastSaved: new Date().toISOString(),
          email: user.email || "",
        }, { merge: true });
      } catch (e) {
        console.warn("Cloud save failed:", e);
      }
    }, 3000);
  }, [user, sessionHistory, currentStreak, longestStreak, lifetimeSeconds, lifetimeNeurons]);

  // Trigger cloud save whenever key data changes
  useEffect(() => {
    saveToCloud();
  }, [sessionHistory, currentStreak, longestStreak, lifetimeSeconds, lifetimeNeurons, saveToCloud]);

  // ─── Auth helpers ───
  const handleGoogleSignIn = async () => {
    setAuthError(""); setAuthBusy(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { setAuthError(e.message); }
    setAuthBusy(false);
  };

  const handleEmailAuth = async () => {
    setAuthError(""); setAuthBusy(true);
    try {
      if (authScreen === "signup") {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (e) {
      const msg = e.code === "auth/user-not-found" ? "No account found with this email."
        : e.code === "auth/wrong-password" ? "Incorrect password."
        : e.code === "auth/email-already-in-use" ? "An account already exists with this email."
        : e.code === "auth/weak-password" ? "Password must be at least 6 characters."
        : e.code === "auth/invalid-email" ? "Please enter a valid email address."
        : e.message;
      setAuthError(msg);
    }
    setAuthBusy(false);
  };

  const handleSignOut = async () => {
    // Save before signing out
    if (user && dataLoadedRef.current) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          sessionHistory, currentStreak, longestStreak, lifetimeSeconds, lifetimeNeurons,
          passageNetworks: passageNetworksRef.current,
          lastSaved: new Date().toISOString(),
        }, { merge: true });
      } catch {}
    }
    dataLoadedRef.current = false;
    await signOut(auth);
    // Reset local state
    setSessionHistory([]); setCurrentStreak(0); setLongestStreak(0);
    setLifetimeSeconds(0); setLifetimeNeurons(0);
    passageNetworksRef.current = {};
    setScreen("home");
  };

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

  // Loading state — brief elegant reveal
  useEffect(() => {
    const timer = setTimeout(() => setAppLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const speakAccRef = useRef(0);
  const lastFireRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const logicalW = c.parentElement.clientWidth;
      const logicalH = c.parentElement.clientHeight;
      c.width = logicalW * dpr;
      c.height = logicalH * dpr;
      if (!stateRef.current) stateRef.current = createInitialState(logicalW, logicalH);
      // Initialize ambient particle system
      if (!particlesRef.current) {
        particlesRef.current = Array.from({length: 40}, () => ({
          x: Math.random() * logicalW,
          y: Math.random() * logicalH,
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
    const dpr = window.devicePixelRatio || 1;
    const logW = c.width / dpr, logH = c.height / dpr;
    if (screen === "home") {
      // Home screen: show faint ambient network if passages have been spoken
      // Always keep particles visible — even for first-time users the void feels alive
      const combined = buildCombinedState(logW, logH);
      if (combined.neurons.length > 1) {
        // Dim the network for ambient background effect
        combined.neurons.forEach(n => { n.energy = Math.max(0.08, n.energy * 0.3); n.fireLevel = 0; });
        stateRef.current = combined;
      } else {
        // First-time user — empty network but particles & fog still render
        stateRef.current = { neurons: [], synapses: [], nextId: 0, totalSpeakTime: 0, sessionFires: 0 };
      }
    } else if (screen === "summary" || screen === "history" || screen === "pick-category" || screen === "pick-passage" || screen === "custom") {
      const combined = buildCombinedState(logW, logH);
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
      const dpr = window.devicePixelRatio || 1;
      stateRef.current = loadOrCreateNetwork(p, c.width / dpr, c.height / dpr, selectedCategory?.name);
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
      const a = ctx.createAnalyser(); a.fftSize = 512; a.smoothingTimeConstant = 0.4;
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

  // ─── Swipe-back navigation ───
  const goBack = useCallback(() => {
    switch (screen) {
      case "pick-category": setScreen("home"); break;
      case "pick-passage": setScreen("pick-category"); break;
      case "custom": setScreen("pick-category"); break;
      case "history": setScreen("home"); break;
      case "summary": setSelectedPassage(null); setScreen(selectedCategory ? "pick-passage" : "home"); break;
      // No swipe-back on home or session screens
      default: break;
    }
  }, [screen, selectedCategory]);

  const canSwipeBack = screen !== "home" && screen !== "session";

  const handleTouchStart = useCallback((e) => {
    if (!canSwipeBack) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [canSwipeBack]);

  const handleTouchMove = useCallback((e) => {
    if (!canSwipeBack) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    // Only show indicator if swiping predominantly right and started from left edge area
    if (dx > 10 && Math.abs(dy) < dx * 0.8 && touchStartRef.current.x < 60) {
      const progress = Math.min(1, dx / 120);
      if (swipeOverlayRef.current) {
        swipeOverlayRef.current.style.opacity = progress * 0.6;
        swipeOverlayRef.current.style.transform = `translateX(${Math.min(dx * 0.3, 30) - 30}px)`;
      }
    }
  }, [canSwipeBack]);

  const handleTouchEnd = useCallback((e) => {
    if (!canSwipeBack) return;
    // Reset overlay
    if (swipeOverlayRef.current) {
      swipeOverlayRef.current.style.opacity = 0;
      swipeOverlayRef.current.style.transform = "translateX(-30px)";
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    // Trigger if: swiped right >80px with horizontal dominance, started from left 80px edge, within 400ms
    if (dx > 80 && Math.abs(dy) < dx * 0.7 && touchStartRef.current.x < 80 && dt < 400) {
      goBack();
    }
  }, [canSwipeBack, goBack]);

  // ─── Render loop ───
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); let run = true;
    const loop = () => {
      if (!run) return;
      const dpr = window.devicePixelRatio || 1;
      const w = c.width / dpr, h = c.height / dpr, st = stateRef.current;
      // Scale canvas context for retina sharpness
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        // Focus on speech frequencies (~85-800Hz) — bins 2-40 of 256 bins at 48kHz
        // This ignores high-frequency noise and low rumble, giving a cleaner voice signal
        const speechStart = 2, speechEnd = Math.min(50, d.length);
        let sum = 0, peak = 0;
        for (let i = speechStart; i < speechEnd; i++) {
          sum += d[i];
          if (d[i] > peak) peak = d[i];
        }
        const avg = sum / (speechEnd - speechStart) / 255;
        const peakNorm = peak / 255;
        // Blend average and peak for responsive yet stable signal
        vol = avg * 0.4 + peakNorm * 0.6;
        // Apply gentle curve to make quiet speech more visible
        vol = Math.pow(vol, 0.7);
      }
      const spk = vol > 0.08;
      // Update volume every frame for responsive waveform — minimal throttle
      if (Math.abs(vol - volume) > 0.005) setVolume(vol);
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

        // Fire neurons — every 1.5-3 seconds, responsive heartbeat
        if (now - lastFireRef.current > Math.max(1500, 3000 - vol * 1500)) {
          lastFireRef.current = now;
          fireNeuron(st, st.neurons[Math.floor(Math.random() * st.neurons.length)], synapseMap);
          // Sound: crystalline fire tone
          if (toneRef.current) {
            const notes = ["C5", "E5", "G5", "B5", "D6", "A5"];
            const note = notes[Math.floor(Math.random() * notes.length)];
            try { toneRef.current.fireSynth.triggerAttackRelease(note, "8n"); } catch {}
          }
        }

        // Grow dendrites on neurons — a new neurite sprouts every ~4-8s of speaking
        for (const neuron of st.neurons) {
          if (Math.random() < 0.003 + vol * 0.002) { // ~once every 4-8s at normal volume
            growDendrite(neuron);
          }
        }

        // Spawn new neuron — requires 25-50+ seconds of accumulated speaking
        const si = 25 + Math.min(st.neurons.length * 5, 25);
        if (speakAccRef.current > si && st.neurons.length < 50) {
          speakAccRef.current = 0; addNeuron(st, w, h, sessionPillar);
          setNeuronCount(st.neurons.length); setSynapseCount(st.synapses.length);
          // Sound: deep spawn tone
          if (toneRef.current) {
            const notes = ["C3", "E3", "G3", "A3"];
            const note = notes[Math.floor(Math.random() * notes.length)];
            try { toneRef.current.spawnSynth.triggerAttackRelease(note, "2n"); } catch {}
          }

          // Form extra connections (30% chance) for richer network
          if (Math.random() < 0.30) {
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
        // Animate dendrite growth — slowly extend toward targetLength with unfurling curve
        for (const d of n.dendrites) {
          if (d.targetLength && d.length < d.targetLength) {
            d.length = Math.min(d.targetLength, d.length + 0.4); // visible organic extension
            // Unfurling: curves deepen as dendrite extends, like a plant growing toward light
            const growthPct = d.length / d.targetLength;
            if (growthPct < 0.8) {
              d.curve1 += (Math.random() - 0.5) * 0.02;
              d.curve2 += (Math.random() - 0.5) * 0.02;
            }
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
      // Adaptive trail: ethereal ghost trails when speaking, cleaner when silent
      const trailAlpha = isSessionScreen && spk ? 0.05 : 0.12;
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);

      // Subtle depth fog gradient that breathes — tied to drone rhythm
      const fogGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      const fogOpacity = (0.025 + breath * 0.045) * (isSessionScreen && spk ? 1.2 : 0.6);
      fogGradient.addColorStop(0, `${spc.fogRGB}${fogOpacity * 0.1})`);
      fogGradient.addColorStop(0.4, `${spc.fogRGB}${fogOpacity * 0.05})`);
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

        // If forming, draw a reaching growth cone at the tip — dramatic flash that settles
        if (s.forming) {
          const [tipX, tipY] = bezPt(from.x, from.y, cpx, cpy, to.x, to.y, s.formProgress);
          // Bright flash at beginning of formation, settles as it completes
          const formIntensity = 1 - s.formProgress * 0.6;
          const tipGlowR = 8 + (1 - s.formProgress) * 8; // larger at start
          const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tipGlowR);
          tipGlow.addColorStop(0, `rgba(255, 253, 255, ${0.4 * formIntensity})`); // white-hot center
          tipGlow.addColorStop(0.2, `${sc.brightRGB}${0.5 * formIntensity})`);
          tipGlow.addColorStop(0.5, `${sc.fireRGB}${0.2 * formIntensity})`);
          tipGlow.addColorStop(1, `${sc.fogRGB}0)`);
          ctx.fillStyle = tipGlow; ctx.beginPath(); ctx.arc(tipX, tipY, tipGlowR, 0, Math.PI * 2); ctx.fill();
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

        // ── Outer glow — wide, luminous, breathes — fluorescence microscopy style ──
        const glowR = (r + 35 + fire * 45 + energy * 18) * breathMod;
        const glow = ctx.createRadialGradient(n.x, n.y, r * 0.2, n.x, n.y, glowR);
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
          // Sharp white-hot center when firing — like a crystalline flash
          somaGrad.addColorStop(0, `rgba(255, 253, 255, ${Math.min(0.95, (0.65 + fire * 0.4)) * lum})`);
          somaGrad.addColorStop(0.15, `${pc.brightRGB}${(0.5 + fire * 0.3) * lum})`);
          somaGrad.addColorStop(0.5, `${pc.softRGB}${(0.22 + fire * 0.15) * lum})`);
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

        // ── Spawn glow ring — expanding ring when neuron is brand new ──
        if (n.maturity < 0.15) {
          const spawnPhase = n.maturity / 0.15; // 0 to 1 over first ~20 seconds
          const ringR = 15 + spawnPhase * 40;
          const ringAlpha = (1 - spawnPhase) * 0.2;
          ctx.strokeStyle = `${pc.brightRGB}${ringAlpha})`;
          ctx.lineWidth = 1.5 * (1 - spawnPhase);
          ctx.beginPath(); ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2); ctx.stroke();
          // Soft glow fill
          const spawnGlow = ctx.createRadialGradient(n.x, n.y, ringR * 0.5, n.x, n.y, ringR * 1.5);
          spawnGlow.addColorStop(0, `${pc.fogRGB}${ringAlpha * 0.3})`);
          spawnGlow.addColorStop(1, `${pc.deepRGB}0)`);
          ctx.fillStyle = spawnGlow; ctx.beginPath(); ctx.arc(n.x, n.y, ringR * 1.5, 0, Math.PI * 2); ctx.fill();
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
      padding: "0 28px",
      paddingTop: "max(60px, env(safe-area-inset-top, 60px))",
      paddingBottom: "max(60px, calc(60px + env(safe-area-inset-bottom, 0px)))",
      paddingLeft: "max(28px, env(safe-area-inset-left, 28px))",
      paddingRight: "max(28px, env(safe-area-inset-right, 28px))",
      fontFamily: FONT,
    }}>
      {/* Breathing fog gradient — always present, slowly pulsing */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, rgba(124,106,255,0.07) 0%, rgba(79,70,229,0.025) 40%, transparent 70%)",
        animation: "renewFogBreathe 12s ease-in-out infinite",
      }} />

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
        height: 1, position: "relative",
        background: `linear-gradient(90deg, transparent, ${P.cardBorder}, transparent)`,
        margin: "10px 0",
        animation: "renewDividerGrow 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: "0.65s",
        overflow: "hidden",
      }}>
        {/* Shimmer — light catching a thin wire */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, transparent 30%, rgba(165,180,252,0.25) 50%, transparent 70%)",
          backgroundSize: "200px 1px",
          animation: "renewDividerShimmer 4s linear infinite",
          animationDelay: "2s",
        }} />
      </div>

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

      {/* Sign out — top right, subtle */}
      <button onClick={handleSignOut} style={{
        position: "absolute", top: "max(20px, env(safe-area-inset-top, 20px))", right: "max(22px, env(safe-area-inset-right, 22px))",
        background: "none", border: "none", color: P.textDim, fontSize: 9,
        cursor: "pointer", fontFamily: FONT, letterSpacing: 1, padding: "4px 0",
        transition: "color 0.3s",
      }}>SIGN OUT</button>

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
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>back</button>
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
            background: `linear-gradient(135deg, rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.04) 0%, ${P.card} 60%)`,
            boxShadow: `inset 0 0 40px rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.03)`,
            animation: `renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${i * 0.08}s`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accentCSS; e.currentTarget.style.background = `linear-gradient(135deg, rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.08) 0%, ${P.surface} 60%)`; e.currentTarget.style.boxShadow = `0 0 25px rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.1), inset 0 0 40px rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.05)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = P.cardBorder; e.currentTarget.style.borderLeftColor = accentCSS; e.currentTarget.style.background = `linear-gradient(135deg, rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.04) 0%, ${P.card} 60%)`; e.currentTarget.style.boxShadow = `inset 0 0 40px rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, 0.03)`; }}
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
    <div className="renew-smooth-scroll renew-scroll-container" style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.88)", padding: 24,
      paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
      paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
      overflowY: "auto", fontFamily: FONT,
    }}>
      <button className="renew-btn-tap" onClick={() => setScreen("pick-category")} style={backBtn}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>back</button>
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
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>back</button>
      <div style={labelStyle}>Custom passage</div>
      <h2 style={{ color: P.white, fontSize: 16, fontWeight: 700, margin: "4px 0 24px", fontFamily: FONT, letterSpacing: 2 }}>
        Enter your Scripture
      </h2>

      <div style={{ marginBottom: 16 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Reference</div>
        <input className="renew-input" value={customRef} onChange={e => setCustomRef(e.target.value)}
          placeholder="e.g. Psalm 91:1-2"
          style={{
            width: "100%", boxSizing: "border-box",
            background: P.surface, border: `1px solid ${P.cardBorder}`,
            borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
            fontFamily: FONT, outline: "none", fontWeight: 400,
            transition: "border-color 0.3s, box-shadow 0.3s",
          }} />
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Scripture text</div>
        <textarea className="renew-input" value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder="Type or paste the Scripture here..."
          rows={6}
          style={{
            width: "100%", boxSizing: "border-box",
            background: P.surface, border: `1px solid ${P.cardBorder}`,
            borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
            fontFamily: FONT_BODY, outline: "none", resize: "vertical", lineHeight: 1.85, fontWeight: 300,
            transition: "border-color 0.3s, box-shadow 0.3s",
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
              <div style={{ color: s.color, fontSize: 15, fontWeight: 700, fontFamily: FONT, textShadow: `0 0 12px ${s.color}44`, animation: "renewBreathe 6s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>{s.val}</div>
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
            background: isSpeaking
              ? `linear-gradient(135deg, rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.06) 0%, rgba(10,10,10,0.75) 40%)`
              : "linear-gradient(135deg, rgba(20,18,15,0.5) 0%, rgba(10,10,10,0.45) 100%)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderColor: isSpeaking ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.2)` : "rgba(255,245,230,0.06)",
            transition: "all 0.5s", maxHeight: 130, overflowY: "auto",
            boxShadow: isSpeaking
              ? `0 0 30px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.08), inset 0 1px 0 rgba(255,245,230,0.04)`
              : "inset 0 1px 0 rgba(255,245,230,0.03)",
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

        {/* Live waveform visualizer — responsive to voice */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 2, height: 44,
            padding: "0 12px",
          }}>
            {Array.from({length: 24}, (_, i) => {
              const center = 11.5;
              const dist = Math.abs(i - center) / center;
              const wave = 1 - dist * 0.55; // less falloff at edges
              const phase = Date.now() * 0.005 + i * 0.6;
              const ripple = Math.sin(phase) * 0.25 + 0.75;
              // Much higher multiplier + minimum height so quiet speech is still visible
              const h = isSpeaking
                ? Math.max(4, 3 + volume * 90 * wave * ripple)
                : 1.5 + Math.sin(Date.now() * 0.0015 + i * 0.4) * 1;
              const barWidth = 2 + Math.sin(i * 0.7) * 0.5;
              return (
                <div key={i} style={{
                  width: barWidth, borderRadius: "3px 3px 1px 1px",
                  background: isSpeaking
                    ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${0.55 + volume * 0.45})`
                    : `rgba(68,68,68,0.4)`,
                  height: `${h}px`,
                  transition: isSpeaking ? "height 0.04s linear, background 0.15s" : "height 0.3s ease-out, background 0.5s",
                  opacity: isSpeaking ? 0.7 + volume * 0.3 : 0.15,
                  boxShadow: isSpeaking && volume > 0.12
                    ? `0 0 ${4 + volume * 12}px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${volume * 0.4})`
                    : "none",
                }} />
              );
            })}
          </div>
          {/* Reflection — faint mirror below */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 2, height: 12,
            padding: "0 12px", opacity: isSpeaking ? 0.18 : 0.04,
            transform: "scaleY(-1)", filter: "blur(1px)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
            transition: "opacity 0.3s",
          }}>
            {Array.from({length: 24}, (_, i) => {
              const center = 11.5;
              const dist = Math.abs(i - center) / center;
              const wave = 1 - dist * 0.55;
              const phase = Date.now() * 0.005 + i * 0.6;
              const ripple = Math.sin(phase) * 0.25 + 0.75;
              const h = isSpeaking
                ? Math.min(12, (3 + volume * 90 * wave * ripple) * 0.25)
                : Math.min(12, 1);
              const barWidth = 2 + Math.sin(i * 0.7) * 0.5;
              return (
                <div key={i} style={{
                  width: barWidth, borderRadius: 1,
                  background: isSpeaking
                    ? `rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.5)`
                    : P.textDim,
                  height: `${h}px`,
                  transition: isSpeaking ? "height 0.04s linear" : "height 0.3s ease-out",
                }} />
              );
            })}
          </div>
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

      {/* Vignette — pulses with voice when speaking, dims to quiet anticipation when listening */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        boxShadow: isSpeaking
          ? `inset 0 0 ${60 + volume * 100}px rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, ${0.02 + volume * 0.12})`
          : "inset 0 0 120px rgba(0,0,0,0.4)",
        transition: isSpeaking ? "box-shadow 0.15s ease-out" : "box-shadow 1.5s ease-in-out",
        opacity: isSpeaking ? 1 : 0.8,
      }} />
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
        {/* Radial light burst behind "Well done" */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.08) 0%, transparent 70%)`,
          animation: "renewRadialBurst 2s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.3s",
          pointerEvents: "none",
        }} />
        {/* Expanding concentric rings */}
        {[0, 1, 2].map(ri => (
          <div key={ri} style={{
            position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
            width: 200, height: 200, borderRadius: "50%",
            border: `1px solid rgba(${sessionPillarUI.fire[0]}, ${sessionPillarUI.fire[1]}, ${sessionPillarUI.fire[2]}, 0.08)`,
            animation: "renewRingExpand 3s ease-out both",
            animationDelay: `${0.5 + ri * 0.6}s`,
            pointerEvents: "none",
          }} />
        ))}

        <div style={{
          animation: "renewFadeInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.1s", textAlign: "center", position: "relative",
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
                animation: "renewAchievementFlash 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: `${0.7 + idx * 0.18}s`,
              }}>
                <span style={{ color: P.textSoft, fontSize: 11, fontFamily: FONT_BODY }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: 14, fontWeight: 700, fontFamily: FONT, textShadow: `0 0 8px ${item.color}33` }}>{item.value}</span>
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
              <div style={{ color: P.streak, fontSize: 13, fontWeight: 700, fontFamily: FONT, animation: "renewStreakFlicker 3s ease-in-out infinite", display: "flex", alignItems: "center", gap: 5 }}>
                {currentStreak} day streak
                <span style={{ fontSize: 10, lineHeight: 1 }}>{"\u{1F525}"}</span>
              </div>
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
          <button className="renew-btn-tap" onClick={() => { setSelectedPassage(null); setScreen(selectedCategory ? "pick-passage" : "home"); }} style={{
            ...btnMain,
            background: "linear-gradient(135deg, #8B7AFF 0%, #7C6AFF 40%, #9B8AFF 100%)",
            boxShadow: "0 0 35px rgba(155,138,255,0.25), 0 2px 12px rgba(0,0,0,0.3)",
          }}>
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
    <div className="renew-smooth-scroll renew-scroll-container" style={{
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
      <button className="renew-btn-tap" onClick={() => setScreen("home")} style={backBtn}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>back</button>
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
            background: `linear-gradient(180deg, rgba(${s.color === P.accent ? '124,106,255' : s.color === P.streak ? '251,146,60' : s.color === P.fire ? '192,132,252' : '165,180,252'}, 0.04) 0%, ${P.card} 100%)`,
            animation: `renewStaggerIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ ...statNum(s.color), fontSize: 16, textShadow: `0 0 10px ${s.color}33` }}>{s.value}</div>
            <div style={{ ...statLabel, fontSize: 7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...labelStyle, marginBottom: 10 }}>Past sessions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
        {/* Timeline vertical line */}
        {sessionHistory.length > 0 && (
          <div style={{
            position: "absolute", left: 18, top: 10, bottom: 10, width: 1,
            background: `linear-gradient(180deg, ${P.cardBorder}, rgba(124,106,255,0.12), ${P.cardBorder})`,
          }} />
        )}
        {[...sessionHistory].reverse().map((s, i) => {
          // Find pillar color from passage reference
          const pillarCat = SCRIPTURE_CATEGORIES.find(c => c.passages.some(p => p.ref === s.ref));
          const pc = pillarCat ? getPillarColors(pillarCat.name).fire : [124, 106, 255];
          const refColor = `rgb(${pc[0]}, ${pc[1]}, ${pc[2]})`;
          return (
          <div key={i} style={{
            ...card, padding: "12px 14px 12px 42px",
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 6, position: "relative", borderLeft: "none",
          }}>
            {/* Timeline node */}
            <div style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              width: 12, height: 12, borderRadius: "50%", zIndex: 2,
              background: `radial-gradient(circle, ${refColor}, rgba(${pc[0]}, ${pc[1]}, ${pc[2]}, 0.3))`,
              boxShadow: `0 0 8px rgba(${pc[0]}, ${pc[1]}, ${pc[2]}, 0.3)`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: refColor, fontSize: 12, fontWeight: 600, fontFamily: FONT }}>{s.ref}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>
                {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: P.accent, fontSize: 12, fontWeight: 600, fontFamily: FONT }}>{fmtShort(s.duration)}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: FONT }}>{s.neurons} neurons</div>
            </div>
          </div>
          );
        })}
      </div>
      {sessionHistory.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 50, padding: "0 20px" }}>
          {/* Poetic empty state with faint neural sketch */}
          <div style={{
            width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px",
            background: "radial-gradient(circle, rgba(165,180,252,0.08), transparent 70%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(165,180,252,0.3), rgba(99,85,216,0.1))",
              boxShadow: "0 0 12px rgba(165,180,252,0.15)",
            }} />
          </div>
          <div style={{ color: P.textDim, fontSize: 12, fontFamily: FONT_BODY, fontWeight: 300, lineHeight: 1.8 }}>
            Your story begins with a single verse.
          </div>
          <div style={{ color: P.textGhost, fontSize: 10, fontFamily: FONT_BODY, fontWeight: 300, marginTop: 6 }}>
            Speak it aloud and watch something grow.
          </div>
        </div>
      )}
    </div>
  );

  // Screen content wrapper with transition animation
  // ─── Auth Screen ───
  if (authLoading) {
    return (
      <div style={{ background: "#000", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 9, height: 9, borderRadius: "50%",
          background: "radial-gradient(circle, #A5B4FC, #6366F1)",
          boxShadow: "0 0 30px rgba(165,180,252,0.5), 0 0 60px rgba(124,106,255,0.2)",
          animation: "renewPulseGlow 2s ease-in-out infinite",
        }} />
      </div>
    );
  }

  if (!user) {
    const handleSplashContinue = () => {
      setSplashExiting(true);
      setTimeout(() => { setShowSplash(false); setSplashExiting(false); }, 700);
    };

    // ─── Splash Screen — matches home screen aesthetic ───
    if (showSplash) {
      return (
        <div className="renew-noise" style={{
          background: "#000", width: "100%", height: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden", fontFamily: FONT,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          animation: splashExiting ? "renewSplashExit 0.7s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
        }}>
          {/* Breathing fog — same as home */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 40%, rgba(124,106,255,0.06) 0%, transparent 65%)",
            animation: "renewFogBreathe 12s ease-in-out infinite",
          }} />

          {/* Spacer to push content up from true center — accounts for footer on iPhone */}
          <div style={{ flex: "0 0 0" }} />

          {/* Logo orb — matches home screen size */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            marginTop: "-10vh",
            background: "radial-gradient(circle, rgba(165,180,252,0.18), rgba(79,70,229,0.06) 60%, transparent 80%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
            animation: "renewLogoEntrance 1.4s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}>
            <div style={{
              width: 9, height: 9, borderRadius: "50%",
              background: "radial-gradient(circle, #A5B4FC, #6366F1)",
              boxShadow: "0 0 20px rgba(165,180,252,0.5), 0 0 40px rgba(124,106,255,0.15)",
            }} />
          </div>

          {/* RENEW title — matches home screen */}
          <h1 style={{
            color: P.white, fontSize: 15, fontWeight: 700, margin: 0,
            letterSpacing: 8, textTransform: "uppercase", fontFamily: FONT,
            animation: "renewFadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
            animationDelay: "0.4s",
          }}>RENEW</h1>

          {/* Divider with shimmer — matches home screen */}
          <div style={{
            width: 120, height: 1, position: "relative",
            background: `linear-gradient(90deg, transparent, ${P.cardBorder}, transparent)`,
            margin: "10px 0",
            animation: "renewDividerGrow 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
            animationDelay: "0.65s",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 30%, rgba(165,180,252,0.25) 50%, transparent 70%)",
              backgroundSize: "200px 1px",
              animation: "renewDividerShimmer 4s linear infinite",
              animationDelay: "2s",
            }} />
          </div>

          {/* Tagline — matches home screen first-time user */}
          <div style={{
            animation: "renewFadeInUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
            animationDelay: "0.85s", textAlign: "center",
          }}>
            <p style={{
              color: P.textSoft, fontSize: 14, fontWeight: 300, textAlign: "center",
              maxWidth: 280, lineHeight: 1.8, margin: "0 0 4px", fontFamily: FONT_BODY,
              opacity: 0.9,
            }}>speak the Word</p>
            <p style={{
              color: P.textDim, fontSize: 11, fontWeight: 400, textAlign: "center",
              maxWidth: 280, lineHeight: 1.6, margin: "0 0 16px", fontFamily: FONT_BODY,
              letterSpacing: 0.3,
            }}>And watch what grows.</p>
          </div>

          {/* Begin button — matches home screen */}
          <div style={{
            animation: "renewFadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
            animationDelay: "1.15s", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <button className="renew-btn-tap" onClick={handleSplashContinue} style={{
              ...btnMain,
              background: "linear-gradient(135deg, #7C6AFF 0%, #6355D8 100%)",
              boxShadow: "0 0 30px rgba(124,106,255,0.2), 0 2px 8px rgba(0,0,0,0.3)",
              animation: "renewPulseGlow 3s ease-in-out infinite",
              borderRadius: 10,
            }}>Begin</button>
          </div>

          {/* Footer verse — matches home screen */}
          <div style={{
            position: "absolute", bottom: "max(20px, env(safe-area-inset-bottom, 20px))",
            left: 20, right: 20, textAlign: "center",
            animation: "renewBreathe 8s cubic-bezier(0.37, 0, 0.63, 1) infinite",
          }}>
            <div style={{ color: P.textGhost, fontSize: 9, fontStyle: "italic", lineHeight: 1.6, fontFamily: FONT_BODY }}>
              "This Book of the Law shall not depart from your mouth..."
            </div>
            <div style={{ color: P.textGhost, fontSize: 8, marginTop: 4, fontWeight: 700, letterSpacing: 2, fontFamily: FONT }}>
              JOSHUA 1:8
            </div>
          </div>
        </div>
      );
    }

    // ─── Login Screen — appears after splash with blur transition ───
    return (
      <div className="renew-noise" style={{
        background: "#000", width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 32px", fontFamily: FONT, position: "relative", overflow: "hidden",
        animation: "renewLoginEnter 0.8s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        {/* Breathing fog */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 40%, rgba(124,106,255,0.06) 0%, transparent 65%)",
          animation: "renewFogBreathe 12s ease-in-out infinite",
        }} />

        {/* Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(165,180,252,0.18), rgba(79,70,229,0.06) 60%, transparent 80%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 14,
          animation: "renewLogoEntrance 1.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%",
            background: "radial-gradient(circle, #A5B4FC, #6366F1)",
            boxShadow: "0 0 20px rgba(165,180,252,0.5), 0 0 40px rgba(124,106,255,0.15)",
          }} />
        </div>

        <h1 style={{
          color: "#fff", fontSize: 15, fontWeight: 700, margin: 0,
          letterSpacing: 8, textTransform: "uppercase", fontFamily: FONT,
          animation: "renewFadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.2s", marginBottom: 6,
        }}>RENEW</h1>

        <p style={{
          color: P.textSoft, fontSize: 12, fontWeight: 300, fontFamily: FONT_BODY,
          marginBottom: 32, textAlign: "center", lineHeight: 1.6,
          animation: "renewFadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.4s",
        }}>
          speak the Word &middot; renew your mind
        </p>

        {/* Auth form */}
        <div style={{
          width: "100%", maxWidth: 320,
          animation: "renewFadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) both",
          animationDelay: "0.6s",
        }}>
          {/* Google sign-in */}
          <button className="renew-btn-tap" onClick={handleGoogleSignIn} disabled={authBusy} style={{
            width: "100%", padding: "14px 20px", fontSize: 13, fontWeight: 600,
            fontFamily: FONT, letterSpacing: 0.5, cursor: "pointer",
            background: "#fff", color: "#333", border: "none", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            opacity: authBusy ? 0.6 : 1,
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: P.cardBorder }} />
            <span style={{ color: P.textDim, fontSize: 10, fontFamily: FONT, letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: P.cardBorder }} />
          </div>

          {/* Email / Password */}
          <input className="renew-input" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
            placeholder="Email address" type="email"
            style={{
              width: "100%", boxSizing: "border-box", marginBottom: 10,
              background: P.surface, border: `1px solid ${P.cardBorder}`,
              borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
              fontFamily: FONT_BODY, outline: "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
          />
          <input className="renew-input" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
            placeholder="Password" type="password"
            style={{
              width: "100%", boxSizing: "border-box", marginBottom: 14,
              background: P.surface, border: `1px solid ${P.cardBorder}`,
              borderRadius: 10, padding: "13px 16px", color: P.text, fontSize: 13,
              fontFamily: FONT_BODY, outline: "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
          />

          {authError && (
            <div style={{
              color: P.danger, fontSize: 11, fontFamily: FONT_BODY, marginBottom: 12,
              textAlign: "center", lineHeight: 1.5,
            }}>{authError}</div>
          )}

          <button className="renew-btn-tap" onClick={handleEmailAuth} disabled={authBusy || !authEmail || !authPassword} style={{
            background: "linear-gradient(135deg, #7C6AFF 0%, #6355D8 100%)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "14px 36px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: FONT, letterSpacing: 1, textTransform: "uppercase",
            boxShadow: "0 0 30px rgba(124,106,255,0.15), 0 2px 8px rgba(0,0,0,0.3)",
            width: "100%", textAlign: "center",
            opacity: (authBusy || !authEmail || !authPassword) ? 0.5 : 1,
            transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            {authBusy ? "..." : authScreen === "signup" ? "Create Account" : "Sign In"}
          </button>

          <button onClick={() => { setAuthScreen(authScreen === "login" ? "signup" : "login"); setAuthError(""); }} style={{
            background: "none", border: "none", color: P.accent, fontSize: 11,
            cursor: "pointer", fontFamily: FONT_BODY, marginTop: 16,
            letterSpacing: 0.3, width: "100%", textAlign: "center",
          }}>
            {authScreen === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          position: "absolute", bottom: "max(20px, env(safe-area-inset-bottom, 20px))",
          left: 20, right: 20, textAlign: "center",
          animation: "renewBreathe 8s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        }}>
          <div style={{ color: P.textGhost, fontSize: 9, fontStyle: "italic", lineHeight: 1.6, fontFamily: FONT_BODY }}>
            "This Book of the Law shall not depart from your mouth..."
          </div>
          <div style={{ color: P.textGhost, fontSize: 8, marginTop: 4, fontWeight: 700, letterSpacing: 2, fontFamily: FONT }}>
            JOSHUA 1:8
          </div>
        </div>
      </div>
    );
  }

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
    }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      {/* Swipe-back edge indicator */}
      {canSwipeBack && (
        <div ref={swipeOverlayRef} style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 32, zIndex: 200,
          background: "linear-gradient(90deg, rgba(124,106,255,0.15), transparent)",
          opacity: 0, transform: "translateX(-30px)",
          transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7, marginLeft: 4 }}>
            <path d="M10 3L5 8L10 13" stroke="rgba(165,180,252,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
      <div key={screen} className={screen !== "session" ? "renew-screen-enter" : ""} style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        {screenContent}
      </div>
      {/* Loading state — logo dot materializing then dissolving */}
      {!appLoaded && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 100,
          background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%",
            background: "radial-gradient(circle, #A5B4FC, #6366F1)",
            boxShadow: "0 0 30px rgba(165,180,252,0.5), 0 0 60px rgba(124,106,255,0.2)",
            animation: "renewLogoEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
          }} />
        </div>
      )}
    </div>
  );
}
