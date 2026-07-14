// RiAura activity track — the same 8 domains and age structure as the WHO
// questionnaire, but hands-on activities instead of questions. Activities are
// authored per age tier (child 3–12, teen 12–18, adult 18+); each age group
// maps to a tier so the picker still shows all 8 groups like the WHO flow.
//
// Domain 1 (Attention Intelligence) is the exception: it ships a detailed,
// immersive, adaptive activity bank authored per *exact* age group — see
// riauraDomain1Activities.js.

import RIAURA_DOMAIN1_ACTIVITIES from './riauraDomain1Activities';

export function tierForGroup(key) {
  if (key === 'g3_6' || key === 'g6_9' || key === 'g9_12') return 'child';
  if (key === 'g12_18') return 'teen';
  return 'adult';
}

export const TIER_LABEL = { child: 'Children', teen: 'Teens', adult: 'Adults' };

const RIAURA_ACTIVITIES = {
  1: { // Attention & Focus
    child: [
      { title: 'Sound Safari',   desc: 'Close your eyes for a minute and count every different sound you hear.', minutes: 2 },
      { title: 'Statue Game',    desc: 'Freeze like a statue and hold perfectly still as long as you can.',       minutes: 3 },
      { title: 'Candle Breaths', desc: 'Pretend to slowly blow out a candle 5 times, watching your breath.',      minutes: 2 },
      { title: 'Spot the Change',desc: 'Look at a tray of objects, close your eyes while one is removed, then name it.', minutes: 4 },
    ],
    teen: [
      { title: 'Single-Task Sprint', desc: 'Pick one task, silence your phone, and focus fully for 15 minutes.',   minutes: 15 },
      { title: 'Breath Anchor',      desc: 'Follow your breathing for 3 minutes; restart the count whenever your mind wanders.', minutes: 3 },
      { title: 'Focus Journal',      desc: 'Note 3 things that pulled your attention today and one fix for each.', minutes: 5 },
      { title: 'Detail Scan',        desc: 'Study an image for 30 seconds, look away, and list every detail you recall.', minutes: 4 },
    ],
    adult: [
      { title: 'Deep-Work Block',  desc: 'Work distraction-free on one task for a 25-minute Pomodoro.',           minutes: 25 },
      { title: 'Mindful Minute',   desc: 'Give full attention to your breath for 60 seconds, three separate times today.', minutes: 5 },
      { title: 'Attention Audit',  desc: 'Track what interrupts you for an hour, then design one fix.',           minutes: 10 },
      { title: 'Sensory Grounding',desc: 'Name 5 things you see, 4 you hear, and 3 you feel, right now.',         minutes: 3 },
    ],
  },
  2: { // Memory
    child: [
      { title: 'Story Chain',   desc: 'Retell a story you heard, keeping all the events in the right order.', minutes: 4 },
      { title: 'Shopping List', desc: 'Memorize 5 items, play a short game, then recall them.',              minutes: 3 },
      { title: 'Picture Recall',desc: 'Look at a picture for 20 seconds, then draw what you remember.',       minutes: 5 },
      { title: 'Rhyme & Repeat',desc: 'Learn a short rhyme and say it back from memory.',                    minutes: 3 },
    ],
    teen: [
      { title: 'Spaced Recall', desc: 'Learn 5 facts now; recall them after 1 hour and again tonight.',      minutes: 10 },
      { title: 'Memory Palace', desc: 'Place 6 items along a familiar route and walk it in your mind.',      minutes: 8 },
      { title: 'Name Game',     desc: 'Recall 3 people’s names using a vivid linking image for each.',       minutes: 5 },
      { title: 'Teach-Back',    desc: 'Explain something you learned today out loud, from memory.',          minutes: 5 },
    ],
    adult: [
      { title: 'Spaced Repetition', desc: 'Review key facts at 1-day, 3-day and 1-week intervals.',          minutes: 10 },
      { title: 'Method of Loci',    desc: 'Build a memory palace for a list you actually need to remember.', minutes: 10 },
      { title: 'Recall First',      desc: 'Try to recall material from memory before you re-read it.',        minutes: 8 },
      { title: 'Daily Recap',       desc: 'Tonight, replay three moments from your day in vivid detail.',     minutes: 5 },
    ],
  },
  3: { // Processing Speed
    child: [
      { title: 'Beat the Clock', desc: 'Sort colored objects into groups as fast as you can.',      minutes: 3 },
      { title: 'Clap Patterns',  desc: 'Copy a clapping rhythm, going faster each round.',          minutes: 3 },
      { title: 'Quick Match',    desc: 'Match shapes to their outlines against a timer.',           minutes: 4 },
      { title: 'Number Hop',     desc: 'Call out numbers 1–20 as fast as you can, then backward.',  minutes: 3 },
    ],
    teen: [
      { title: 'Speed Sorting', desc: 'Sort a shuffled deck of cards by suit as fast as you can, twice.', minutes: 5 },
      { title: 'Rapid Naming',  desc: 'Name 20 objects around you in under a minute.',                    minutes: 2 },
      { title: 'Timed Puzzles', desc: 'Solve 5 quick logic puzzles against a stopwatch.',                 minutes: 8 },
      { title: 'Reaction Catch',desc: 'Have someone drop a ruler; catch it and track your speed.',        minutes: 4 },
    ],
    adult: [
      { title: 'Timed Drills',  desc: 'Do a set of quick mental-math problems against the clock.',   minutes: 8 },
      { title: 'Speed Reading', desc: 'Read a passage 20% faster, then check your comprehension.',    minutes: 10 },
      { title: 'Dual-Task Warmup', desc: 'Count backward by 7 while walking a straight line.',        minutes: 5 },
      { title: 'Rapid Triage',  desc: 'Sort your inbox or a to-do list as fast as accuracy allows.',  minutes: 8 },
    ],
  },
  4: { // Reasoning
    child: [
      { title: 'Why Chain',     desc: 'Ask “why” about something 5 times to reach the real reason.', minutes: 4 },
      { title: 'Odd One Out',   desc: 'Find which item in a group doesn’t belong, and say why.',      minutes: 3 },
      { title: 'Pattern Finish',desc: 'Continue a shape or number pattern to the end.',               minutes: 4 },
      { title: 'Build a Bridge',desc: 'Use blocks to solve “how do we cross?” over a gap.',           minutes: 6 },
    ],
    teen: [
      { title: 'Steelman It',    desc: 'Argue the strongest version of the opposite side of your opinion.', minutes: 8 },
      { title: 'Pattern Puzzles',desc: 'Solve 3 matrix or sequence puzzles and explain each rule.',        minutes: 10 },
      { title: 'Cause & Effect', desc: 'Map what led to a recent event, step by step.',                    minutes: 6 },
      { title: 'Assumption Hunt',desc: 'List the hidden assumptions inside a claim you read today.',        minutes: 5 },
    ],
    adult: [
      { title: 'First Principles', desc: 'Break a problem down to its basic truths, then rebuild it.',   minutes: 12 },
      { title: 'Devil’s Advocate', desc: 'Write the strongest case against your current plan.',          minutes: 8 },
      { title: '5 Whys',           desc: 'Ask “why” five times to reach the true cause of an issue.',     minutes: 8 },
      { title: 'Evidence Check',   desc: 'For one belief, list the evidence both for and against it.',    minutes: 6 },
    ],
  },
  5: { // Decision
    child: [
      { title: 'This or That',   desc: 'Choose between two snacks and say your reason out loud.',       minutes: 2 },
      { title: 'Traffic Light',  desc: 'Practice Stop–Think–Go before acting on an urge.',              minutes: 3 },
      { title: 'Two-Step Plan',  desc: 'Decide what to do first and next for a small task.',            minutes: 3 },
      { title: 'Would You Rather',desc:'Answer 3 “would you rather” questions, each with a reason.',     minutes: 4 },
    ],
    teen: [
      { title: 'Pros & Cons',      desc: 'List the upsides and downsides of a real choice you face.',    minutes: 6 },
      { title: 'The Pause Rule',   desc: 'Wait 10 minutes before a non-urgent decision today.',         minutes: 5 },
      { title: 'Future Self',      desc: 'Ask what your future self would thank you for choosing.',      minutes: 5 },
      { title: 'Decision Journal', desc: 'Record a decision and your reason; check the outcome later.',  minutes: 6 },
    ],
    adult: [
      { title: 'Weighted Options', desc: 'Score each option against your top three criteria.',          minutes: 10 },
      { title: 'Pre-Mortem',       desc: 'Imagine the plan failed; list why, then prevent it.',         minutes: 8 },
      { title: '10/10/10',         desc: 'Ask how you’ll feel about it in 10 minutes, 10 months, 10 years.', minutes: 5 },
      { title: 'Reversible?',      desc: 'Decide fast if it’s reversible, slowly if it isn’t.',         minutes: 5 },
    ],
  },
  6: { // Emotional
    child: [
      { title: 'Feelings Faces', desc: 'Name the emotion on 5 different faces.',                        minutes: 3 },
      { title: 'Belly Breaths',  desc: 'Take 5 slow belly breaths when a big feeling shows up.',        minutes: 2 },
      { title: 'Color My Mood',  desc: 'Draw your feeling as a color, then talk about it.',             minutes: 5 },
      { title: 'Kind Words',     desc: 'Say one kind thing to someone today.',                          minutes: 2 },
    ],
    teen: [
      { title: 'Name It to Tame It', desc: 'Write down exactly what you feel and why.',                 minutes: 5 },
      { title: 'Mood Check-Ins',     desc: 'Rate your mood 3 times today and note the trigger.',        minutes: 5 },
      { title: 'Perspective Swap',   desc: 'Describe a recent conflict from the other person’s view.',  minutes: 6 },
      { title: 'Gratitude Three',    desc: 'Write down 3 things you’re grateful for tonight.',          minutes: 4 },
    ],
    adult: [
      { title: 'Affect Labeling', desc: 'Precisely name your emotions as they arise through the day.',  minutes: 5 },
      { title: 'Box Breathing',   desc: 'Inhale 4, hold 4, exhale 4, hold 4 — for two minutes.',        minutes: 3 },
      { title: 'Trigger Log',     desc: 'Note one strong reaction today and what set it off.',          minutes: 6 },
      { title: 'Empathy Reframe', desc: 'Retell someone’s behaviour with a kinder, plausible story.',   minutes: 5 },
    ],
  },
  7: { // Social & Originality
    child: [
      { title: 'Invent a Game',   desc: 'Make up a brand-new game with your own rules.',                minutes: 6 },
      { title: 'Ten Uses',        desc: 'Think of 10 different uses for a spoon.',                      minutes: 4 },
      { title: 'Story Endings',   desc: 'Invent 3 different endings for the same story.',               minutes: 5 },
      { title: 'Take Turns',      desc: 'Practice sharing and taking turns in a game with someone.',    minutes: 5 },
    ],
    teen: [
      { title: 'Alternative Uses', desc: 'List 15 unusual uses for a common object.',                   minutes: 6 },
      { title: 'Remix It',         desc: 'Combine two of your hobbies into one new idea.',              minutes: 6 },
      { title: 'Question Chat',    desc: 'Have a conversation where you only ask questions.',           minutes: 8 },
      { title: 'Idea a Day',       desc: 'Write 5 fresh ideas about a topic you enjoy.',                minutes: 5 },
    ],
    adult: [
      { title: 'Divergent Sprint',  desc: 'Generate 20 ideas for one problem in 10 minutes.',          minutes: 10 },
      { title: 'Cross-Pollinate',   desc: 'Borrow a solution from another field for your problem.',     minutes: 8 },
      { title: 'Deep Listen',       desc: 'In one conversation, reflect back before you reply.',        minutes: 8 },
      { title: 'Constraint Creativity', desc: 'Solve a task with one deliberate limitation.',           minutes: 8 },
    ],
  },
  8: { // Metacognitive
    child: [
      { title: 'What Did I Learn?', desc: 'Say one thing you learned today.',                           minutes: 2 },
      { title: 'Easy or Hard?',     desc: 'Sort today’s tasks into easy and hard, and say why.',        minutes: 3 },
      { title: 'My Plan',           desc: 'Say your plan out loud before you start a task.',            minutes: 2 },
      { title: 'Check My Work',     desc: 'Look back at something and find one thing to improve.',      minutes: 3 },
    ],
    teen: [
      { title: 'Learning Journal', desc: 'Write what worked today and what you’d change next time.',    minutes: 6 },
      { title: 'Predict & Check',  desc: 'Predict a quiz score, then compare it to the real result.',   minutes: 5 },
      { title: 'Strategy Swap',    desc: 'Try a new study method and judge whether it helped.',         minutes: 8 },
      { title: 'Think Aloud',      desc: 'Narrate your thinking out loud while solving a problem.',      minutes: 6 },
    ],
    adult: [
      { title: 'After-Action Review', desc: 'Ask: what went well, what didn’t, and what’s next?',       minutes: 8 },
      { title: 'Calibration Check',   desc: 'Rate your confidence on a task, then check your accuracy.', minutes: 6 },
      { title: 'Strategy Audit',      desc: 'List your go-to methods and pick one to upgrade.',          minutes: 8 },
      { title: 'Reflective Journal',  desc: 'End the day with “what did I learn about how I think?”',    minutes: 6 },
    ],
  },
};

export function getRiauraActivities(domainNum, groupKey) {
  // Domain 1 uses the detailed per-age-group bank; everything else uses the
  // tier-based (child/teen/adult) checklist activities.
  if (domainNum === 1) {
    return RIAURA_DOMAIN1_ACTIVITIES[groupKey] || [];
  }
  const tier = tierForGroup(groupKey);
  return RIAURA_ACTIVITIES[domainNum]?.[tier] || [];
}

export default RIAURA_ACTIVITIES;
