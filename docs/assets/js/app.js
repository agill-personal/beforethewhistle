// \u2500\u2500 PASSWORD GATE \u2500\u2500
const CORRECT     = 'summer2026';
const MAX_TRIES   = 5;
const LOCKOUT_MS  = 60000; // 1 minute

var gateAttempts   = parseInt(sessionStorage.getItem('sr_attempts')  || '0');
var gateLockUntil  = parseInt(sessionStorage.getItem('sr_lockout')   || '0');
var gateCountdown  = null;

function setGateLocked(locked) {
  var input = document.getElementById('pin-input');
  var btn   = document.querySelector('.gate-btn');
  if (input) input.disabled = locked;
  if (btn)   btn.disabled   = locked;
}

function tickLockout() {
  var remaining = Math.ceil((gateLockUntil - Date.now()) / 1000);
  var err = document.getElementById('gate-error');
  if (remaining > 0) {
    if (err) err.textContent = 'Too many attempts. Try again in ' + remaining + ' second' + (remaining !== 1 ? 's' : '') + '.';
    gateCountdown = setTimeout(tickLockout, 1000);
  } else {
    clearTimeout(gateCountdown);
    sessionStorage.removeItem('sr_lockout');
    sessionStorage.setItem('sr_attempts', '0');
    gateAttempts  = 0;
    gateLockUntil = 0;
    if (err) err.textContent = '';
    setGateLocked(false);
    var pinInput = document.getElementById('pin-input');
    if (pinInput) pinInput.focus();
  }
}

function checkPin() {
  if (Date.now() < gateLockUntil) return;
  var input = document.getElementById('pin-input');
  var err   = document.getElementById('gate-error');
  var val   = input ? input.value : '';

  if (val === CORRECT) {
    var gate = document.getElementById('gate');
    if (gate) gate.style.display = 'none';
    sessionStorage.setItem('sr_auth', '1');
    sessionStorage.removeItem('sr_attempts');
    sessionStorage.removeItem('sr_lockout');
  } else {
    gateAttempts++;
    sessionStorage.setItem('sr_attempts', gateAttempts);
    if (input) {
      input.classList.add('error');
      setTimeout(function(){ input.classList.remove('error'); }, 400);
    }

    if (gateAttempts >= MAX_TRIES) {
      gateLockUntil = Date.now() + LOCKOUT_MS;
      sessionStorage.setItem('sr_lockout', gateLockUntil);
      if (input) input.value = '';
      setGateLocked(true);
      tickLockout();
    } else {
      var left = MAX_TRIES - gateAttempts;
      if (err) err.textContent = 'Incorrect code. ' + left + ' attempt' + (left !== 1 ? 's' : '') + ' remaining.';
    }
  }
}

function initGate() {
  if (sessionStorage.getItem('sr_auth') === '1') {
    var gate = document.getElementById('gate');
    if (gate) gate.style.display = 'none';
  } else if (Date.now() < gateLockUntil) {
    setGateLocked(true);
    tickLockout();
  } else {
    setTimeout(function(){ var p = document.getElementById('pin-input'); if (p) p.focus(); }, 100);
  }
}

// \u2500\u2500 GOOGLE SHEETS CONFIG \u2500\u2500
var SHEET_TECHNICAL_URL = '';
var SHEET_STRENGTH_URL  = '';
var SHEET_FITNESS_URL   = '';
var SHEET_CAMP_URL      = '';

