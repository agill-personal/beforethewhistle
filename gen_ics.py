import datetime, re

CRLF = '\r\n'

def pad(n): return str(n).zfill(2)

def dt(ds, ts):
    m = re.match(r'(\d{1,2}):(\d{2})\s*(AM|PM)', ts, re.I)
    h, mn, ap = int(m.group(1)), int(m.group(2)), m.group(3).upper()
    if ap == 'PM' and h != 12: h += 12
    if ap == 'AM' and h == 12: h = 0
    return ds.replace('-','') + 'T' + pad(h) + pad(mn) + '00'

def next_day(ds):
    d = datetime.date.fromisoformat(ds) + datetime.timedelta(days=1)
    return d.strftime('%Y%m%d')

def esc(s):
    return str(s or '').replace('\\','\\\\').replace(',','\\,').replace(';','\\;').replace('\n','\\n')

def fold(line):
    out = ''
    while len(line) > 75:
        out += line[:75] + CRLF + ' '
        line = line[75:]
    return out + line

def vevent(uid, dtstart, dtend, summary, location='', description=''):
    parts = ['BEGIN:VEVENT', 'UID:'+uid+'@btw2026', dtstart, dtend,
             fold('SUMMARY:'+esc(summary))]
    if location:    parts.append(fold('LOCATION:'+esc(location)))
    if description: parts.append(fold('DESCRIPTION:'+esc(description)))
    parts.append('END:VEVENT')
    return CRLF.join(parts)

events = []

