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
  '2026-06-04': { status:'completed', focus:'first_touch', title:'First Touch & Receiving', time:'6:30 PM', end_time:'8:00 PM', location:'Park School', skills:['Receiving to feet and turning to face goal','Directional first touch to set up a pass or dribble','Receiving on the back foot and playing away from pressure','Settling a driven pass with a soft inside-of-foot touch','Checking off a defender to create space before receiving','Body shape and foot orientation before the ball arrives'], warmup:[], main:[] },
  '2026-06-05': { status:'completed', focus:'passing', title:'Passing & Combination Play', time:'3:15 PM', end_time:'4:45 PM', location:'Cypress Field', skills:['Wall pass — give and go to break the defensive line','Third-man run — timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass'], warmup:[], main:[] },
  '2026-06-07': { status:'postponed', focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'4:30 PM', end_time:'6:00 PM', location:'Cypress Field', skills:['Step-over, scissors, or Cruyff turn to beat a defender','Committing the defender before attempting a move','Jockeying — staying goal-side and on feet under pressure','Forcing the attacker onto their weak foot','Winning the ball back with a clean tackle when the moment is right','Dribbling with purpose — head up, exploit space after the move'], warmup:[], main:[] },
  '2026-06-08': { status:'completed', focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'3:30 PM', end_time:'5:00 PM', location:'Cypress Field', skills:['Step-over, scissors, or Cruyff turn to beat a defender','Committing the defender before attempting a move','Jockeying — staying goal-side and on feet under pressure','Forcing the attacker onto their weak foot','Winning the ball back with a clean tackle when the moment is right','Dribbling with purpose — head up, exploit space after the move'], warmup:[], main:[] },
  '2026-06-09': { status:'postponed', focus:'first_touch', title:'First Touch & Receiving', time:'6:30 PM', end_time:'8:00 PM', location:'Park School', skills:['Chest control and immediate lay-off or turn','Thigh control from a lofted ball and playing under pressure','Half-volley control on a bouncing ball','Heading down to a teammate or into space','Catching a dropping ball on the instep and moving forward','Winning the second ball after an aerial contest'], warmup:[], main:[] },
  '2026-06-12': { focus:'finishing', title:'First Touch + Finishing vs. Defensive Pressure', time:'3:30 PM', end_time:'5:00 PM', location:'Cypress Field', skills:['First touch / ball control','Placed finish into the far corner under pressure','One-touch finish from a cut-back or low cross','Closing down a shooter to force a rushed attempt','Shot power vs. placement — choosing the right technique','Finishing with the weaker foot from a realistic position','Block tackle or interception to prevent a shot on goal'], warmup:[], main:[] },
  '2026-06-15': { focus:'first_touch', title:'Ball Control & First Touch', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Juggling with the instep and inside of the foot','Catching a dropping ball on the instep and moving forward'], warmup:[], main:[] },
  '2026-06-16': { focus:'passing', title:'First Touch & Passing', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['One and two-touch play in tight spaces under pressure'], warmup:[], main:[] },
  '2026-06-18': { focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Holding up play with back to goal under physical pressure','Shielding the ball and drawing a foul','Flicking on or laying off from a back-to-goal position','Spinning off a marker into space behind the defense','Fronting a striker — physical positioning to prevent the turn','Timing a tackle when a forward tries to spin'], warmup:[], main:[] },
  '2026-06-19': { focus:'crossing', title:'Crossing & Aerial Duels', time:'3:30 PM', end_time:'5:00 PM', location:'Cypress Field', skills:['Early cross delivery before the fullback can close','Near-post run — attacking the first zone of the cross','Far-post run — late arrival to attack the back stick','Defending a cross — calling, attacking the ball early','Near-post flick-on to redirect for a far-post finish','Tracking a far-post runner as a centerback'], warmup:[], main:[] },
  '2026-06-22': { focus:'first_touch', title:'First Touch & Receiving', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Shielding the ball on the first touch to protect possession','Fake receive — letting the ball run to lose a tight marker','Scanning before the ball arrives to choose touch direction','One-touch layoff when receiving under a high press','Breaking the press line with a single forward touch','Staying calm and composed when receiving in tight space'], warmup:[], main:[] },
  '2026-06-23': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Rondo — maintaining possession under a high press','Identifying and passing to the free player','Weight of pass when playing into a striker\'s feet','Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession — when to recycle vs. when to play forward'], warmup:[], main:[] },
  '2026-06-25': { focus:'finishing', title:'Finishing vs. Defensive Pressure', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['GK 1v1 — reading the goalkeeper\'s position','Chip finish when GK is off the line','Driven low finish across the body past a GK','Recovery run to deny a through ball before the finish','Composure in front of goal — slowing the moment down','Decision-making: shoot vs. square vs. hold up'], warmup:[], main:[] },
  '2026-06-26': { focus:'passing', title:'Passing & Combination Play', time:'8:00 AM', end_time:'10:00 AM', location:'Harry Downes Field', skills:['Rondo — maintaining possession under a high press','Identifying and passing to the free player','Weight of pass when playing into a striker\'s feet','Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession — when to recycle vs. when to play forward'], warmup:[], main:[] },
  '2026-06-29': { focus:'passing', title:'Passing & Combination Play', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Wall pass — give and go to break the defensive line','Third-man run — timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass'], warmup:[], main:[] },
  '2026-06-30': { focus:'crossing', title:'Crossing & Aerial Duels', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Getting to the byline and delivering a low cut-back','Late run from midfield to meet the cut-back and shoot','Holding a defensive line as runners attack the cut-back','First-time finish from a low cut-back across the box','Disguising cross direction to delay the defensive shift','Covering the cut-back channel as a defending fullback'], warmup:[], main:[] },
  '2026-07-02': { focus:'first_touch', title:'First Touch & Receiving', time:'6:00 PM', end_time:'7:30 PM', location:'Harry Downes Field', skills:['Shoulder check before receiving to identify pressure','Half-turn technique — opening the body to receive facing forward','Using peripheral vision to choose touch direction before contact','Receiving between lines and instantly playing forward','First touch away from pressure in a congested midfield','Controlling the tempo of the game through a composed first touch'], warmup:[], main:[] },
  '2026-07-03': { focus:'crossing', title:'Crossing & Aerial Duels', time:'8:00 AM', end_time:'10:00 AM', location:'Harry Downes Field', skills:['Attacking a corner kick delivery — near post and far post runs','Zonal marking on set pieces — attacking the ball at highest point','Man-marking assignment on corners — staying with the runner','Heading technique for both attacking and defensive headers','Second ball reaction after a cleared set piece','Goalkeeper distribution from a set piece clearance'], warmup:[], main:[] },
  '2026-07-05': { focus:'one_v_one', title:'1v1 Attacking vs. Defending', time:'4:30 PM', end_time:'6:00 PM', location:'Park School', skills:['Pressing trigger — when and how to press the ball','Escape from a press — one-touch away from pressure','Ball protection on the dribble in a high-pressure situation','Coordinated pressing as a pair to cut off passing lanes','Winning the ball back high up the pitch from the front','Countering immediately after winning possession in the press'], warmup:[], main:[] },
};

const MILESTONES = {
  '2026-08-24': { label: '\uD83C\uDFC6 Tryouts Start', cls: 'tryouts' },
};

const PHASES = [
  { label:'Phase 1', sub:'Jun 15 \u2013 Jul 4',  tag:'Foundation', desc:'Learn the movements and build comfort with load. Form first \u2014 these are the patterns you\u2019ll build on all summer.' },
  { label:'Phase 2', sub:'Jul 5 \u2013 Jul 25',  tag:'Build',      desc:'Add load and reps. Introduce the RDL row. Build work capacity and single-leg strength.' },
  { label:'Phase 3', sub:'Jul 26 \u2013 Aug 15', tag:'Power',      desc:'Four sets, heaviest loads. Push the eccentric strength and introduce single-leg landing progressions.' },
  { label:'Taper',   sub:'Aug 16 \u2013 Aug 28', tag:'Taper',      desc:'Cut sets in half, keep the load. Stay sharp and fresh heading into tryouts.' },
  { label:'In-Season', sub:'Aug 29+',            tag:'Sustain',    desc:'Maintain ACL resilience and posterior chain strength through the season. Quality over volume.' },
  { label:'Spring',  sub:'Spring 2027',          tag:'Spring Build',desc:'Rebuild from off-season and progress back toward summer loads.' },
];

const WORKOUTS = {
  0: [
    { day:'Day A', title:'Lower Body & Core', duration:'~25 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',              note:'KB at chest, pause 1 sec at bottom, knees track over toes', sets:'3 \u00D7 10',           load:'Kettlebell' },
        { name:'Glute Bridge Floor Press',  note:'Hold bridge position throughout all reps',                  sets:'3 \u00D7 10',           load:'Dumbbells' },
        { name:'Reverse Lunge + Rotation',  note:'Step back, rotate torso over front leg, return. Hold one DB at chest', sets:'3 \u00D7 8/side', load:'DB or KB' },
        { name:'Side Plank Hip Dips',       note:'Side plank position, tap hip to ground and lift',           sets:'3 \u00D7 10/side',      load:'Bodyweight' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Kneel with feet anchored. Lower as slowly as possible (4\u20135 sec). Catch with hands. Add reps each week.', sets:'3 \u00D7 3\u20136', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~25 min', game:'Single-Leg Balance Tag',
      exercises:[
        { name:'DB Romanian Deadlift',           note:'Hinge at hips, soft knee, flat back. Feel the hamstring load',             sets:'3 \u00D7 10',       load:'Dumbbells' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Heavy DB in one hand, lunge forward, drive knee up at the top. Switch hands each set', sets:'3 \u00D7 10/side', load:'DB or KB' },
        { name:'Lateral Band Walk into Squat',   note:'3 steps right, squat, 3 steps left, squat = 1 rep. Hip abductors loaded throughout', sets:'3 \u00D7 8 reps',  load:'Medium band' },
        { name:'Banded Dead Bug',                note:'Hold band taut overhead while doing dead bug reps. Lower back stays pressed down', sets:'3 \u00D7 6/side',  load:'Light band' },
      ],
      finisher:{ name:'Copenhagen Plank Ladder [ACL]', note:'Side plank with top foot on bench/chair. 10 sec hold, rest 10 sec, 15 sec, rest, 20 sec \u2014 each side.', sets:'1/side \u00D7 10\u201315\u201320 sec', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Stability', duration:'~25 min', game:'Carry AMRAP Race',
      exercises:[
        { name:'Single-Leg RDL to Row',       note:'Hinge on one leg, DB in opposite hand. Row before standing. Balance + hinge + pull', sets:'3 \u00D7 8/side',          load:'Kettlebell' },
        { name:'Step-Up to Overhead Press',   note:'Step up onto box, drive knee up, press DBs overhead at top. Lower with control',    sets:'3 \u00D7 8/side',          load:'Dumbbells' },
        { name:'Single-Leg Calf Raise',       note:'Elevate forefoot, full range of motion. Add a DB if needed',                        sets:'3 \u00D7 10\u201320/side',      load:'BW or DB' },
        { name:'Single-Arm Plank Variation',  note:'Easiest to hardest: toe tap \u2192 shoulder tap \u2192 reach out \u2192 elbow to tall \u2192 single-arm hold', sets:'3 \u00D7 20 reps or 30 sec', load:'Bodyweight' },
      ],
      finisher:{ name:'Two-Foot Landing Drill [ACL]', note:'Step off a box, absorb on two feet. Soft knees, no valgus collapse. Land quiet. Progress to jumping off.', sets:'2 \u00D7 6', load:'Bodyweight' }
    },
  ],
  1: [
    { day:'Day A', title:'Lower Body & Core', duration:'~30 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',             note:'Heavier KB than Phase 1. Pause 1 sec at bottom \u2014 try a jump squat if feeling strong', sets:'3 \u00D7 12',      load:'Heavier Kettlebell' },
        { name:'Glute Bridge Floor Press', note:'Increase load from Phase 1. Full press, hold bridge throughout',                        sets:'3 \u00D7 12',      load:'Heavier Dumbbells' },
        { name:'Reverse Lunge + Rotation', note:'More load than Phase 1. Pause in lunge before rotating',                               sets:'3 \u00D7 10/side', load:'Heavier DB or KB' },
        { name:'Side Plank Hip Dips',      note:'Add a dumbbell to hip if Phase 1 felt easy',                                           sets:'3 \u00D7 12/side', load:'BW or DB' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Target 5+ sec lowering. Slower than Phase 1. Add reps from where you left off.', sets:'3 \u00D7 4\u20136', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~30 min', game:'Single-Leg Balance Tag',
      exercises:[
        { name:'DB Romanian Deadlift + Row', note:'Add a row at the bottom before standing \u2014 new this phase. Heavier DBs than Phase 1', sets:'3 \u00D7 10',      load:'Heavier Dumbbells' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Heavier load. Drive the knee higher at the top',                                sets:'3 \u00D7 12/side', load:'Heavier DB or KB' },
        { name:'Lateral Band Walk into Squat',   note:'Upgrade to a heavier band. Keep hips level, stay low',                          sets:'3 \u00D7 10 reps', load:'Heavy band' },
        { name:'Banded Dead Bug',                note:'Upgrade to medium band. Ribcage down, no arching',                              sets:'3 \u00D7 8/side',  load:'Medium band' },
      ],
      finisher:{ name:'Copenhagen Plank Ladder [ACL]', note:'Longer holds than Phase 1: 15\u201320\u201325 sec. Add top-leg hip abduction if ready.', sets:'1/side \u00D7 15\u201320\u201325 sec', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Stability', duration:'~30 min', game:'Carry AMRAP Race',
      exercises:[
        { name:'Single-Leg RDL to Row',      note:'Heavier KB. Full row range of motion at the bottom before standing',                 sets:'3 \u00D7 10/side', load:'Heavier Kettlebell' },
        { name:'Step-Up to Overhead Press',  note:'Heavier DBs. Add a knee hold at the top before pressing',                            sets:'3 \u00D7 10/side', load:'Heavier Dumbbells' },
        { name:'Single-Leg Calf Raise',      note:'Add a DB or KB. Full range \u2014 stretch at the very bottom',                            sets:'3 \u00D7 15/side', load:'DB or KB' },
        { name:'Single-Arm Plank Variation', note:'Move to the next level from Phase 1: shoulder tap \u2192 reach out \u2192 elbow to tall plank', sets:'3 \u00D7 30 sec', load:'Bodyweight' },
      ],
      finisher:{ name:'Landing Drill [ACL]', note:'Progress to step off + land + immediately jump as high as possible. Stick each landing cold.', sets:'2 \u00D7 6', load:'Bodyweight' }
    },
  ],
  2: [
    { day:'Day A', title:'Lower Body & Core', duration:'~30 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',             note:'Heaviest load yet \u2014 4 sets. Aim for a challenge set where rep 10 is hard',             sets:'4 \u00D7 10',      load:'Heaviest Kettlebell' },
        { name:'Glute Bridge Floor Press', note:'Heaviest load. Full range press, controlled tempo',                                     sets:'4 \u00D7 10',      load:'Heaviest Dumbbells' },
        { name:'Reverse Lunge + Rotation', note:'Heaviest load. Explosive drive through front heel on the way back up',                  sets:'4 \u00D7 8/side',  load:'Heaviest DB or KB' },
        { name:'Side Plank Hip Dips',      note:'Add dumbbell to hip. Full range of motion \u2014 full dip, full lift',                      sets:'3 \u00D7 15/side', load:'Dumbbell' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Slowest lowers yet \u2014 aim for 6+ sec. Try an assisted concentric (push back up with hands) if possible.', sets:'3 \u00D7 5\u20136', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~30 min', game:'Single-Leg Balance Tag',
      exercises:[
        { name:'DB Romanian Deadlift + Row', note:'Heaviest load. Explosive hip extension on the way up \u2014 fast concentric',              sets:'4 \u00D7 8',       load:'Heaviest Dumbbells' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Heaviest load. Knee drive to hip height',                                       sets:'4 \u00D7 10/side', load:'Heaviest DB or KB' },
        { name:'Lateral Band Walk into Squat',   note:'Heaviest band. 4 steps each way. Stay low the whole time',                      sets:'4 \u00D7 10 reps', load:'Heaviest band' },
        { name:'Banded Dead Bug',                note:'Heaviest band. 2-second pause at full extension before returning',               sets:'3 \u00D7 8/side',  load:'Heavy band' },
      ],
      finisher:{ name:'Copenhagen Plank + Hip Abduction [ACL]', note:'Longest holds yet. Lift the top leg throughout each hold \u2014 no resting it down.', sets:'1/side \u00D7 20\u201325\u201330 sec', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Stability', duration:'~30 min', game:'Carry AMRAP Race',
      exercises:[
        { name:'Single-Leg RDL to Row',      note:'Heaviest load \u2014 4 sets. Pause 1 sec at the bottom before rowing',                    sets:'4 \u00D7 8/side',  load:'Heaviest Kettlebell' },
        { name:'Step-Up to Overhead Press',  note:'Heaviest load. Hold the knee up for 2 sec before pressing',                          sets:'4 \u00D7 8/side',  load:'Heaviest Dumbbells' },
        { name:'Single-Leg Calf Raise',      note:'Heaviest load. Explosive push at the top \u2014 plyometric calf raise',                   sets:'3 \u00D7 15/side', load:'Heaviest DB or KB' },
        { name:'Single-Arm Plank Hold',      note:'Hardest plank variation \u2014 full single-arm hold. Brace everything',                   sets:'3 \u00D7 30 sec/side', load:'Bodyweight' },
      ],
      finisher:{ name:'Single-Leg Landing Drill [ACL]', note:'Progress to single-leg: step off the box, absorb on one foot. Stick it \u2014 no wobble, no extra step.', sets:'2 \u00D7 6/side', load:'Bodyweight' }
    },
  ],
  3: [
    { day:'Day A', title:'Lower Body & Core', duration:'~20 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',             note:'Keep Phase 3 load, drop to 2 sets. Move well \u2014 no grinding', sets:'2 \u00D7 8',      load:'Phase 3 Kettlebell' },
        { name:'Glute Bridge Floor Press', note:'Keep load, cut volume. Quality over quantity',                 sets:'2 \u00D7 10',     load:'Dumbbells' },
        { name:'Reverse Lunge + Rotation', note:'Moderate load. Focus on control and range',                    sets:'2 \u00D7 8/side', load:'DB or KB' },
        { name:'Side Plank Hip Dips',      note:'Sharp and clean. No sloppy reps',                             sets:'2 \u00D7 10/side', load:'BW or DB' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Reduced volume. Slow and controlled \u2014 maintain what you built.', sets:'2 \u00D7 3\u20134', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~20 min', game:'Single-Leg Balance Tag',
      exercises:[
        { name:'DB Romanian Deadlift + Row', note:'Moderate load. Feel the movement \u2014 don\'t grind',           sets:'2 \u00D7 8',      load:'Moderate Dumbbells' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Moderate load. Controlled and precise',                sets:'2 \u00D7 10/side', load:'DB or KB' },
        { name:'Lateral Band Walk into Squat',   note:'Medium band. Short and sharp \u2014 activate, don\'t fatigue', sets:'2 \u00D7 8 reps', load:'Medium band' },
        { name:'Banded Dead Bug',                note:'Light band. Breathe and brace. Quality only',           sets:'2 \u00D7 6/side',  load:'Light band' },
      ],
      finisher:{ name:'Copenhagen Plank Ladder [ACL]', note:'Short holds, high quality. Activate and stay sharp.', sets:'1/side \u00D7 10\u201315 sec', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Stability', duration:'~20 min', game:'Carry AMRAP Race',
      exercises:[
        { name:'Single-Leg RDL to Row',      note:'Moderate load. Balance and control above all',              sets:'2 \u00D7 8/side',  load:'Kettlebell' },
        { name:'Step-Up to Overhead Press',  note:'Moderate load. Smooth and controlled',                      sets:'2 \u00D7 8/side',  load:'Dumbbells' },
        { name:'Single-Leg Calf Raise',      note:'Moderate load. Full range, no bouncing',                    sets:'2 \u00D7 12/side', load:'BW or DB' },
        { name:'Single-Arm Plank Hold',      note:'Short and sharp. Leave something in the tank',              sets:'2 \u00D7 20 sec/side', load:'Bodyweight' },
      ],
      finisher:{ name:'Landing Drill [ACL]', note:'Activation only \u2014 land clean and quiet. One set, no fatigue.', sets:'1 \u00D7 4/side', load:'Bodyweight' }
    },
  ],
  4: [
    { day:'Day A', title:'Lower Body & Core', duration:'~25 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',             note:'Moderate load. Move explosively \u2014 maintain power through the season', sets:'2 \u00D7 8',      load:'Kettlebell' },
        { name:'Glute Bridge Floor Press', note:'Keep the muscle active. Controlled press',                             sets:'2 \u00D7 10',     load:'Dumbbells' },
        { name:'Reverse Lunge + Rotation', note:'Single-leg focus. Control and range first',                            sets:'2 \u00D7 8/side', load:'DB or KB' },
        { name:'Side Plank Hip Dips',      note:'Hip stability for the season. Sharp and clean',                        sets:'2 \u00D7 10/side', load:'Bodyweight' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Maintain eccentric hamstring strength through the season. Do not skip.', sets:'2 \u00D7 3', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~25 min', game:'RDL Challenge',
      exercises:[
        { name:'DB Romanian Deadlift + Row', note:'Maintain summer load. Quality movement \u2014 no grinding',       sets:'2 \u00D7 8',      load:'Dumbbells' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Core stability and carry strength',                     sets:'2 \u00D7 8/side', load:'DB or KB' },
        { name:'Lateral Band Walk into Squat',   note:'Hip abductor activation. Glute med health',              sets:'2 \u00D7 8 reps', load:'Medium band' },
        { name:'Banded Dead Bug',                note:'Core maintenance. Lower back pressed down',              sets:'2 \u00D7 6/side', load:'Light band' },
      ],
      finisher:{ name:'Copenhagen Plank [ACL]', note:'Adductor and groin maintenance. Key ACL prevention \u2014 do not skip.', sets:'2 \u00D7 15 sec/side', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Power', duration:'~25 min', game:'EMOM Ladder',
      exercises:[
        { name:'Single-Leg RDL to Row',      note:'Single-leg balance and posterior chain. Keep summer load',   sets:'2 \u00D7 8/side',  load:'Kettlebell' },
        { name:'Step-Up to Overhead Press',  note:'Functional leg + shoulder strength. Controlled',             sets:'2 \u00D7 8/side',  load:'Dumbbells' },
        { name:'Single-Leg Calf Raise',      note:'Ankle and lower-leg strength. Full range',                   sets:'2 \u00D7 12/side', load:'BW or DB' },
        { name:'Single-Arm Plank Hold',      note:'Core stability maintenance',                                  sets:'2 \u00D7 20 sec/side', load:'Bodyweight' },
      ],
      finisher:{ name:'Landing Drill [ACL]', note:'Stay sharp \u2014 land clean and quiet before every game. Habit, not workout.', sets:'1 \u00D7 4/side', load:'Bodyweight' }
    },
  ],
  5: [
    { day:'Day A', title:'Lower Body & Core', duration:'~30 min', game:'Squat Hold Relay',
      exercises:[
        { name:'Goblet Squat',             note:'Rebuild from off-season. Progress load across spring weeks \u2014 add KB weight each session', sets:'3 \u00D7 10',      load:'Kettlebell (building)' },
        { name:'Glute Bridge Floor Press', note:'Re-establish pressing pattern. Progress toward Phase 2 load',                              sets:'3 \u00D7 10',      load:'Dumbbells (building)' },
        { name:'Reverse Lunge + Rotation', note:'Work back toward summer Phase 2 load. Controlled throughout',                              sets:'3 \u00D7 10/side', load:'DB or KB (building)' },
        { name:'Side Plank Hip Dips',      note:'Hip stability rebuild. Add load when Phase 1 feels easy again',                            sets:'3 \u00D7 12/side', load:'BW or DB' },
      ],
      finisher:{ name:'Nordic Negatives [ACL]', note:'Maintain eccentric strength from off-season. Slow and controlled \u2014 build reps back up.', sets:'3 \u00D7 4\u20135', load:'Bodyweight' }
    },
    { day:'Day B', title:'Hinge & Carry', duration:'~30 min', game:'Single-Leg Balance Tag',
      exercises:[
        { name:'DB Romanian Deadlift + Row', note:'Rebuild to summer load. Progress load each session',          sets:'3 \u00D7 10',      load:'Dumbbells (building)' },
        { name:'Suitcase Carry Lunge + Leg Lift', note:'Rebuild carry strength. Progress across weeks',          sets:'3 \u00D7 10/side', load:'DB or KB (building)' },
        { name:'Lateral Band Walk into Squat',   note:'Hip abductor and glute rebuild',                          sets:'3 \u00D7 10 reps', load:'Medium-heavy band' },
        { name:'Banded Dead Bug',                note:'Core stability rebuild. Medium band, controlled',          sets:'3 \u00D7 8/side',  load:'Medium band' },
      ],
      finisher:{ name:'Copenhagen Plank Ladder [ACL]', note:'Rebuild adductor and groin strength. Progress holds across spring weeks.', sets:'1/side \u00D7 15\u201320\u201325 sec', load:'Bodyweight' }
    },
    { day:'Day C', title:'Single-Leg & Power', duration:'~30 min', game:'Carry AMRAP Race',
      exercises:[
        { name:'Single-Leg RDL to Row',      note:'Progress back to summer load. Add weight each session',       sets:'3 \u00D7 10/side', load:'Kettlebell (building)' },
        { name:'Step-Up to Overhead Press',  note:'Rebuild overhead stability and single-leg strength',          sets:'3 \u00D7 10/side', load:'Dumbbells (building)' },
        { name:'Single-Leg Calf Raise',      note:'Progress to added weight across weeks. Full range always',    sets:'3 \u00D7 15/side', load:'BW to DB' },
        { name:'Single-Arm Plank Hold',      note:'Full single-arm hold. Build back to Phase 3 quality',         sets:'3 \u00D7 30 sec/side', load:'Bodyweight' },
      ],
      finisher:{ name:'Single-Leg Landing Drill [ACL]', note:'Rebuild landing quality. Single-leg, stick it cold, no wobble.', sets:'2 \u00D7 6/side', load:'Bodyweight' }
    },
  ],
};

var FITNESS_SESSIONS = {
  '2026-06-10': { focus:'strength',  title:'Strength Training Intro',                   time:'3:30 PM', end_time:'5:00 PM', location:'Cypress Field',          warmup:['Band exercises'],         main:['Intro to strength training! Coach Kat will be joining us to walk through how to build lower body and core strength with proper form and volume! Please bring sneakers. Weights will be provided by the coaches.'] },
  '2026-06-11': { focus:'sprinting', title:'Sprint Mechanics and Conditioning Intro',   time:'6:30 PM', end_time:'8:00 PM', location:'Park School',             warmup:['A/B-skips and runs'],     main:['Intro to sprinting mechanics and conditioning! Learn how to build sprinting form to accelerate quickly and maintain speed on the field, led by Coach Bearett! Please bring cleats and sneakers.'] },
  '2026-06-14': { focus:'strength',  title:'Harvard Stadium Climb! + Ball Control',      time:'8:30 AM',  end_time:'10:00 AM', location:'Harvard Stadium',       warmup:['Band exercises'],         main:['We will walk, jump, and run up the Harvard Stadium steps! Then, we\'ll juggle. Please bring sneakers, cleats, and a ball.'] },
  '2026-06-17': { focus:'strength',  title:'Strength Training - Injury Prevention',       time:'3:30 PM',  end_time:'5:00 PM',  location:'Cypress Field',          warmup:['Band exercises'],         main:['Strength training! Coach Kat will be joining us to focus on strengthening muscles that play a key role in injury prevention (ACL, hips, etc.). Please bring sneakers. Weights will be provided by the coaches.'] },
  '2026-06-21': { focus:'strength',  title:'Harvard Stadium Climb! + Ball Control',      time:'8:30 AM',  end_time:'10:00 AM', location:'Harvard Stadium',        warmup:['Band exercises'],         main:['We will walk, jump, and run up the Harvard Stadium steps! Then, we\'ll juggle. Please bring sneakers, cleats, and a ball.'] },
  '2026-06-24': { focus:'strength',  title:'Strength Training',                           time:'3:30 PM',  end_time:'5:00 PM',  location:'Cypress Field',          warmup:['Band exercises'],         main:['Strength training! Coach Kat will be joining us to focus on building lower body and core strength. Please bring sneakers. Weights will be provided by the coaches.'] },
  '2026-06-28': { focus:'strength',  title:'Harvard Stadium Climb! + Ball Control',      time:'8:30 AM',  end_time:'10:00 AM', location:'Harvard Stadium',        warmup:['Band exercises'],         main:['We will walk, jump, and run up the Harvard Stadium steps! Then, we\'ll juggle. Please bring sneakers, cleats, and a ball.'] },
  '2026-07-01': { focus:'strength',  title:'Strength Training',                           time:'3:30 PM',  end_time:'5:00 PM',  location:'Cypress Field',          warmup:['Band exercises'],         main:['Strength training! Coach Kat will be joining us to focus on building lower body and core strength. Please bring sneakers. Weights will be provided by the coaches.'] },
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
var STRENGTH_SEASON_START = '2026-06-15';
const STRENGTH_SKIP_DATES = new Set(['2026-06-28']);

// \u2500\u2500 STATE \u2500\u2500
let rsvpData = (function() {
  try { var s = localStorage.getItem('btw_rsvp'); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
})();

function normalizeEntry(e) {
  if (typeof e === 'string') return { name: e, response: 'going', comment: '' };
  return { name: e.name || '', response: e.response || 'going', comment: e.comment || '' };
}

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
let activeDate   = null;
let activeType   = null;
let activeSessionLocked = false;

function sessionHasPassed(ds, endTimeStr) {
  var now = new Date();
  var nowStr = toDateStr(now);
  if (ds < nowStr) return true;
  if (ds > nowStr) return false;
  if (!endTimeStr) return false;
  var m = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return false;
  var h = parseInt(m[1]), mn = parseInt(m[2]);
  if (/PM/i.test(m[3]) && h !== 12) h += 12;
  if (/AM/i.test(m[3]) && h === 12) h = 0;
  return now >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mn, 0);
}

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
function displayTime(s) {
  return s.time_decided === 0 ? 'TBD' : s.time;
}
function evStatusTag(status) {
  if (!status || status === 'scheduled') return '';
  return '<span class="ev-status-tag ev-status-' + status + '">' + status + '</span>';
}

function parseTimeToMinutes(timeStr) {
  var m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  var h = parseInt(m[1]), min = parseInt(m[2]), mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

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

    var timedItems = [];
    var untimedItems = [];

    if (MILESTONES[ds]) {
      const el = document.createElement('div');
      el.className = 'wk-milestone' + (MILESTONES[ds].cls ? ' ' + MILESTONES[ds].cls : '');
      el.textContent = MILESTONES[ds].label;
      untimedItems.push(el);
    }

    if (CAMP_SESSIONS[ds]) {
      const c     = CAMP_SESSIONS[ds];
      const cKey  = 'camp-' + ds;
      const btn   = document.createElement('button');
      btn.className = 'wk-event type-camp';
      btn.innerHTML = c.title + '<span class="ev-time">\u26FA ' + c.time + ' \u00B7 ' + c.location + '</span>';
      btn.onclick = (function(k) { return function() { openPanel(k, 'camp'); }; })(cKey);
      timedItems.push({ el: btn, timeMin: parseTimeToMinutes(c.time), priority: 1 });
    }

    if (dow === 3 && ds <= '2026-08-24') {
      const cp = document.createElement('div');
      cp.className = 'wk-event type-captains';
      cp.innerHTML = "Captain's Practice" + '<span class="ev-time">\uD83C\uDFDF 6:30 \u2013 8:00 PM \u00B7 Downes</span>';
      timedItems.push({ el: cp, timeMin: parseTimeToMinutes('6:30 PM'), priority: 2 });
    }

    if (FITNESS_SESSIONS[ds]) {
      const g    = FITNESS_SESSIONS[ds];
      const gKey = 'grp-' + ds;
      const gCnt = (rsvpData[gKey] || []).filter(function(r){ return normalizeEntry(r).response === 'going'; }).length;
      const btn  = document.createElement('button');
      btn.className = 'wk-event type-fitness' + (g.status && g.status !== 'scheduled' ? ' status-' + g.status : '');
      btn.innerHTML = g.title + evStatusTag(g.status) + '<span class="ev-time">\uD83C\uDFC3 ' + displayTime(g) + ' \u00B7 ' + g.location + (gCnt > 0 ? ' \u00B7 ' + gCnt + ' going' : '') + '</span>';
      btn.onclick = (function(k) { return function() { openPanel(k, 'fitness'); }; })(gKey);
      timedItems.push({ el: btn, timeMin: parseTimeToMinutes(g.time), priority: 3 });
    }

    if (SESSIONS[ds]) {
      const s   = SESSIONS[ds];
      const cnt = (rsvpData[ds] || []).filter(function(r){ return normalizeEntry(r).response === 'going'; }).length;
      const btn = document.createElement('button');
      btn.className = 'wk-event type-technical' + (s.status && s.status !== 'scheduled' ? ' status-' + s.status : '');
      btn.innerHTML = s.title + evStatusTag(s.status) + '<span class="ev-time">\u26BD ' + displayTime(s) + ' \u00B7 ' + s.location + (cnt > 0 ? ' \u00B7 ' + cnt + ' going' : '') + '</span>';
      btn.onclick = function() { openPanel(ds, 'technical'); };
      timedItems.push({ el: btn, timeMin: parseTimeToMinutes(s.time), priority: 4 });
    }

    timedItems.sort(function(a, b) {
      if (a.timeMin !== b.timeMin) return a.timeMin - b.timeMin;
      return a.priority - b.priority;
    });
    timedItems.forEach(function(item) { body.appendChild(item.el); });
    untimedItems.forEach(function(el) { body.appendChild(el); });

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
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F0 ' + displayTime(s) + (s.time_decided !== 0 && s.end_time ? ' \u2013 ' + s.end_time : '') + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83D\uDCCD ' + s.location + '</span>';
    if (s.skills && s.skills.length) {
      document.getElementById('panelPlan').innerHTML =
        '<div class="plan-block"><h4>Skills</h4><ul>' + s.skills.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>';
    } else {
      document.getElementById('panelPlan').innerHTML =
        '<div class="plan-block"><h4>Warm-Up</h4><ul>'     + (s.warmup||[]).map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>' +
        '<div class="plan-block"><h4>Main Session</h4><ul>' + (s.main  ||[]).map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul></div>';
    }
    activeSessionLocked = sessionHasPassed(key, s.end_time || s.time);
    rsvpSec.style.display = 'block';
    applyRsvpLock();
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
      '<span style="font-size:0.8rem;color:var(--mid)">\u23F0 ' + displayTime(g) + (g.time_decided !== 0 && g.end_time ? ' \u2013 ' + g.end_time : '') + '</span>' +
      '<span style="font-size:0.8rem;color:var(--mid)">\uD83D\uDCCD ' + g.location + '</span>';
    document.getElementById('panelPlan').innerHTML =
      '<div class="plan-block"><h4>Warm-Up</h4><ul>'     + (g.warmup || []).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul></div>' +
      '<div class="plan-block"><h4>Main Session</h4><ul>' + (g.main   || []).map(function(x){ return '<li>'+x+'</li>'; }).join('') + '</ul></div>';
    activeSessionLocked = sessionHasPassed(ds, g.end_time || g.time);
    rsvpSec.style.display = 'block';
    applyRsvpLock();
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
  activeSessionLocked = false;
}

function applyRsvpLock() {
  var formEl   = document.getElementById('rsvpFormEl');
  var lockedEl = document.getElementById('rsvpLockedMsg');
  if (formEl)   formEl.style.display   = activeSessionLocked ? 'none'  : 'flex';
  if (lockedEl) lockedEl.style.display = activeSessionLocked ? 'block' : 'none';
}

function renderRsvp() {
  if (activeType !== 'technical' && activeType !== 'fitness') return;
  var raw  = rsvpData[activeDate] || [];
  var list = document.getElementById('rsvpList');
  if (!list) return;
  if (raw.length === 0) {
    list.innerHTML = '<span class="rsvp-empty">' + (activeSessionLocked ? 'No responses were recorded.' : 'No responses yet. Be the first!') + '</span>';
    return;
  }
  var g = [], n = [], c = [];
  raw.forEach(function(r, idx) {
    var e   = normalizeEntry(r);
    var row = '<div class="rsvp-name"><span class="rsvp-entry-name">' + e.name + '</span>'
      + (e.comment ? '<span class="rsvp-entry-comment">' + e.comment + '</span>' : '')
      + (!activeSessionLocked ? '<button class="remove" onclick="removeRsvp(' + idx + ')">&#x2715;</button>' : '')
      + '</div>';
    if (e.response === 'not_going') n.push(row);
    else if (e.response === 'conflict') c.push(row);
    else g.push(row);
  });
  function grp(label, cls, rows) {
    if (!rows.length) return '';
    return '<div class="rsvp-group"><div class="rsvp-group-label ' + cls + '">' + label + '</div>' + rows.join('') + '</div>';
  }
  list.innerHTML = grp("I'll be there!", 'rsvp-going', g)
    + grp("Can't make it", 'rsvp-not-going', n)
    + grp("Scheduling conflict", 'rsvp-conflict', c);
}

function addRsvp() {
  if (activeType !== 'technical' && activeType !== 'fitness') return;
  if (activeSessionLocked) return;
  var nameEl    = document.getElementById('rsvpInput');
  var commentEl = document.getElementById('rsvpComment');
  var respEl    = document.querySelector('input[name="rsvpResponse"]:checked');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { if (nameEl) nameEl.focus(); return; }
  var response = respEl ? respEl.value : 'going';
  var comment  = commentEl ? commentEl.value.trim() : '';
  if (!rsvpData[activeDate]) rsvpData[activeDate] = [];
  var exists = rsvpData[activeDate].some(function(r) { return normalizeEntry(r).name === name; });
  if (!exists) rsvpData[activeDate].push({ name: name, response: response, comment: comment });
  saveRsvp();
  if (nameEl) nameEl.value = '';
  if (commentEl) commentEl.value = '';
  renderRsvp();
  var savedDate = activeDate;
  var savedType = activeType;
  twRefreshCard(savedDate);
  openPanel(savedDate, savedType);
}

function updateRsvpCommentHint() {
  var el = document.querySelector('input[name="rsvpResponse"]:checked');
  var commentEl = document.getElementById('rsvpComment');
  if (!el || !commentEl) return;
  commentEl.placeholder = el.value === 'conflict'
    ? 'What time and place would work for you?'
    : 'Add a comment (optional)...';
}

function removeRsvp(idx) {
  if (activeSessionLocked) return;
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
  var allCandidates = Object.entries(SESSIONS).map(function(e) { return [e[0], e[1], 'technical']; })
    .concat(Object.entries(FITNESS_SESSIONS).map(function(e) { return [e[0], e[1], 'fitness']; }));
  var upcoming = allCandidates
    .filter(function(e) {
      var ds = e[0];
      if (ds > todayStr) return true;
      if (ds < todayStr) return false;
      // Same day: TBD sessions are always upcoming; otherwise check end time
      if (e[1].time_decided === 0) return true;
      var endStr = e[1].end_time || e[1].time;
      if (!endStr) return true;
      var m = endStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return true;
      var h = parseInt(m[1]), mn = parseInt(m[2]);
      if (/PM/i.test(m[3]) && h !== 12) h += 12;
      if (/AM/i.test(m[3]) && h === 12) h = 0;
      return today < new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, mn, 0);
    })
    .sort(function(a, b) {
      if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
      return parseTimeToMinutes(a[1].time) - parseTimeToMinutes(b[1].time);
    });

  if (upcoming.length === 0) {
    if (rangeEl) rangeEl.textContent = '';
    container.innerHTML = '<div class="tw-empty"><div class="emoji">\uD83C\uDFC6</div><p>Season complete \u2013 great work this summer!</p></div>';
    return;
  }

  var entry       = upcoming[0];
  var ds          = entry[0];
  var s           = entry[1];
  var sessionType = entry[2];
  var rsvpKey     = sessionType === 'fitness' ? 'grp-' + ds : ds;
  var parts = ds.split('-').map(Number);
  var y = parts[0], mo = parts[1], d = parts[2];
  var sessionDate = new Date(y, mo-1, d);
  var isToday    = sessionDate.toDateString() === today.toDateString();
  var tom        = new Date(today); tom.setDate(today.getDate()+1);
  var isTomorrow = sessionDate.toDateString() === tom.toDateString();

  var dayLabel = isToday ? '\u26A1 Today' : isTomorrow ? 'Tomorrow' : DAYS_FULL[sessionDate.getDay()];
  if (rangeEl) rangeEl.textContent = MONTHS_SHORT[mo-1] + ' ' + d;

  var raw      = rsvpData[rsvpKey] || [];
  var going    = raw.map(normalizeEntry).filter(function(e){ return e.response === 'going'; });
  var initials = going.slice(0,4).map(function(e){ return e.name.trim().split(' ').map(function(p){return p[0];}).join('').toUpperCase().slice(0,2); });

  var card = document.createElement('div');
  card.className = 'tw-card';
  card.id = 'twcard-' + ds;

  var mainDiv = document.createElement('div');
  mainDiv.className = 'tw-card-main';
  var accentDiv = document.createElement('div');
  accentDiv.className = 'tw-card-accent type-' + sessionType;
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
  focusSpan.textContent = FOCUS_LABELS[s.focus] || s.focus;
  topDiv.appendChild(dateSpan);
  topDiv.appendChild(focusSpan);
  var titleEl = document.createElement('h3');
  titleEl.innerHTML = s.title + evStatusTag(s.status);
  var metaDiv = document.createElement('div');
  metaDiv.className = 'tw-card-meta';
  var sp1 = document.createElement('span'); sp1.textContent = displayTime(s);
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
  avatarsDiv.id = 'twav-' + rsvpKey;
  initials.forEach(function(ini) {
    var av = document.createElement('div'); av.className = 'tw-avatar'; av.textContent = ini;
    avatarsDiv.appendChild(av);
  });
  var labelSpan = document.createElement('span');
  labelSpan.className = 'tw-rsvp-label';
  labelSpan.id = 'twlabel-' + rsvpKey;
  (function() {
    var entries = raw.map(normalizeEntry);
    var nGoing    = entries.filter(function(e){ return e.response === 'going'; }).length;
    var nConflict = entries.filter(function(e){ return e.response === 'conflict'; }).length;
    var nCant     = entries.filter(function(e){ return e.response === 'not_going'; }).length;
    var parts = [];
    if (nGoing) parts.push(nGoing + ' going');
    if (nConflict) parts.push(nConflict + ' conflict');
    if (nCant) parts.push(nCant + " can't");
    labelSpan.textContent = parts.length ? parts.join(' · ') : 'No responses yet';
  })();
  var rBtn = document.createElement('button');
  rBtn.className = 'tw-rsvp-btn';
  rBtn.textContent = 'Respond';
  rBtn.onclick = (function(d2) { return function() { twToggleRsvp(d2); }; })(rsvpKey);
  rsvpRow.appendChild(avatarsDiv);
  rsvpRow.appendChild(labelSpan);
  rsvpRow.appendChild(rBtn);
  card.appendChild(rsvpRow);

  var inlineDiv = document.createElement('div');
  inlineDiv.className = 'tw-rsvp-inline';
  inlineDiv.id = 'twinline-' + rsvpKey;
  // Build initial names display
  (function() {
    var g2 = [], n2 = [], c2 = [];
    raw.forEach(function(r, idx) {
      var e = normalizeEntry(r);
      var row = '<div class="rsvp-name"><span class="rsvp-entry-name">' + e.name + '</span>'
        + (e.comment ? '<span class="rsvp-entry-comment">' + e.comment + '</span>' : '')
        + '<button class="remove" onclick="twRemoveRsvp(\'' + rsvpKey + '\',' + idx + ')">&#x2715;</button></div>';
      if (e.response === 'not_going') n2.push(row);
      else if (e.response === 'conflict') c2.push(row);
      else g2.push(row);
    });
    function grp(label, cls, rows) {
      if (!rows.length) return '';
      return '<div class="rsvp-group"><div class="rsvp-group-label ' + cls + '">' + label + '</div>' + rows.join('') + '</div>';
    }
    var namesDiv = document.createElement('div');
    namesDiv.id = 'twnames-' + rsvpKey;
    namesDiv.innerHTML = grp("I'll be there!", 'rsvp-going', g2)
      + grp("Can't make it", 'rsvp-not-going', n2)
      + grp("Scheduling conflict", 'rsvp-conflict', c2);
    inlineDiv.appendChild(namesDiv);
  })();
  // Build form
  inlineDiv.innerHTML += '<input type="text" id="twinput-' + rsvpKey + '" placeholder="Your name..." maxlength="40" class="rsvp-comment-input" style="margin-bottom:0.5rem"/>'
    + '<div class="rsvp-choices">'
    + '<label class="rsvp-choice"><input type="radio" name="twrsvp-' + rsvpKey + '" value="going" checked onchange="twUpdateCommentHint(\'' + rsvpKey + '\')"/><span>I\'ll be there!</span></label>'
    + '<label class="rsvp-choice"><input type="radio" name="twrsvp-' + rsvpKey + '" value="not_going" onchange="twUpdateCommentHint(\'' + rsvpKey + '\')"/><span>Can\'t make it</span></label>'
    + '<label class="rsvp-choice"><input type="radio" name="twrsvp-' + rsvpKey + '" value="conflict" onchange="twUpdateCommentHint(\'' + rsvpKey + '\')"/><span>Time/location conflict — I could join if it was at…</span></label>'
    + '</div>'
    + '<input type="text" id="twcomment-' + rsvpKey + '" class="rsvp-comment-input" placeholder="Add a comment (optional)..." maxlength="120" style="margin-top:0.5rem"/>'
    + '<button class="rsvp-submit-btn" onclick="twAddRsvp(\'' + rsvpKey + '\')" style="margin-top:0.5rem">Submit RSVP</button>';
  // Wire keydown after innerHTML is set
  setTimeout(function() {
    var ni = document.getElementById('twinput-' + rsvpKey);
    var ci = document.getElementById('twcomment-' + rsvpKey);
    if (ni) ni.onkeydown = function(ev) { if (ev.key === 'Enter') { var c = document.getElementById('twcomment-' + rsvpKey); if (c) c.focus(); } };
    if (ci) ci.onkeydown = (function(d2) { return function(ev) { if (ev.key === 'Enter') twAddRsvp(d2); }; })(rsvpKey);
  }, 0);
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
  var nameInput    = document.getElementById('twinput-' + ds);
  var commentInput = document.getElementById('twcomment-' + ds);
  var respEl       = document.querySelector('input[name="twrsvp-' + ds + '"]:checked');
  if (!nameInput) return;
  var name = nameInput.value.trim();
  if (!name) { nameInput.focus(); return; }
  var response = respEl ? respEl.value : 'going';
  var comment  = commentInput ? commentInput.value.trim() : '';
  if (!rsvpData[ds]) rsvpData[ds] = [];
  var exists = rsvpData[ds].some(function(r) { return normalizeEntry(r).name === name; });
  if (!exists) rsvpData[ds].push({ name: name, response: response, comment: comment });
  saveRsvp();
  nameInput.value = '';
  if (commentInput) commentInput.value = '';
  twRefreshCard(ds);
  if (activeDate === ds) renderRsvp();
}

function twUpdateCommentHint(ds) {
  var el = document.querySelector('input[name="twrsvp-' + ds + '"]:checked');
  var commentEl = document.getElementById('twcomment-' + ds);
  if (!el || !commentEl) return;
  commentEl.placeholder = el.value === 'conflict'
    ? 'What time and place would work for you?'
    : 'Add a comment (optional)...';
}

function twRemoveRsvp(ds, idx) {
  if (!rsvpData[ds]) return;
  rsvpData[ds].splice(idx, 1);
  saveRsvp();
  twRefreshCard(ds);
  if (activeDate === ds) renderRsvp();
}

function twRefreshCard(ds) {
  var raw     = rsvpData[ds] || [];
  var entries = raw.map(normalizeEntry);
  var going    = entries.filter(function(e){ return e.response === 'going'; });
  var conflict = entries.filter(function(e){ return e.response === 'conflict'; });
  var cantMake = entries.filter(function(e){ return e.response === 'not_going'; });
  var initials = going.slice(0,4).map(function(e){ return e.name.trim().split(' ').map(function(p){return p[0];}).join('').toUpperCase().slice(0,2); });
  var avEl = document.getElementById('twav-'+ds);
  var lbEl = document.getElementById('twlabel-'+ds);
  if (avEl) avEl.innerHTML = initials.map(function(i){ return '<div class="tw-avatar">'+i+'</div>'; }).join('');
  if (lbEl) {
    var parts = [];
    if (going.length) parts.push(going.length + ' going');
    if (conflict.length) parts.push(conflict.length + ' conflict');
    if (cantMake.length) parts.push(cantMake.length + " can't");
    lbEl.textContent = parts.length ? parts.join(' · ') : 'No responses yet';
  }
  var namesEl = document.getElementById('twnames-'+ds);
  if (namesEl) {
    var g2 = [], n2 = [], c2 = [];
    raw.forEach(function(r, idx) {
      var e = normalizeEntry(r);
      var row = '<div class="rsvp-name"><span class="rsvp-entry-name">' + e.name + '</span>'
        + (e.comment ? '<span class="rsvp-entry-comment">' + e.comment + '</span>' : '')
        + '<button class="remove" onclick="twRemoveRsvp(\'' + ds + '\',' + idx + ')">&#x2715;</button></div>';
      if (e.response === 'not_going') n2.push(row);
      else if (e.response === 'conflict') c2.push(row);
      else g2.push(row);
    });
    function grp(label, cls, rows) {
      if (!rows.length) return '';
      return '<div class="rsvp-group"><div class="rsvp-group-label ' + cls + '">' + label + '</div>' + rows.join('') + '</div>';
    }
    namesEl.innerHTML = grp("I'll be there!", 'rsvp-going', g2)
      + grp("Can't make it", 'rsvp-not-going', n2)
      + grp("Scheduling conflict", 'rsvp-conflict', c2);
  }
  buildWeekCalendar();
}

// \u2500\u2500 STRENGTH SECTION \u2500\u2500
var activePhase = 1;
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
      function loadBadge(load) {
        if (!load) return '';
        return '<span style="font-size:0.68rem;font-weight:500;padding:0.1rem 0.45rem;border-radius:3px;background:var(--surface-raised);color:var(--mid);white-space:nowrap;margin-top:0.2rem">'+load+'</span>';
      }
      var exHTML = w.exercises.map(function(e){
        return '<li class="exercise-item"><div><div class="ex-name">'+e.name+'</div><div class="ex-note">'+e.note+'</div></div>' +
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.2rem"><span class="ex-sets">'+e.sets+'</span>'+loadBadge(e.load)+'</div></li>';
      }).join('');
      var finisherHTML = w.finisher ?
        '<div style="margin-top:1rem;border-top:1px solid var(--border)">' +
          '<div style="font-size:0.65rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--mid);padding:0.75rem 1.25rem 0.5rem">Finisher \u00B7 ~5 min</div>' +
          '<div class="exercise-item" style="padding:0.5rem 1.25rem">' +
            '<div><div class="ex-name">'+w.finisher.name+'</div><div class="ex-note">'+w.finisher.note+'</div></div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.2rem"><span class="ex-sets">'+w.finisher.sets+'</span>'+loadBadge(w.finisher.load)+'</div>' +
          '</div></div>' : '';
      var gameHTML = w.game ?
        '<div style="padding:0.75rem 1.25rem;font-size:0.8rem;font-weight:500;color:var(--accent)">Game: <a href="#strength-games" style="color:inherit;text-decoration:underline;text-underline-offset:2px">'+w.game+'</a></div>' : '';
      return '<div class="workout-card">' +
        '<div class="workout-card-header"><div class="day-label">'+w.day+'</div><h3>'+w.title+'</h3><div class="duration">\u23F1 '+w.duration+'</div></div>' +
        '<div style="font-size:0.72rem;color:var(--mid);padding:0.5rem 1.25rem 0.75rem">Circuit \u00B7 3 rounds \u00B7 30 sec rest between exercises \u00B7 90 sec between rounds</div>' +
        '<ul class="exercise-list">'+exHTML+'</ul>' +
        finisherHTML + gameHTML +
        '</div>';
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

// \u2500\u2500 ICS EXPORT \u2500\u2500
function generateICS() {
  function pad(n) { return String(n).padStart(2, '0'); }

  function parseTime12(t) {
    if (!t) return null;
    var m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    var h = parseInt(m[1]), mn = parseInt(m[2]), ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return {h: h, m: mn};
  }

  function toDateCompact(ds) { return ds.replace(/-/g, ''); }

  function toDateTime(ds, timeStr) {
    var t = parseTime12(timeStr);
    if (!t) return null;
    return toDateCompact(ds) + 'T' + pad(t.h) + pad(t.m) + '00';
  }

  function nextDayCompact(ds) {
    var d = new Date(ds + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate());
  }

  function esc(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  }

  function fold(line) {
    var out = '';
    while (line.length > 75) { out += line.slice(0, 75) + '\r\n '; line = line.slice(75); }
    return out + line;
  }

  function vevent(uid, dtstart, dtend, summary, location, description) {
    var parts = ['BEGIN:VEVENT', 'UID:' + uid + '@btw2026', dtstart, dtend, fold('SUMMARY:' + esc(summary))];
    if (location) parts.push(fold('LOCATION:' + esc(location)));
    if (description) parts.push(fold('DESCRIPTION:' + esc(description)));
    parts.push('END:VEVENT');
    return parts.join('\r\n');
  }

  var events = [];

  // Technical sessions
  Object.keys(SESSIONS).sort().forEach(function(ds) {
    var s = SESSIONS[ds];
    var dtS = toDateTime(ds, s.time), dtE = toDateTime(ds, s.end_time);
    if (!dtS) return;
    events.push(vevent('tech-' + ds, 'DTSTART:' + dtS, 'DTEND:' + (dtE || dtS), s.title, s.location,
      s.skills && s.skills.length ? 'Skills:\n' + s.skills.join('\n') : ''));
  });

  // Fitness / group sessions
  Object.keys(FITNESS_SESSIONS).sort().forEach(function(ds) {
    var g = FITNESS_SESSIONS[ds];
    var dtS = toDateTime(ds, g.time), dtE = toDateTime(ds, g.end_time);
    if (!dtS) return;
    events.push(vevent('fit-' + ds, 'DTSTART:' + dtS, 'DTEND:' + (dtE || dtS), g.title, g.location,
      (g.main || []).join('\n')));
  });

  // Strength workouts (all-day, Jun 15 \u2013 Aug 28)
  var strEnd = new Date(2026, 7, 28);
  for (var sd = new Date(2026, 5, 11); sd <= strEnd; sd.setDate(sd.getDate() + 1)) {
    var dow = sd.getDay();
    var ds = sd.getFullYear() + '-' + pad(sd.getMonth()+1) + '-' + pad(sd.getDate());
    if (!STRENGTH_DAYS.includes(dow) || STRENGTH_SKIP_DATES.has(ds)) continue;
    var phase = getPhaseForDate(sd);
    var wkIdx = dow === 2 ? 0 : dow === 4 ? 1 : 2;
    var wo = WORKOUTS[phase] && WORKOUTS[phase][wkIdx];
    if (!wo || !wo.title) continue;
    var desc = (wo.duration || '') + (wo.exercises ? '\n' + wo.exercises.map(function(e){ return e.sets + ' ' + e.name; }).join('\n') : '');
    events.push(vevent('str-' + ds,
      'DTSTART;VALUE=DATE:' + toDateCompact(ds),
      'DTEND;VALUE=DATE:' + nextDayCompact(ds),
      'Strength: ' + wo.title, 'At Home', desc));
  }

  // Chan Camp sessions
  Object.keys(CAMP_SESSIONS).sort().forEach(function(ds) {
    var c = CAMP_SESSIONS[ds];
    var dtS = toDateTime(ds, c.time), dtE = toDateTime(ds, c.end_time);
    if (!dtS) return;
    events.push(vevent('camp-' + ds, 'DTSTART:' + dtS, 'DTEND:' + (dtE || dtS), c.title, c.location, ''));
  });

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BeforeTheWhistle//Summer 2026//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:BeforeTheWhistle Summer 2026',
    events.join('\r\n'), 'END:VCALENDAR'].join('\r\n');
}

function downloadICS() {
  var blob = new Blob([generateICS()], {type: 'text/calendar;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'BeforeTheWhistle-Summer2026.ics';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// \u2500\u2500 STRENGTH TRAINING POLL (temporary) \u2500\u2500
// Set POLL_DB_URL to your Firebase Realtime Database path, e.g.:
// 'https://your-project-default-rtdb.firebaseio.com/strengthPoll'
var POLL_DB_URL = 'https://beforethewhistle-63afc-default-rtdb.firebaseio.com/strengthPoll';
var _pollData = {};

function connectPollStream() {
  if (!POLL_DB_URL || !document.getElementById('pollResults')) return;
  var es = new EventSource(POLL_DB_URL + '.json');
  es.addEventListener('put', function(e) {
    var msg = JSON.parse(e.data);
    if (msg.path === '/') {
      _pollData = msg.data || {};
    } else {
      var key = msg.path.slice(1);
      if (msg.data === null) { delete _pollData[key]; } else { _pollData[key] = msg.data; }
    }
    renderPollResults();
  });
  es.addEventListener('patch', function(e) {
    var msg = JSON.parse(e.data);
    Object.keys(msg.data || {}).forEach(function(k) {
      if (msg.data[k] === null) { delete _pollData[k]; } else { _pollData[k] = msg.data[k]; }
    });
    renderPollResults();
  });
  es.onerror = function() { es.close(); };
}

function submitPollVote() {
  var choice = document.querySelector('input[name="pollChoice"]:checked');
  var nameEl = document.getElementById('pollName');
  if (!choice) { alert('Please select an option.'); return; }
  var name = nameEl.value.trim();
  if (!name) { alert('Please enter your name.'); return; }
  if (!POLL_DB_URL) return;

  var deletePromises = Object.keys(_pollData)
    .filter(function(k) { return _pollData[k].name.toLowerCase() === name.toLowerCase(); })
    .map(function(k) { return fetch(POLL_DB_URL + '/' + k + '.json', { method: 'DELETE' }); });

  Promise.all(deletePromises)
    .then(function() {
      return fetch(POLL_DB_URL + '.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, choice: choice.value })
      });
    })
    .then(function() { nameEl.value = ''; })
    .catch(function() { alert('Could not submit. Please try again.'); });
}

function removePollVote(key) {
  if (!POLL_DB_URL) return;
  fetch(POLL_DB_URL + '/' + key + '.json', { method: 'DELETE' });
}

function renderPollResults() {
  var el = document.getElementById('pollResults');
  if (!el) return;
  var entries = Object.entries(_pollData);
  if (!entries.length) { el.innerHTML = ''; return; }
  var opt1 = entries.filter(function(e) { return e[1].choice === '1'; });
  var opt2 = entries.filter(function(e) { return e[1].choice === '2'; });
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var html = '<div class="poll-results-title">Responses (' + entries.length + ')</div>';
  if (opt1.length) {
    html += '<div class="poll-result-group-label">Option 1 (' + opt1.length + ')</div>';
    opt1.forEach(function(e) {
      html += '<div class="poll-result-row"><span class="poll-result-name">' + esc(e[1].name) + '</span><button class="poll-result-remove" onclick="removePollVote(\'' + esc(e[0]) + '\')" title="Remove">&#x2715;</button></div>';
    });
  }
  if (opt2.length) {
    html += '<div class="poll-result-group-label">Option 2 (' + opt2.length + ')</div>';
    opt2.forEach(function(e) {
      html += '<div class="poll-result-row"><span class="poll-result-name">' + esc(e[1].name) + '</span><button class="poll-result-remove" onclick="removePollVote(\'' + esc(e[0]) + '\')" title="Remove">&#x2715;</button></div>';
    });
  }
  el.innerHTML = html;
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
  connectPollStream();
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