// \u2500\u2500 FALLBACK DATA \u2500\u2500
var SESSIONS = {
  '2026-06-04': { focus:'first_touch', title:'First Touch & Receiving', time:'6:30 PM', end_time:'8:00 PM', location:'Park School', skills:['Receiving to feet and turning to face goal','Directional first touch to set up a pass or dribble','Receiving on the back foot and playing away from pressure','Settling a driven pass with a soft inside-of-foot touch','Checking off a defender to create space before receiving','Body shape and foot orientation before the ball arrives'], warmup:[], main:[] },
  '2026-06-05': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Park School', skills:['Wall pass: give and go to break the defensive line','Third-man run: timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass'], warmup:[], main:[] },
  '2026-06-07': { focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'4:30 PM', end_time:'6:00 PM', location:'Park School', skills:['Step-over, scissors, or Cruyff turn to beat a defender','Committing the defender before attempting a move','Jockeying: staying goal-side and on feet under pressure','Forcing the attacker onto their weak foot','Winning the ball back with a clean tackle when the moment is right','Dribbling with purpose, head up, exploit space after the move'], warmup:[], main:[] },
  '2026-06-09': { focus:'first_touch', title:'First Touch & Receiving', time:'6:30 PM', end_time:'8:00 PM', location:'Park School', skills:['Chest control and immediate lay-off or turn','Thigh control from a lofted ball and playing under pressure','Half-volley control on a bouncing ball','Heading down to a teammate or into space','Catching a dropping ball on the instep and moving forward','Winning the second ball after an aerial contest'], warmup:[], main:[] },
  '2026-06-12': { focus:'finishing', title:'Finishing vs. Defensive Pressure', time:'4:30 PM', end_time:'6:00 PM', location:'Park School', skills:['Placed finish into the far corner under pressure','One-touch finish from a cut-back or low cross','Closing down a shooter to force a rushed attempt','Shot power vs. placement: choosing the right technique','Finishing with the weaker foot from a realistic position','Block tackle or interception to prevent a shot on goal'], warmup:[], main:[] },
  '2026-06-15': { focus:'first_touch', title:'First Touch & Receiving', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Shielding the ball on the first touch to protect possession','Fake receive: letting the ball run to lose a tight marker','Scanning before the ball arrives to choose touch direction','One-touch layoff when receiving under a high press','Breaking the press line with a single forward touch','Staying calm and composed when receiving in tight space'], warmup:[], main:[] },
  '2026-06-16': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Overlap trigger: passing and running beyond to receive','Underlap combination: cutting inside as the overlap goes outside','Cross-field pass to change the point of attack','Backfoot pass to a runner arriving late','Third-man combination to break through a defensive block','Two-touch play in tight spaces under pressure'], warmup:[], main:[] },
  '2026-06-18': { focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Holding up play with back to goal under physical pressure','Shielding the ball and drawing a foul','Flicking on or laying off from a back-to-goal position','Spinning off a marker into space behind the defense','Fronting a striker: physical positioning to prevent the turn','Timing a tackle when a forward tries to spin'], warmup:[], main:[] },
  '2026-06-19': { focus:'crossing', title:'Crossing & Aerial Duels', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Early cross delivery before the fullback can close','Near-post run: attacking the first zone of the cross','Far-post run: late arrival to attack the back stick','Defending a cross: calling, attacking the ball early','Near-post flick-on to redirect for a far-post finish','Tracking a far-post runner as a centerback'], warmup:[], main:[] },
  '2026-06-21': { focus:'first_touch', title:'First Touch & Receiving', time:'4:30 PM', end_time:'6:00 PM', location:'Downes', skills:['Check-run and receive: creating space off a defender','Receiving on the half-turn to face forward immediately','Timing the run so the first touch is already in motion','Curved run to stay onside while receiving over the top','Combining movement with a wall pass to arrive in space','First touch into the channel to accelerate beyond the line'], warmup:[], main:[] },
  '2026-06-22': { focus:'finishing', title:'Finishing vs. Defensive Pressure', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['GK 1v1: reading the goalkeeper\'s position','Chip finish when GK is off the line','Driven low finish across the body past a GK','Recovery run to deny a through ball before the finish','Composure in front of goal: slowing the moment down','Decision-making: shoot vs. square vs. hold up'], warmup:[], main:[] },
  '2026-06-23': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Rondo: maintaining possession under a high press','Identifying and passing to the free player','Weight of pass when playing into a striker\'s feet','Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession: when to recycle vs. when to play forward'], warmup:[], main:[] },
  '2026-06-25': { focus:'finishing', title:'Finishing vs. Defensive Pressure', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Second ball instinct: reacting to rebounds and saves','Box presence: positioning to arrive at the right moment','Clearing a rebound under pressure from a forward','Anticipating GK distribution and winning the first touch','Volley finish from a loose ball in the box','Heading technique in aerial duels inside the penalty area'], warmup:[], main:[] },
  '2026-06-26': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Rondo: maintaining possession under a high press','Identifying and passing to the free player','Weight of pass when playing into a striker\'s feet','Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession: when to recycle vs. when to play forward'], warmup:[], main:[] },
  '2026-06-28': { focus:'finishing', title:'Finishing vs. Defensive Pressure', time:'4:30 PM', end_time:'6:00 PM', location:'Downes', skills:['Second ball instinct: reacting to rebounds and saves','Box presence: positioning to arrive at the right moment','Clearing a rebound under pressure from a forward','Anticipating GK distribution and winning the first touch','Volley finish from a loose ball in the box','Heading technique in aerial duels inside the penalty area'], warmup:[], main:[] },
  '2026-06-29': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Wall pass: give and go to break the defensive line','Third-man run: timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass'], warmup:[], main:[] },
  '2026-06-30': { focus:'crossing', title:'Crossing & Aerial Duels', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Getting to the byline and delivering a low cut-back','Late run from midfield to meet the cut-back and shoot','Holding a defensive line as runners attack the cut-back','First-time finish from a low cut-back across the box','Disguising cross direction to delay the defensive shift','Covering the cut-back channel as a defending fullback'], warmup:[], main:[] },
  '2026-07-02': { focus:'first_touch', title:'First Touch & Receiving', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Shoulder check before receiving to identify pressure','Half-turn technique: opening the body to receive facing forward','Using peripheral vision to choose touch direction before contact','Receiving between lines and instantly playing forward','First touch away from pressure in a congested midfield','Controlling the tempo of the game through a composed first touch'], warmup:[], main:[] },
  '2026-07-03': { focus:'crossing', title:'Crossing & Aerial Duels', time:'6:00 PM', end_time:'7:30 PM', location:'Downes', skills:['Attacking a corner kick delivery: near post and far post runs','Zonal marking on set pieces: attacking the ball at highest point','Man-marking assignment on corners: staying with the runner','Heading technique for both attacking and defensive headers','Second ball reaction after a cleared set piece','Goalkeeper distribution from a set piece clearance'], warmup:[], main:[] },
  '2026-07-05': { focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'4:30 PM', end_time:'6:00 PM', location:'Downes', skills:['Pressing trigger: when and how to press the ball','Escape from a press: one-touch away from pressure','Ball protection on the dribble in a high-pressure situation','Coordinated pressing as a pair to cut off passing lanes','Winning the ball back high up the pitch from the front','Countering immediately after winning possession in the press'], warmup:[], main:[] },
};

const MILESTONES = {
  '2026-08-24': { label: '\uD83C\uDFC6 Tryouts Start', cls: 'tryouts' },
};

const PHASES = [
  { label:'Phase 1',   sub:'Jun 11 \u2013 Jul 4',   tag:'Foundation',  desc:'Bodyweight and light load. Master movement patterns.' },
  { label:'Phase 2',   sub:'Jul 5 \u2013 Jul 25',   tag:'Build',       desc:'Add resistance. Introduce plyometrics. Build work capacity.' },
  { label:'Phase 3',   sub:'Jul 26 \u2013 Aug 15',  tag:'Power',       desc:'Heavy strength + explosive work. Peak before tapering.' },
  { label:'Taper',     sub:'Aug 16 \u2013 Aug 28',  tag:'Taper',       desc:'Reduce volume. Stay sharp. Trust your training.' },
  { label:'In-Season', sub:'Aug 29 onwards',   tag:'Sustain',     desc:'Maintain strength through the season. Quality over volume.' },
  { label:'Spring',    sub:'Spring 2027',       tag:'Spring Build',desc:'Rebuild and progress entering spring season.' },
];

const WORKOUTS = {
  0: [
    { day:'Tuesday',   title:'Lower Body A',    duration:'45\u201350 min', exercises:[
      { name:'Goblet Squat',          note:'Full depth, chest up',                  sets:'3 \u00D7 12' },
      { name:'Romanian Deadlift',     note:'Slow eccentric, feel the stretch',      sets:'3 \u00D7 10' },
      { name:'Reverse Lunge',         note:'Alternate legs, controlled',            sets:'3 \u00D7 10 ea' },
      { name:'Glute Bridge',          note:'Pause 2 sec at top',                    sets:'3 \u00D7 15' },
      { name:'Dead Bug',              note:'Lower back stays flat',                 sets:'3 \u00D7 10 ea' },
      { name:'Plank Hold',            note:'Shoulders over wrists',                 sets:'3 \u00D7 30 sec' },
    ]},
    { day:'Thursday',  title:'Core & Stability', duration:'35\u201340 min', exercises:[
      { name:'Single-Leg Glute Bridge', note:'Control the drop',                    sets:'3 \u00D7 12 ea' },
      { name:'Side Plank',            note:"Hips stacked, don't sag",              sets:'3 \u00D7 25 sec ea' },
      { name:'Bird Dog',              note:'Opposite arm + leg, slow',              sets:'3 \u00D7 10 ea' },
      { name:'Pallof Press (Band)',   note:'Anti-rotation, no twisting',           sets:'3 \u00D7 10 ea' },
      { name:'Lateral Band Walk',     note:'Stay low, knees soft',                  sets:'3 \u00D7 15 ea' },
      { name:'Hollow Body Hold',      note:'Lower back pressed down',               sets:'3 \u00D7 20 sec' },
    ]},
    { day:'Sat / Sun', title:'Lower Body B',    duration:'45\u201350 min', exercises:[
      { name:'Bulgarian Split Squat', note:'Back foot elevated, drop straight down', sets:'3 \u00D7 8 ea' },
      { name:'Sumo Squat',            note:'Wide stance, toes out',                 sets:'3 \u00D7 12' },
      { name:'Nordic Hamstring Curl', note:'Partner holds feet or use bench',       sets:'3 \u00D7 6' },
      { name:'Step-Up',               note:'Drive through the heel on top',         sets:'3 \u00D7 10 ea' },
      { name:'Copenhagen Plank',      note:'Adductor challenge',                    sets:'3 \u00D7 20 sec ea' },
      { name:'Russian Twist',         note:'Controlled rotation',                   sets:'3 \u00D7 15 ea' },
    ]},
  ],
  1: [
    { day:'Tuesday',   title:'Lower Body A+',  duration:'50\u201355 min', exercises:[
      { name:'Barbell / DB Squat',    note:'Add weight from Phase 1 baseline',      sets:'4 \u00D7 8' },
      { name:'Romanian Deadlift',     note:'Increase load 10\u201315%',                  sets:'4 \u00D7 8' },
      { name:'Walking Lunge',         note:'Add dumbbells',                         sets:'3 \u00D7 12 ea' },
      { name:'Box Jump',              note:'Land soft, absorb with hips',           sets:'3 \u00D7 6' },
      { name:'Plank to Push-Up',      note:'Controlled transitions',                sets:'3 \u00D7 8 ea' },
      { name:'Dead Bug + Reach',      note:'Slow and deliberate',                   sets:'3 \u00D7 10 ea' },
    ]},
    { day:'Thursday',  title:'Power & Core',   duration:'40\u201345 min', exercises:[
      { name:'Broad Jump',            note:'Max effort, stick the landing',         sets:'4 \u00D7 4' },
      { name:'Lateral Bound',         note:'Stick each landing before rebounding',  sets:'3 \u00D7 6 ea' },
      { name:'Medicine Ball Slam',    note:'Full hip extension overhead',           sets:'3 \u00D7 8' },
      { name:'Side Plank + Row',      note:'Resistance band, stay square',          sets:'3 \u00D7 10 ea' },
      { name:'V-Up',                  note:'Keep legs straight',                    sets:'3 \u00D7 12' },
      { name:'Pallof Press Variation',note:'Add half-kneeling position',            sets:'3 \u00D7 10 ea' },
    ]},
    { day:'Sat / Sun', title:'Lower Body B+',  duration:'50\u201355 min', exercises:[
      { name:'Bulgarian Split Squat (Weighted)', note:'Dumbbells or barbell',       sets:'4 \u00D7 6 ea' },
      { name:'Trap Bar / DB Deadlift',note:'Drive floor away, hips and shoulders rise together', sets:'4 \u00D7 6' },
      { name:'Lateral Squat',         note:'Sit back into one hip',                 sets:'3 \u00D7 10 ea' },
      { name:'Depth Drop to Jump',    note:'Step off, absorb, explode',             sets:'3 \u00D7 5' },
      { name:'Copenhagen Plank',      note:'Longer hold for progression',           sets:'3 \u00D7 25 sec ea' },
      { name:'Hanging Knee Raise',    note:'Control the swing',                     sets:'3 \u00D7 12' },
    ]},
  ],
  2: [
    { day:'Tuesday',   title:'Peak Strength A', duration:'55\u201360 min', exercises:[
      { name:'Back Squat / Heavy Goblet', note:'Work up to 5-rep challenge set',   sets:'5 \u00D7 5' },
      { name:'Romanian Deadlift Heavy',   note:'Focus on hamstring tension',        sets:'4 \u00D7 6' },
      { name:'Rear-Foot Elevated Split Squat', note:'Heaviest phase weight',        sets:'4 \u00D7 5 ea' },
      { name:'Depth Jump to Sprint',      note:'Land, explode, sprint 10m',         sets:'4 \u00D7 4' },
      { name:'Weighted Plank',            note:'Plate on back',                     sets:'3 \u00D7 40 sec' },
      { name:'Rotational Med Ball Throw', note:'Explosive hip rotation',            sets:'3 \u00D7 8 ea' },
    ]},
    { day:'Thursday',  title:'Explosive Power', duration:'45\u201350 min', exercises:[
      { name:'Triple Broad Jump',      note:'3 consecutive jumps, max distance',    sets:'4 \u00D7 3' },
      { name:'Single-Leg Box Jump',    note:'Lead with strong leg first',           sets:'3 \u00D7 5 ea' },
      { name:'Sprint 10m \u00D7 6',         note:'Full rest between, max effort',        sets:'6 \u00D7 10m' },
      { name:'Med Ball Rotational Throw', note:'Drive from ground up',              sets:'4 \u00D7 6 ea' },
      { name:'L-Sit Hold',             note:'Build to 3 \u00D7 15 sec',                 sets:'3 \u00D7 10 sec' },
      { name:'Dragon Flag Progression',note:'Scaled as needed',                     sets:'3 \u00D7 6' },
    ]},
    { day:'Sat / Sun', title:'Peak Strength B', duration:'55\u201360 min', exercises:[
      { name:'Trap Bar Deadlift Heavy',note:'Max effort within solid form',         sets:'5 \u00D7 4' },
      { name:'Lateral Squat (Weighted)',note:'Control the descent',                 sets:'4 \u00D7 6 ea' },
      { name:'Nordic Hamstring Curl', note:'Eccentric focus, slow lower',          sets:'4 \u00D7 5' },
      { name:'Single-Leg Landing Drill',note:'Drop from box, freeze on landing',   sets:'3 \u00D7 6 ea' },
      { name:'Ab Wheel Rollout',       note:"Brace hard, don't let hips drop",     sets:'3 \u00D7 8' },
      { name:'Copenhagen Plank + Hip Abduction', note:'Add top leg lift',          sets:'3 \u00D7 30 sec ea' },
    ]},
  ],
  3: [
    { day:'Tuesday',   title:'Maintenance A',   duration:'30\u201335 min', exercises:[
      { name:'Goblet Squat',           note:'Moderate weight, move well',          sets:'2 \u00D7 8' },
      { name:'Romanian Deadlift',      note:'Light, focus on feel',                 sets:'2 \u00D7 8' },
      { name:'Glute Bridge',           note:'Activation only',                      sets:'2 \u00D7 12' },
      { name:'Plank Hold',             note:'Quality over time',                    sets:'2 \u00D7 30 sec' },
    ]},
    { day:'Thursday',  title:'Activation & Power', duration:'25\u201330 min', exercises:[
      { name:'Broad Jump',             note:'3 reps, feel the pop',                sets:'3 \u00D7 3' },
      { name:'Lateral Bound',          note:'Light and snappy',                     sets:'3 \u00D7 4 ea' },
      { name:'Side Plank',             note:'Short hold, sharp engagement',         sets:'2 \u00D7 20 sec ea' },
      { name:'Sprint Strides 20m \u00D7 4',note:'75\u201380% effort, stay fluid',           sets:'4 \u00D7 20m' },
    ]},
    { day:'Sat / Sun', title:'Feel Good Session', duration:'20\u201325 min', exercises:[
      { name:'Bodyweight Squat',            note:'Fluid, full range',               sets:'2 \u00D7 10' },
      { name:'Single-Leg Glute Bridge',     note:'Feel that activation',            sets:'2 \u00D7 10 ea' },
      { name:'Bird Dog',                    note:'Control and breathe',             sets:'2 \u00D7 8 ea' },
      { name:'Light Jog + Dynamic Stretch', note:'Leave feeling loose and ready',  sets:'10 min' },
    ]},
  ],
  4: [
    { day:'Tuesday',   title:'In-Season Lower Body',      duration:'35\u201340 min', exercises:[
      { name:'Trap Bar Deadlift',        note:'Heavy but crisp, explosive intent',        sets:'3 \u00D7 5' },
      { name:'Bulgarian Split Squat',    note:'Controlled, add load from summer',          sets:'3 \u00D7 6 ea' },
      { name:'Single-Leg RDL',           note:'Balance and hamstring strength',            sets:'3 \u00D7 8 ea' },
      { name:'Copenhagen Plank',         note:'Groin and adductor health',                sets:'3 \u00D7 20 sec ea' },
      { name:'Pallof Press',             note:'Core anti-rotation, stay tall',             sets:'3 \u00D7 10 ea' },
    ]},
    { day:'Thursday',  title:'Power & Core Maintenance',  duration:'30\u201335 min', exercises:[
      { name:'Broad Jump',               note:'Maintain explosiveness, full effort',      sets:'3 \u00D7 4' },
      { name:'Lateral Bound',            note:'Reactive landing control',                  sets:'3 \u00D7 5 ea' },
      { name:'Med Ball Rotational Throw',note:'Hip drive and rotation power',              sets:'3 \u00D7 6 ea' },
      { name:'Dead Bug',                 note:'Deep core stability',                       sets:'3 \u00D7 10 ea' },
      { name:'Side Plank + Hip Abduction',note:'Glute med activation',                    sets:'3 \u00D7 20 sec ea' },
      { name:'Ab Wheel Rollout',         note:'Total core strength',                       sets:'3 \u00D7 8' },
    ]},
    { day:'Sat / Sun', title:'Weekend Full Body',          duration:'40\u201345 min', exercises:[
      { name:'Back Squat or Goblet Squat',note:'Keep load challenging but fresh',         sets:'3 \u00D7 6' },
      { name:'Romanian Deadlift',        note:'Hamstring focus, slow eccentric',           sets:'3 \u00D7 8' },
      { name:'Step-Up with Knee Drive',  note:'Single-leg power and balance',             sets:'3 \u00D7 10 ea' },
      { name:'Nordic Hamstring Curl',    note:'Injury prevention, do not skip',          sets:'3 \u00D7 5' },
      { name:'Plank Variations',         note:'Mix front, side, and RKC plank',           sets:'3 \u00D7 35 sec' },
      { name:'Glute Bridge March',       note:'Hip stability and activation',              sets:'3 \u00D7 12 ea' },
    ]},
  ],
  5: [
    { day:'Tuesday',   title:'Strength Rebuild A',        duration:'50\u201355 min', exercises:[
      { name:'Back Squat',               note:'Rebuild from 70%, add 5 lb each week',    sets:'4 \u00D7 6' },
      { name:'Romanian Deadlift',        note:'Load progression from fall baseline',       sets:'4 \u00D7 8' },
      { name:'Walking Lunge (Weighted)', note:'Single-leg strength endurance',             sets:'3 \u00D7 10 ea' },
      { name:'Box Jump',                 note:'Re-establish explosive power',              sets:'4 \u00D7 4' },
      { name:'Hanging Knee Raise',       note:'Core strength from dead hang',              sets:'3 \u00D7 12' },
      { name:'Lateral Band Walk',        note:'Hip activation, always warm up here',      sets:'3 \u00D7 15 ea' },
    ]},
    { day:'Thursday',  title:'Power & Athleticism',       duration:'45\u201350 min', exercises:[
      { name:'Triple Broad Jump',        note:'Consecutive explosive jumps',               sets:'4 \u00D7 3' },
      { name:'Single-Leg Box Jump',      note:'Reactive power each side',                 sets:'3 \u00D7 5 ea' },
      { name:'Sprint 20m \u00D7 5',           note:'Max effort, full recovery between',        sets:'5 \u00D7 20m' },
      { name:'Med Ball Slam',            note:'Full-body explosive chain',                 sets:'3 \u00D7 8' },
      { name:'Copenhagen Plank',         note:'Groin strength, injury prevention',        sets:'3 \u00D7 25 sec ea' },
      { name:'Russian Twist (Weighted)', note:'Rotational core power',                     sets:'3 \u00D7 12 ea' },
    ]},
    { day:'Sat / Sun', title:'Strength Rebuild B',        duration:'50\u201355 min', exercises:[
      { name:'Trap Bar Deadlift',           note:'Primary posterior chain builder',        sets:'4 \u00D7 5' },
      { name:'Bulgarian Split Squat (Heavy)',note:'Heavier than fall, test yourself',     sets:'4 \u00D7 6 ea' },
      { name:'Nordic Hamstring Curl',       note:'Eccentric strength, protect your hamstrings', sets:'4 \u00D7 6' },
      { name:'Lateral Squat',               note:'Hip mobility and adductor strength',     sets:'3 \u00D7 10 ea' },
      { name:'Ab Wheel Rollout',            note:'Anti-extension core strength',           sets:'3 \u00D7 10' },
      { name:'Bird Dog with Band',          note:'Glute and core activation',              sets:'3 \u00D7 10 ea' },
    ]},
  ],
};

var FITNESS_SESSIONS = {
  '2026-06-08': { focus:'strength',  title:'Strength Training Intro',                  time:'5:00 PM', end_time:'6:30 PM', location:'Park School',     warmup:['Band exercises'],         main:['Intro to strength training! Learn how to build lower body and core strength with proper form and volume, led by Coach Kat! Please bring sneakers and weights.'] },
  '2026-06-11': { focus:'sprinting', title:'Sprint Mechanics and Conditioning Intro',   time:'6:30 PM', end_time:'8:00 PM', location:'Park School',     warmup:['A/B-skips and runs'],     main:['Intro to sprinting mechanics and conditioning! Learn how to build sprinting form to accelerate quickly and maintain speed on the field, led by Coach Bearett! Please bring cleats.'] },
  '2026-06-14': { focus:'climbing',  title:'Harvard Stadium Steps',                     time:'4:30 PM', end_time:'6:00 PM', location:'Harvard Stadium', warmup:['Band exercises'],         main:['We will walk, jump, and run up the Harvard Stadium steps! Please bring sneakers and water (electrolytes recommended).'] },
  '2026-06-28': { focus:'climbing',  title:'Harvard Stadium Steps',                     time:'4:30 PM', end_time:'6:00 PM', location:'Harvard Stadium', warmup:['Band exercises'],         main:['We will walk, jump, and run up the Harvard Stadium steps! Please bring sneakers and water (electrolytes recommended).'] },
};

// Chan Camp sessions
var CAMP_SESSIONS = {
  '2026-07-06': { title:'Chan Camp Week 1', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-07': { title:'Chan Camp Week 1', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-08': { title:'Chan Camp Week 1', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-09': { title:'Chan Camp Week 1', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-10': { title:'Chan Camp Week 1', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-13': { title:'Chan Camp Week 2', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-14': { title:'Chan Camp Week 2', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-15': { title:'Chan Camp Week 2', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-16': { title:'Chan Camp Week 2', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-17': { title:'Chan Camp Week 2', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-20': { title:'Chan Camp Week 3', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-21': { title:'Chan Camp Week 3', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-22': { title:'Chan Camp Week 3', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-23': { title:'Chan Camp Week 3', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-24': { title:'Chan Camp Week 3', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-27': { title:'Chan Camp Week 4', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-28': { title:'Chan Camp Week 4', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-29': { title:'Chan Camp Week 4', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-30': { title:'Chan Camp Week 4', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-07-31': { title:'Chan Camp Week 4', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-03': { title:'Chan Camp Week 5', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-04': { title:'Chan Camp Week 5', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-05': { title:'Chan Camp Week 5', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-06': { title:'Chan Camp Week 5', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-07': { title:'Chan Camp Week 5', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-10': { title:'Chan Camp Week 6', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-11': { title:'Chan Camp Week 6', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-12': { title:'Chan Camp Week 6', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-13': { title:'Chan Camp Week 6', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
  '2026-08-14': { title:'Chan Camp Week 6', time:'8:00 AM', end_time:'10:00 AM', location:'Downes Field' },
};

// \u2500\u2500 CONSTANTS \u2500\u2500
const DAYS_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_FULL    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FOCUS_LABELS = {
  dribbling:'Dribbling', passing:'Passing', shooting:'Shooting',
  defending:'Defending', trapping:'Trapping/Clearing', scrimmage:'Scrimmage',
  first_touch:'First Touch', one_v_one:'1v1', crossing:'Crossing', finishing:'Finishing',
};
const STRENGTH_DAYS = [2, 4, 0]; // Tue, Thu, Sun (floater)
var STRENGTH_SEASON_START = '2026-06-11';
const STRENGTH_SKIP_DATES = new Set(['2026-06-14', '2026-06-28']);

// \u2500\u2500 STATE \u2500\u2500
let rsvpData = (function() {
  try { var s = localStorage.getItem('btw_rsvp'); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
})();

var btw_db = null;
var _fbLocalWrite = false;

function saveRsvp() {
  try { localStorage.setItem('btw_rsvp', JSON.stringify(rsvpData)); } catch(e) {}
  if (btw_db) {
    _fbLocalWrite = true;
    setTimeout(function() { _fbLocalWrite = false; }, 5000);
    btw_db.ref('rsvps').set(rsvpData).catch(function(e) {
      console.warn('Firebase write failed:', e);
      _fbLocalWrite = false;
    });
  }
}

function initFirebase(config) {
  try {
    if (!window.firebase) return;
    firebase.initializeApp(config);
    btw_db = firebase.database();
    btw_db.ref('rsvps').on('value', function(snapshot) {
      if (_fbLocalWrite) { _fbLocalWrite = false; return; }
      var remote = snapshot.val() || {};
      Object.keys(rsvpData).forEach(function(k) { delete rsvpData[k]; });
      Object.assign(rsvpData, remote);
      try { localStorage.setItem('btw_rsvp', JSON.stringify(rsvpData)); } catch(e) {}
      renderRsvp();
      buildWeekCalendar();
      buildNextSession();
    });
  } catch(e) {
    console.warn('Firebase init failed:', e);
  }
}
let activeDate = null;
let activeType = null;

const today = new Date();

function getPhaseForDate(d) {
  const ts = d.getTime();
  if (ts < new Date(2026, 6,  5).getTime()) return 0;
  if (ts < new Date(2026, 6, 26).getTime()) return 1;
  if (ts < new Date(2026, 7, 16).getTime()) return 2;
  if (ts < new Date(2026, 7, 29).getTime()) return 3;
  if (ts < new Date(2027, 0,  1).getTime()) return 4;
  return 5;
}

function getWeekStart(d) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  s.setHours(0,0,0,0);
  return s;
}

const calMinWeekStart = getWeekStart(new Date(2026, 5, 1));
const calMaxWeekStart = getWeekStart(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()));
let calWeekStart = getWeekStart(today);

function fmtDate(d)  { return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate(); }
function toDateStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

// \u2500\u2500 WEEK CALENDAR \u2500\u2500
function buildWeekCalendar() {
  const wrap = document.getElementById('calWeekWrap');
  if (!wrap) return;
  const ws = calWeekStart;
  const we = new Date(ws); we.setDate(ws.getDate() + 6);
  document.getElementById('wkLabel').textContent = fmtDate(ws) + ' \u2013 ' + fmtDate(we);
  var prevBtn = document.getElementById('wkPrev');
  var nextBtn = document.getElementById('wkNext');
  if (prevBtn) prevBtn.disabled = ws.getTime() <= calMinWeekStart.getTime();
  if (nextBtn) nextBtn.disabled = ws.getTime() >= calMaxWeekStart.getTime();
  wrap.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const day  = new Date(ws); day.setDate(ws.getDate() + i);
    const ds   = toDateStr(day);
    const isToday = day.toDateString() === today.toDateString();
    const dow  = day.getDay();

    const col  = document.createElement('div');
    col.className = 'wk-day-col';

    const hdr = document.createElement('div');
    hdr.className = 'wk-day-header' + (isToday ? ' today-header' : '');
    hdr.innerHTML = '<div>' + DAYS_SHORT[dow] + '</div><div>' + day.getDate() + '</div>';
    col.appendChild(hdr);

    const body = document.createElement('div');
    body.className = 'wk-day-body' + (isToday ? ' today-body' : '');

    if (MILESTONES[ds]) {
      const el = document.createElement('div');
      el.className = 'wk-milestone' + (MILESTONES[ds].cls ? ' ' + MILESTONES[ds].cls : '');
      el.textContent = MILESTONES[ds].label;
      body.appendChild(el);
    }

    if (CAMP_SESSIONS[ds]) {
      const c     = CAMP_SESSIONS[ds];
      const cKey  = 'camp-' + ds;
      const btn   = document.createElement('button');
      btn.className = 'wk-event type-camp';
      btn.innerHTML = c.title + '<span class="ev-time">\u26FA ' + c.time + '</span>';
      btn.onclick = (function(k) { return function() { openPanel(k, 'camp'); }; })(cKey);
      body.appendChild(btn);
    }

    if (dow === 3 && ds <= '2026-08-24') {
      const cp = document.createElement('div');
      cp.className = 'wk-event type-captains';
      cp.innerHTML = "Captain's Practice" + '<span class="ev-time">\uD83C\uDFDF 6:30 \u2013 8:00 PM \u00B7 Downes</span>';
      body.appendChild(cp);
    }

    if (SESSIONS[ds]) {
      const s   = SESSIONS[ds];
      const cnt = (rsvpData[ds] || []).length;
      const btn = document.createElement('button');
      btn.className = 'wk-event type-technical';
      btn.innerHTML = s.title + '<span class="ev-time">\u26BD ' + s.time + (cnt > 0 ? ' \u00B7 ' + cnt + ' going' : '') + '</span>';
      btn.onclick = function() { openPanel(ds, 'technical'); };
      body.appendChild(btn);
    }

    if (FITNESS_SESSIONS[ds]) {
      const g    = FITNESS_SESSIONS[ds];
      const gKey = 'grp-' + ds;
      const btn  = document.createElement('button');
      btn.className = 'wk-event type-fitness';
      btn.innerHTML = g.title + '<span class="ev-time">\uD83C\uDFC3 ' + g.time + '</span>';
      btn.onclick = (function(k) { return function() { openPanel(k, 'fitness'); }; })(gKey);
      body.appendChild(btn);
    }

    if (STRENGTH_DAYS.includes(dow) && ds >= STRENGTH_SEASON_START && !STRENGTH_SKIP_DATES.has(ds)) {
      const phase  = getPhaseForDate(day);
      const wkIdx  = dow === 2 ? 0 : dow === 4 ? 1 : 2;
      const workout = WORKOUTS[phase][wkIdx];
      const sKey   = 'str-' + ds;
      const btn    = document.createElement('button');
      btn.className = 'wk-event type-strength';
      const evLabel = dow === 0 ? 'Sat or Sun' : workout.duration;
      btn.innerHTML = workout.title + '<span class="ev-time">\uD83D\uDCAA ' + evLabel + '</span>';
      btn.onclick = (function(k, p, w, d2) { return function() { openPanel(k, 'strength', d2, p, w); }; })(sKey, phase, wkIdx, new Date(day));
      body.appendChild(btn);
    }

    if (dow === 6) {
      const rest = document.createElement('div');
      rest.className = 'wk-rest-day';
      rest.textContent = '\uD83D\uDECC Rest Day';
      body.appendChild(rest);
    }

    col.appendChild(body);
    wrap.appendChild(col);
  }
  closePanel();
}

function calPrevWeek() {
  var prev = new Date(calWeekStart);
  prev.setDate(prev.getDate() - 7);
  if (prev.getTime() >= calMinWeekStart.getTime()) { calWeekStart = prev; buildWeekCalendar(); }
}
function calNextWeek() {
  var next = new Date(calWeekStart);
  next.setDate(next.getDate() + 7);
  if (next.getTime() <= calMaxWeekStart.getTime()) { calWeekStart = next; buildWeekCalendar(); }
}

// \u2500\u2500 DETAIL PANEL \u2500\u2500
function openPanel(key, type, dayObj, phase, wkIdx) {
  activeDate = key;
  activeType = type;
  const panel      = document.getElementById('dayPanel');
  const rsvpSec    = document.getElementById('panelRsvpSection');
  if (!panel) return;

  if (type === 'technical') {
    const s  = SESSIONS[key];
    const parts = key.split('-');
    const y = +parts[0], mo = +parts[1], d = +parts[2];
    const dateObj2 = new Date(y, mo-1, d);
    document.getElementById('panelDate').textContent  = DAYS_FULL[dateObj2.getDay()] + ', ' + MONTHS[mo-1] + ' ' + d + ', ' + y;
    document.getElementById('panelTitle').textContent = s.title;
    document.getElementById('panelMeta').innerHTML    =
      '<span class="focus-pill focus-' + s.focus + '">' + FOCUS_LABELS[s.focus] + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F0 ' + s.time + (s.end_time ? ' \u2013 ' + s.end_time : '') + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83D\uDCCD ' + s.location + '</span>';
    if (s.skills && s.skills.length) {
      document.getElementById('panelPlan').innerHTML =
        '<div class="plan-block"><h4>Skills</h4><ul>' + s.skills.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>';
    } else {
      document.getElementById('panelPlan').innerHTML =
        '<div class="plan-block"><h4>Warm-Up</h4><ul>'     + (s.warmup||[]).map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>' +
        '<div class="plan-block"><h4>Main Session</h4><ul>' + (s.main  ||[]).map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>';
    }
    rsvpSec.style.display = 'block';
    renderRsvp();
  } else if (type === 'fitness') {
    const ds = key.slice(4);
    const g  = FITNESS_SESSIONS[ds];
    const parts = ds.split('-');
    const y = +parts[0], mo = +parts[1], d = +parts[2];
    const dateObj2 = new Date(y, mo-1, d);
    document.getElementById('panelDate').textContent  = DAYS_FULL[dateObj2.getDay()] + ', ' + MONTHS[mo-1] + ' ' + d + ', ' + y;
    document.getElementById('panelTitle').textContent = g.title;
    document.getElementById('panelMeta').innerHTML    =
      '<span style="background:#dbeafe;color:#1d4ed8;font-size:0.72rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:0.25rem 0.6rem;border-radius:2px">\uD83C\uDFC3 Fitness</span>' +
      '<span class="focus-pill focus-' + g.focus + '">' + (FOCUS_LABELS[g.focus] || g.focus) + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F0 ' + g.time + (g.end_time ? ' \u2013 ' + g.end_time : '') + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83D\uDCCD ' + g.location + '</span>';
    document.getElementById('panelPlan').innerHTML =
      '<div class="plan-block"><h4>Warm-Up</h4><ul>'     + (g.warmup || []).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul></div>' +
      '<div class="plan-block"><h4>Main Session</h4><ul>' + (g.main   || []).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul></div>';
    rsvpSec.style.display = 'block';
    renderRsvp();
  } else if (type === 'camp') {
    const ds = key.slice(5);
    const c  = CAMP_SESSIONS[ds];
    const parts = ds.split('-');
    const y = +parts[0], mo = +parts[1], d = +parts[2];
    const dateObj2 = new Date(y, mo-1, d);
    document.getElementById('panelDate').textContent  = DAYS_FULL[dateObj2.getDay()] + ', ' + MONTHS[mo-1] + ' ' + d + ', ' + y;
    document.getElementById('panelTitle').textContent = c.title;
    document.getElementById('panelMeta').innerHTML    =
      '<span style="background:#f3e8ff;color:#5b1a8b;font-size:0.72rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:0.25rem 0.6rem;border-radius:2px">\u26FA Chan Camp</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F0 ' + c.time + ' \u2013 ' + c.end_time + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83D\uDCCD ' + c.location + '</span>';
    document.getElementById('panelPlan').innerHTML = '';
    rsvpSec.style.display = 'none';
  } else {
    const workout   = WORKOUTS[phase][wkIdx];
    const phaseInfo = PHASES[phase];
    document.getElementById('panelDate').textContent  = DAYS_FULL[dayObj.getDay()] + ', ' + MONTHS[dayObj.getMonth()] + ' ' + dayObj.getDate() + ', ' + dayObj.getFullYear();
    document.getElementById('panelTitle').textContent = workout.title;
    document.getElementById('panelMeta').innerHTML    =
      '<span class="tag fitness" style="font-size:0.72rem;padding:0.2rem 0.6rem">\uD83D\uDCAA Strength</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83C\uDFE0 At Home</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F1 ' + workout.duration + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid);font-style:italic">' + phaseInfo.label + ': ' + phaseInfo.tag + '</span>';
    document.getElementById('panelPlan').innerHTML =
      '<div class="plan-block"><h4>Exercises</h4><ul style="gap:0.6rem">' +
      workout.exercises.map(function(e) {
        return '<li style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">' +
          '<div><div style="font-size:0.85rem;font-weight:600">' + e.name + '</div>' +
          '<div style="font-size:0.72rem;color:var(--mid)">' + e.note + '</div></div>' +
          '<span class="ex-sets" style="flex-shrink:0">' + e.sets + '</span></li>';
      }).join('') + '</ul></div>';
    rsvpSec.style.display = 'none';
  }
  panel.style.display = 'block';
}

function closePanel() {
  var panel = document.getElementById('dayPanel');
  if (panel) panel.style.display = 'none';
  activeDate = null;
  activeType = null;
}

function renderRsvp() {
  if (activeType !== 'technical' && activeType !== 'fitness') return;
  const names = rsvpData[activeDate] || [];
  const list  = document.getElementById('rsvpList');
  if (!list) return;
  list.innerHTML = names.length === 0
    ? '<span class="rsvp-empty">No one yet. Be the first!</span>'
    : names.map(function(n,i){ return '<div class="rsvp-name"><span>'+n+'</span><button class="remove" onclick="removeRsvp('+i+')">\u2715</button></div>'; }).join('');
}

function addRsvp() {
  if (activeType !== 'technical' && activeType !== 'fitness') return;
  var input = document.getElementById('rsvpInput');
  var name  = input.value.trim();
  if (!name) return;
  if (!rsvpData[activeDate]) rsvpData[activeDate] = [];
  if (!rsvpData[activeDate].includes(name)) rsvpData[activeDate].push(name);
  saveRsvp();
  input.value = '';
  renderRsvp();
  var savedDate = activeDate;
  var savedType = activeType;
  twRefreshCard(savedDate);
  openPanel(savedDate, savedType);
}

function removeRsvp(idx) {
  rsvpData[activeDate].splice(idx, 1);
  saveRsvp();
  var savedDate = activeDate;
  var savedType = activeType;
  renderRsvp();
  twRefreshCard(savedDate);
  openPanel(savedDate, savedType);
}

// \u2500\u2500 NEXT SESSION \u2500\u2500
function buildNextSession() {
  var container = document.getElementById('twCards');
  var rangeEl   = document.getElementById('twWeekRange');
  if (!container) return;
  container.innerHTML = '';

  if (Object.keys(SESSIONS).length === 0) {
    if (rangeEl) rangeEl.textContent = '';
    container.innerHTML = '<div class="tw-empty"><p style="color:var(--mid);font-weight:300">Loading session data\u2026</p></div>';
    return;
  }

  var todayStr = toDateStr(today);
  var upcoming = Object.entries(SESSIONS)
    .filter(function(e){ return e[0] >= todayStr; })
    .sort(function(a,b){ return a[0].localeCompare(b[0]); });

  if (upcoming.length === 0) {
    if (rangeEl) rangeEl.textContent = '';
    container.innerHTML = '<div class="tw-empty"><div class="emoji">\uD83C\uDFC6</div><p>Season complete \u2013 great work this summer!</p></div>';
    return;
  }

  var entry = upcoming[0];
  var ds    = entry[0];
  var s     = entry[1];
  var parts = ds.split('-').map(Number);
  var y = parts[0], mo = parts[1], d = parts[2];
  var sessionDate = new Date(y, mo-1, d);
  var isToday    = sessionDate.toDateString() === today.toDateString();
  var tom        = new Date(today); tom.setDate(today.getDate()+1);
  var isTomorrow = sessionDate.toDateString() === tom.toDateString();

  var dayLabel = isToday ? '\u26A1 Today' : isTomorrow ? 'Tomorrow' : DAYS_FULL[sessionDate.getDay()];
  if (rangeEl) rangeEl.textContent = MONTHS_SHORT[mo-1] + ' ' + d;

  var names    = rsvpData[ds] || [];
  var initials = names.slice(0,4).map(function(n){ return n.trim().split(' ').map(function(p){return p[0];}).join('').toUpperCase().slice(0,2); });

  var card = document.createElement('div');
  card.className = 'tw-card';
  card.id = 'twcard-' + ds;

  var mainDiv = document.createElement('div');
  mainDiv.className = 'tw-card-main';
  var accentDiv = document.createElement('div');
  accentDiv.className = 'tw-card-accent focus-' + s.focus;
  mainDiv.appendChild(accentDiv);
  var contentDiv = document.createElement('div');
  contentDiv.className = 'tw-card-content';
  var topDiv = document.createElement('div');
  topDiv.className = 'tw-card-top';
  var dateSpan = document.createElement('span');
  dateSpan.className = 'tw-date-day' + (isToday ? ' today' : '');
  var dateSuffix = MONTHS_SHORT[mo-1] + ' ' + d;
  dateSpan.textContent = (isToday || isTomorrow)
    ? dayLabel + ', ' + DAYS_FULL[sessionDate.getDay()] + ', ' + dateSuffix
    : dayLabel + ', ' + dateSuffix;
  var focusSpan = document.createElement('span');
  focusSpan.className = 'focus-pill focus-' + s.focus;
  focusSpan.style.fontSize = '0.62rem';
  focusSpan.textContent = FOCUS_LABELS[s.focus];
  topDiv.appendChild(dateSpan);
  topDiv.appendChild(focusSpan);
  var titleEl = document.createElement('h3');
  titleEl.textContent = s.title;
  var metaDiv = document.createElement('div');
  metaDiv.className = 'tw-card-meta';
  var sp1 = document.createElement('span'); sp1.textContent = s.time;
  var sp2 = document.createElement('span'); sp2.textContent = s.location;
  metaDiv.appendChild(sp1); metaDiv.appendChild(sp2);
  var toggleSpan = document.createElement('span');
  toggleSpan.className = 'tw-card-toggle';
  toggleSpan.innerHTML = '<i class="tw-chevron">&#9656;</i> Session details';
  contentDiv.appendChild(topDiv);
  contentDiv.appendChild(titleEl);
  contentDiv.appendChild(metaDiv);
  contentDiv.appendChild(toggleSpan);
  mainDiv.appendChild(contentDiv);
  card.appendChild(mainDiv);

  var detailsDiv = document.createElement('div');
  detailsDiv.className = 'tw-card-details';
  detailsDiv.id = 'twdetails-' + ds;
  detailsDiv.innerHTML = (s.skills && s.skills.length)
    ? '<div class="tw-plan-heading">Skills</div><ul>' + s.skills.map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul>'
    : '<div class="tw-plan-heading">Warm-Up</div><ul>' + (s.warmup||[]).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul>' +
      '<div class="tw-plan-heading">Main Session</div><ul>' + (s.main||[]).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul>';
  card.appendChild(detailsDiv);
  mainDiv.style.cursor = 'pointer';
  mainDiv.onclick = (function(d2, c) {
    return function() {
      var det = document.getElementById('twdetails-' + d2);
      var isOpen = det.classList.toggle('open');
      c.classList.toggle('expanded', isOpen);
    };
  })(ds, card);

  var rsvpRow = document.createElement('div');
  rsvpRow.className = 'tw-rsvp-row';
  var avatarsDiv = document.createElement('div');
  avatarsDiv.className = 'tw-rsvp-avatars';
  avatarsDiv.id = 'twav-' + ds;
  initials.forEach(function(ini) {
    var av = document.createElement('div'); av.className = 'tw-avatar'; av.textContent = ini;
    avatarsDiv.appendChild(av);
  });
  var labelSpan = document.createElement('span');
  labelSpan.className = 'tw-rsvp-label';
  labelSpan.id = 'twlabel-' + ds;
  labelSpan.textContent = names.length === 0 ? 'No RSVPs yet' : names.length + ' going';
  var rBtn = document.createElement('button');
  rBtn.className = 'tw-rsvp-btn';
  rBtn.textContent = '+ RSVP';
  rBtn.onclick = (function(d2) { return function() { twToggleRsvp(d2); }; })(ds);
  rsvpRow.appendChild(avatarsDiv);
  rsvpRow.appendChild(labelSpan);
  rsvpRow.appendChild(rBtn);
  card.appendChild(rsvpRow);

  var inlineDiv = document.createElement('div');
  inlineDiv.className = 'tw-rsvp-inline';
  inlineDiv.id = 'twinline-' + ds;
  var namesDiv = document.createElement('div');
  namesDiv.id = 'twnames-' + ds;
  namesDiv.innerHTML = names.map(function(n,i){
    return '<div class="rsvp-name"><span>'+n+'</span><button class="remove" onclick="twRemoveRsvp(\''+ds+'\','+i+')">✕</button></div>';
  }).join('');
  inlineDiv.appendChild(namesDiv);
  var inputRow = document.createElement('div');
  inputRow.className = 'rsvp-input-row';
  var nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.id = 'twinput-' + ds;
  nameInput.placeholder = 'Your name...'; nameInput.maxLength = 40;
  nameInput.onkeydown = (function(d2) { return function(e) { if (e.key === 'Enter') twAddRsvp(d2); }; })(ds);
  var aBtn = document.createElement('button');
  aBtn.textContent = '+ RSVP';
  aBtn.onclick = (function(d2) { return function() { twAddRsvp(d2); }; })(ds);
  inputRow.appendChild(nameInput); inputRow.appendChild(aBtn);
  inlineDiv.appendChild(inputRow);
  card.appendChild(inlineDiv);
  container.appendChild(card);
}

function twToggleRsvp(ds) {
  var el = document.getElementById('twinline-'+ds);
  if (!el) return;
  el.classList.toggle('open');
  if (el.classList.contains('open')) {
    setTimeout(function(){ var inp = document.getElementById('twinput-'+ds); if(inp) inp.focus(); }, 50);
  }
}

function twAddRsvp(ds) {
  var input = document.getElementById('twinput-'+ds);
  if (!input) return;
  var name = input.value.trim();
  if (!name) return;
  if (!rsvpData[ds]) rsvpData[ds] = [];
  if (!rsvpData[ds].includes(name)) rsvpData[ds].push(name);
  saveRsvp();
  input.value = '';
  twRefreshCard(ds);
  if (activeDate === ds) renderRsvp();
}

function twRemoveRsvp(ds, idx) {
  if (!rsvpData[ds]) return;
  rsvpData[ds].splice(idx, 1);
  saveRsvp();
  twRefreshCard(ds);
  if (activeDate === ds) renderRsvp();
}

function twRefreshCard(ds) {
  var names    = rsvpData[ds] || [];
  var initials = names.slice(0,4).map(function(n){ return n.trim().split(' ').map(function(p){return p[0];}).join('').toUpperCase().slice(0,2); });
  var avEl = document.getElementById('twav-'+ds);
  var lbEl = document.getElementById('twlabel-'+ds);
  if (avEl) avEl.innerHTML = initials.map(function(i){ return '<div class="tw-avatar">'+i+'</div>'; }).join('');
  if (lbEl) lbEl.textContent = names.length === 0 ? 'No RSVPs yet' : names.length + ' going';
  var namesEl = document.getElementById('twnames-'+ds);
  if (namesEl) namesEl.innerHTML = names.map(function(n,i){
    return '<div class="rsvp-name"><span>'+n+'</span><button class="remove" onclick="twRemoveRsvp(\''+ds+'\','+i+')">✕</button></div>';
  }).join('');
  buildWeekCalendar();
}

// \u2500\u2500 STRENGTH SECTION \u2500\u2500
var activePhase = 0;
function renderTabs() {
  var tabs = document.getElementById('weekTabs');
  if (!tabs) return;
  tabs.innerHTML = PHASES.map(function(p,i){
    return '<div class="week-tab '+(i===activePhase?'active':'')+'" onclick="setPhase('+i+')">'+p.label+' <span style="font-weight:300;opacity:0.7">'+p.tag+'</span></div>';
  }).join('');
}
function renderWorkouts() {
  var container = document.getElementById('workoutDays');
  if (!container) return;
  var days  = WORKOUTS[activePhase];
  var phase = PHASES[activePhase];
  container.innerHTML =
    '<div style="grid-column:1/-1;font-size:0.85rem;color:var(--mid);margin-bottom:0.5rem;"><strong style="color:inherit">'+phase.label+': '+phase.sub+'</strong>. '+phase.desc+'</div>' +
    days.map(function(w){
      return '<div class="workout-card">' +
        '<div class="workout-card-header"><div class="day-label">'+w.day+'</div><h3>'+w.title+'</h3><div class="duration">\u23F1 '+w.duration+'</div></div>' +
        '<ul class="exercise-list">' +
        w.exercises.map(function(e){
          return '<li class="exercise-item"><div><div class="ex-name">'+e.name+'</div><div class="ex-note">'+e.note+'</div></div><span class="ex-sets">'+e.sets+'</span></li>';
        }).join('') +
        '</ul></div>';
    }).join('');
}
function setPhase(i) { activePhase = i; renderTabs(); renderWorkouts(); }

// \u2500\u2500 SHEET LOADER \u2500\u2500
function parseCSVRow(row) {
  var result = [], cur = '', inQ = false;
  for (var i = 0; i < row.length; i++) {
    var c = row[i];
    if (c === '\r') { continue; }
    if (c === '"') {
      if (inQ && row[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (c === ',' && !inQ) {
      result.push(cur.trim()); cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  var lines = text.trim().split(/\r?\n/);
  var headers = parseCSVRow(lines[0]).map(function(h){ return h.replace(/^"+|"+$/g,'').trim().toLowerCase(); });
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    var cols = parseCSVRow(lines[i]);
    var obj = {};
    headers.forEach(function(h, idx){ obj[h] = (cols[idx] || '').replace(/^"+|"+$/g,'').trim(); });
    rows.push(obj);
  }
  return rows;
}

function loadTechnicalFromSheet(rows) {
  var newSessions = {};
  rows.forEach(function(row) {
    if (!row.date) return;
    newSessions[row.date] = {
      focus:    row.focus    || 'passing',
      title:    row.title    || '',
      time:     row.time     || '5:00 PM',
      end_time: row.end_time || '',
      location: row.location || 'Harry Downes Field',
      skills:   (row.skills  || '').split(';').map(function(s){ return s.trim(); }).filter(Boolean),
      warmup:   (row.warmup  || '').split(';').map(function(s){ return s.trim(); }).filter(Boolean),
      main:     (row.main    || '').split(';').map(function(s){ return s.trim(); }).filter(Boolean),
    };
  });
  Object.keys(SESSIONS).forEach(function(k){ delete SESSIONS[k]; });
  Object.assign(SESSIONS, newSessions);
}

function loadStrengthFromSheet(rows) {
  if (rows.length > 0 && rows[0].season_start) {
    STRENGTH_SEASON_START = rows[0].season_start;
  }
  var newWorkouts = {0:[[],[],[]], 1:[[],[],[]], 2:[[],[],[]], 3:[[],[],[]], 4:[[],[],[]], 5:[[],[],[]]};
  rows.forEach(function(row) {
    var phase  = parseInt(row.phase) || 0;
    var dow    = parseInt(row.day);
    var wkIdx  = dow === 2 ? 0 : dow === 4 ? 1 : 2;
    var exList = (row.exercises || '').split(';').map(function(ex) {
      var parts = ex.trim().split('|');
      return { name: (parts[0]||'').trim(), sets: (parts[1]||'').trim(), note: (parts[2]||'').trim() };
    }).filter(function(e){ return e.name; });
    if (newWorkouts[phase]) {
      newWorkouts[phase][wkIdx] = {
        day:       row.day_label || ['Sat / Sun','','Tuesday','','Thursday','','Saturday'][dow] || 'Day',
        title:     row.title    || '',
        duration:  row.duration || '',
        exercises: exList,
      };
    }
  });
  [0,1,2,3,4,5].forEach(function(p) {
    if (newWorkouts[p].some(function(d){ return d && d.title; })) {
      WORKOUTS[p] = newWorkouts[p];
    }
  });
}

function loadFitnessFromSheet(rows) {
  rows.forEach(function(row) {
    if (!row.date) return;
    FITNESS_SESSIONS[row.date] = {
      focus:    row.focus    || 'scrimmage',
      title:    row.title    || 'Group Session',
      time:     row.time     || '5:00 PM',
      end_time: row.end_time || '',
      location: row.location || 'Harry Downes Field',
      warmup:   (row.warmup  || '').split(';').map(function(s){ return s.trim(); }).filter(Boolean),
      main:     (row.main    || '').split(';').map(function(s){ return s.trim(); }).filter(Boolean),
    };
  });
}

function loadCampFromSheet(rows) {
  rows.forEach(function(row) {
    if (!row.date) return;
    CAMP_SESSIONS[row.date] = {
      title:    row.title    || 'Chan Camp',
      time:     row.time     || '8:00 AM',
      end_time: row.end_time || '10:00 AM',
      location: row.location || 'Downes Field',
    };
  });
}

function sheetFetch(url, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, timeoutMs);
  return fetch(url, { signal: controller.signal })
    .then(function(r) { clearTimeout(timer); return r; })
    .catch(function(e) { clearTimeout(timer); throw e; });
}

function rerender() {
  buildWeekCalendar();
  buildNextSession();
  renderTabs();
  renderWorkouts();
}

async function loadFromSheets() {
  // Seed from cache immediately so returning visitors see data before the network responds
  var cache = {};
  try { var raw = localStorage.getItem('btw_sheet_cache'); if (raw) cache = JSON.parse(raw); } catch(e) {}
  if (cache.technical) { try { loadTechnicalFromSheet(parseCSV(cache.technical)); } catch(e) {} }
  if (cache.strength)  { try { loadStrengthFromSheet(parseCSV(cache.strength));  } catch(e) {} }
  if (cache.fitness)   { try { loadFitnessFromSheet(parseCSV(cache.fitness));    } catch(e) {} }
  if (cache.technical || cache.strength || cache.fitness) rerender();

  // Fetch fresh data with an 8-second timeout per request
  var newCache = Object.assign({}, cache);
  var fetches = [];
  if (SHEET_TECHNICAL_URL) fetches.push(
    sheetFetch(SHEET_TECHNICAL_URL, 8000)
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(t) { if (t) { newCache.technical = t; loadTechnicalFromSheet(parseCSV(t)); } })
      .catch(function(e) { console.warn('Could not load Technical sheet:', e); })
  );
  if (SHEET_STRENGTH_URL) fetches.push(
    sheetFetch(SHEET_STRENGTH_URL, 8000)
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(t) { if (t) { newCache.strength = t; loadStrengthFromSheet(parseCSV(t)); } })
      .catch(function(e) { console.warn('Could not load Strength sheet:', e); })
  );
  if (SHEET_FITNESS_URL) fetches.push(
    sheetFetch(SHEET_FITNESS_URL, 8000)
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(t) { if (t) { newCache.fitness = t; loadFitnessFromSheet(parseCSV(t)); } })
      .catch(function(e) { console.warn('Could not load Fitness sheet:', e); })
  );
  if (SHEET_CAMP_URL) fetches.push(
    sheetFetch(SHEET_CAMP_URL, 8000)
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(t) { if (t) { newCache.camp = t; loadCampFromSheet(parseCSV(t)); } })
      .catch(function(e) { console.warn('Could not load Camp sheet:', e); })
  );
  await Promise.all(fetches);
  try { localStorage.setItem('btw_sheet_cache', JSON.stringify(newCache)); } catch(e) {}
  rerender();
}

// \u2500\u2500 NAV \u2500\u2500
function toggleNav() {
  document.getElementById('mainNav').classList.toggle('nav-open');
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('#navLinks a').forEach(function(a) {
    a.addEventListener('click', function() {
      document.getElementById('mainNav').classList.remove('nav-open');
    });
  });
});

// \u2500\u2500 SCROLL FADE \u2500\u2500
function initScrollFade() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp 0.6s ease both';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('section').forEach(function(s) {
    s.style.opacity = '0';
    observer.observe(s);
  });
}