# TECHNICAL SESSIONS
technical = [
  ('2026-06-04','First Touch & Receiving','6:30 PM','8:00 PM','Park School',
   ['Receiving to feet and turning to face goal','Directional first touch to set up a pass or dribble','Receiving on the back foot and playing away from pressure','Settling a driven pass with a soft inside-of-foot touch','Checking off a defender to create space before receiving','Body shape and foot orientation before the ball arrives']),
  ('2026-06-05','Passing & Combination Play','3:15 PM','4:45 PM','Cypress Field',
   ['Wall pass: give and go to break the defensive line','Third-man run: timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass']),
  ('2026-06-07','1v1 Attacking vs. Defending','4:30 PM','6:00 PM','Cypress Field',
   ['Step-over, scissors, or Cruyff turn to beat a defender','Committing the defender before attempting a move','Jockeying: staying goal-side and on feet under pressure','Forcing the attacker onto their weak foot','Winning the ball back with a clean tackle when the moment is right','Dribbling with purpose, head up, exploit space after the move']),
  ('2026-06-08','1v1 Attacking vs. Defending','3:30 PM','5:00 PM','Cypress Field',
   ['Step-over, scissors, or Cruyff turn to beat a defender','Committing the defender before attempting a move','Jockeying: staying goal-side and on feet under pressure','Forcing the attacker onto their weak foot','Winning the ball back with a clean tackle when the moment is right','Dribbling with purpose, head up, exploit space after the move']),
  ('2026-06-09','First Touch & Receiving','6:30 PM','8:00 PM','Park School',
   ['Chest control and immediate lay-off or turn','Thigh control from a lofted ball and playing under pressure','Half-volley control on a bouncing ball','Heading down to a teammate or into space','Catching a dropping ball on the instep and moving forward','Winning the second ball after an aerial contest']),
  ('2026-06-12','First Touch + Finishing vs. Defensive Pressure','3:30 PM','5:00 PM','Cypress Field',
   ['First touch / ball control','Placed finish into the far corner under pressure','One-touch finish from a cut-back or low cross','Closing down a shooter to force a rushed attempt','Shot power vs. placement: choosing the right technique','Finishing with the weaker foot from a realistic position','Block tackle or interception to prevent a shot on goal']),
  ('2026-06-15','Ball Control & First Touch','6:00 PM','7:30 PM','Harry Downes Field',
   ['Juggling with the instep and inside of the foot','Catching a dropping ball on the instep and moving forward']),
  ('2026-06-16','First Touch & Passing','6:00 PM','7:30 PM','Harry Downes Field',
   ['One and two-touch play in tight spaces under pressure']),
  ('2026-06-18','Aerial Duels & Crossing','5:00 PM','6:30 PM','Harry Downes Field',
   ['Tracking the ball in the air','Judging when to challenge in the air vs read a bounce','Early cross delivery before the fullback can close','Near-post run','Far-post run','Defending a cross: Tracking a far-post runner as a centerback']),
  ('2026-06-19','1v1 Attacking vs. Defending','9:30 AM','11:00 AM','Harry Downes Field',
   ['Holding up play with back to goal under physical pressure','Shielding the ball and drawing a foul','Flicking on or laying off from a back-to-goal position','Spinning off a marker into space behind the defense','Fronting a striker: physical positioning to prevent the turn','Timing a tackle when a forward tries to spin']),
  ('2026-06-22','First Touch & Receiving','6:00 PM','7:30 PM','Harry Downes Field',
   ['Shielding the ball on the first touch to protect possession','Fake receive: letting the ball run to lose a tight marker','Scanning before the ball arrives to choose touch direction','One-touch layoff when receiving under a high press','Breaking the press line with a single forward touch','Staying calm and composed when receiving in tight space']),
  ('2026-06-23','Passing & Combination Play','6:00 PM','7:30 PM','Harry Downes Field',
   ['Rondo: maintaining possession under a high press','Identifying and passing to the free player',"Weight of pass when playing into a striker's feet",'Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession: when to recycle vs. when to play forward']),
  ('2026-06-25','Finishing vs. Defensive Pressure','6:00 PM','7:30 PM','Harry Downes Field',
   ["GK 1v1: reading the goalkeeper's position",'Chip finish when GK is off the line','Driven low finish across the body past a GK','Recovery run to deny a through ball before the finish','Composure in front of goal: slowing the moment down','Decision-making: shoot vs. square vs. hold up']),
  ('2026-06-26','Passing & Combination Play','8:00 AM','10:00 AM','Harry Downes Field',
   ['Rondo: maintaining possession under a high press','Identifying and passing to the free player',"Weight of pass when playing into a striker's feet",'Quick combination in the final third to create a shooting opportunity','Playing the killer pass through or over the defensive line','Patience in possession: when to recycle vs. when to play forward']),
  ('2026-06-29','Passing & Combination Play','6:00 PM','7:30 PM','Harry Downes Field',
   ['Wall pass: give and go to break the defensive line','Third-man run: timing a late run to receive after a combination','Weight and accuracy of short passes under pressure','One-touch passing to maintain speed of play','Playing through a press as a unit of three','Switching the point of attack with a driven pass']),
  ('2026-06-30','Crossing & Aerial Duels','6:00 PM','7:30 PM','Harry Downes Field',
   ['Getting to the byline and delivering a low cut-back','Late run from midfield to meet the cut-back and shoot','Holding a defensive line as runners attack the cut-back','First-time finish from a low cut-back across the box','Disguising cross direction to delay the defensive shift','Covering the cut-back channel as a defending fullback']),
  ('2026-07-02','First Touch & Receiving','6:00 PM','7:30 PM','Harry Downes Field',
   ['Shoulder check before receiving to identify pressure','Half-turn technique: opening the body to receive facing forward','Using peripheral vision to choose touch direction before contact','Receiving between lines and instantly playing forward','First touch away from pressure in a congested midfield','Controlling the tempo of the game through a composed first touch']),
  ('2026-07-03','Crossing & Aerial Duels','8:00 AM','10:00 AM','Harry Downes Field',
   ['Attacking a corner kick delivery: near post and far post runs','Zonal marking on set pieces: attacking the ball at highest point','Man-marking assignment on corners: staying with the runner','Heading technique for both attacking and defensive headers','Second ball reaction after a cleared set piece','Goalkeeper distribution from a set piece clearance']),
  ('2026-07-05','1v1 Attacking vs. Defending','4:30 PM','6:00 PM','Park School',
   ['Pressing trigger: when and how to press the ball','Escape from a press: one-touch away from pressure','Ball protection on the dribble in a high-pressure situation','Coordinated pressing as a pair to cut off passing lanes','Winning the ball back high up the pitch from the front','Countering immediately after winning possession in the press']),
]
for ds, title, start, end, loc, skills in technical:
    desc = 'Skills:\n' + '\n'.join(skills)
    events.append(vevent('tech-'+ds, 'DTSTART:'+dt(ds,start), 'DTEND:'+dt(ds,end), title, loc, desc))

# FITNESS / GROUP SESSIONS
fitness = [
  (1, '2026-06-10','Strength Training Intro','3:30 PM','5:00 PM','Cypress Field',
   'Intro to strength training! Coach Kat will be joining us to walk through how to build lower body and core strength with proper form and volume! Please bring sneakers. Weights will be provided by the coaches.'),
  (1, '2026-06-11','Sprint Mechanics and Conditioning Intro','6:30 PM','8:00 PM','Park School',
   'Intro to sprinting mechanics and conditioning! Learn how to build sprinting form to accelerate quickly and maintain speed on the field, led by Coach Bearett! Please bring cleats and sneakers.'),
  (1, '2026-06-14','Harvard Stadium Climb! + Ball Control','8:30 AM','10:00 AM','Harvard Stadium',
   "We will walk, jump, and run up the Harvard Stadium steps! Then, we'll juggle. Please bring sneakers, cleats, and a ball."),
  (1, '2026-06-17','Strength Training + Dribbling','3:30 PM','5:00 PM','Cypress Field',
   "Strength training! (+ dribbling) Coach Kat will be joining us to focus on strengthening muscles, especially those that play a key role in injury prevention. Please bring sneakers AND cleats (and a ball). Weights will be provided by the coaches."),
  (1, '2026-06-21','Harvard Stadium Climb! + Ball Control','8:30 AM','10:00 AM','Harvard Stadium',
   "We will walk, jump, and run up the Harvard Stadium steps! Then, we'll juggle. Please bring sneakers, cleats, and a ball."),
  (1, '2026-06-24','Strength Training','3:30 PM','5:00 PM','Cypress Field',
   "Strength training! Coach Kat will be joining us to focus on building lower body and core strength. Please bring sneakers. Weights will be provided by the coaches."),
  (1, '2026-06-28','Harvard Stadium Climb! + Ball Control','8:30 AM','10:00 AM','Harvard Stadium',
   "We will walk, jump, and run up the Harvard Stadium steps! Then, we'll juggle. Please bring sneakers, cleats, and a ball."),
  (1, '2026-07-01','Strength Training','3:30 PM','5:00 PM','Cypress Field',
   "Strength training! Coach Kat will be joining us to focus on building lower body and core strength. Please bring sneakers. Weights will be provided by the coaches."),
]
for time_decided, ds, title, start, end, loc, desc in fitness:
    if time_decided:
        events.append(vevent('fit-'+ds, 'DTSTART:'+dt(ds,start), 'DTEND:'+dt(ds,end), title, loc, desc))
    else:
        dc = ds.replace('-','')
        events.append(vevent('fit-'+ds, 'DTSTART;VALUE=DATE:'+dc, 'DTEND;VALUE=DATE:'+next_day(ds), title+' (Time TBD)', loc, desc))

# STRENGTH WORKOUTS (all-day events)
STRENGTH_DAYS = {1, 3, 5}  # Mon=1, Wed=3, Fri=5 (js_dow = isoweekday() % 7)
SKIP = {'2026-06-28'}
workouts = {
    0: [(1,'Lower Body A','45-50 min'), (3,'Core & Stability','35-40 min'), (5,'Lower Body B','45-50 min')],
    1: [(1,'Lower Body A+','50-55 min'), (3,'Power & Core','40-45 min'), (5,'Lower Body B+','50-55 min')],
    2: [(1,'Peak Strength A','55-60 min'), (3,'Explosive Power','45-50 min'), (5,'Peak Strength B','55-60 min')],
    3: [(1,'Maintenance A','30-35 min'), (3,'Activation & Power','25-30 min'), (5,'Feel Good Session','20-25 min')],
}
def get_phase(d):
    if d < datetime.date(2026,7,5):  return 0
    if d < datetime.date(2026,7,26): return 1
    if d < datetime.date(2026,8,16): return 2
    return 3

cur = datetime.date(2026,6,19)
while cur <= datetime.date(2026,8,28):
    # JS weekday: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    js_dow = cur.isoweekday() % 7
    ds = cur.isoformat()
    if js_dow in STRENGTH_DAYS and ds not in SKIP:
        phase = get_phase(cur)
        wk_idx = {1:0, 3:1, 5:2}[js_dow]
        wo_list = workouts.get(phase, [])
        wo = next((w for w in wo_list if w[0] == js_dow), None)
        if wo:
            _, title, duration = wo
            dc = ds.replace('-','')
            events.append(vevent('str-'+ds,
                'DTSTART;VALUE=DATE:'+dc,
                'DTEND;VALUE=DATE:'+next_day(ds),
                'Strength: '+title, 'At Home', duration))
    cur += datetime.timedelta(days=1)

# CHAN CAMP
camp_weeks = [
    ('2026-07-06','2026-07-10','Chan Camp Week 1'),
    ('2026-07-13','2026-07-17','Chan Camp Week 2'),
    ('2026-07-20','2026-07-24','Chan Camp Week 3'),
    ('2026-07-27','2026-07-31','Chan Camp Week 4'),
    ('2026-08-03','2026-08-07','Chan Camp Week 5'),
    ('2026-08-10','2026-08-14','Chan Camp Week 6'),
]
for wk_start, wk_end, label in camp_weeks:
    d = datetime.date.fromisoformat(wk_start)
    while d <= datetime.date.fromisoformat(wk_end):
        ds = d.isoformat()
        events.append(vevent('camp-'+ds,
            'DTSTART:'+dt(ds,'8:00 AM'),
            'DTEND:'+dt(ds,'10:00 AM'),
            label, 'Downes', ''))
        d += datetime.timedelta(days=1)

header = CRLF.join([
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeforeTheWhistle//Summer 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BeforeTheWhistle Summer 2026',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
])
ics = header + CRLF + CRLF.join(events) + CRLF + 'END:VCALENDAR' + CRLF

with open('docs/calendar.ics', 'w', newline='') as f:
    f.write(ics)

print(f'Done: {len(events)} events written to docs/calendar.ics')
