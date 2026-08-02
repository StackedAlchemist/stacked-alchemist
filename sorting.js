/* ============================================================
 THE SORTING CONSTELLATION
 Hogwarts energy meets alchemist houses
============================================================ */

(function () {
 'use strict';

 const questions = [
 {
 voice: '"Ahh… first, the important test. What calls to you when the workshop is quiet?"',
 text: 'When you have a free Saturday, you\'d rather…',
 choices: [
 { label: '🔨 Build something that didn\'t exist yesterday', house: 'forgehand' },
 { label: '🤝 Check on people you care about', house: 'vaultwarden' },
 { label: '🗺 Sketch a huge long-term plan on a whiteboard', house: 'starcrafter' },
 { label: '🎮 Dive into a game world / lore rabbit hole', house: 'nightweaver' },
 ],
 },
 {
 voice: '"Interesting… very interesting. And when ideas collide?"',
 text: 'Your favorite kind of idea is…',
 choices: [
 { label: '⚡ One I can ship as a working app this week', house: 'forgehand' },
 { label: '💚 One that makes someone feel less alone', house: 'vaultwarden' },
 { label: '🏛 One that could change a whole community', house: 'starcrafter' },
 { label: '✨ One that mixes two fandoms into something new', house: 'nightweaver' },
 ],
 },
 {
 voice: '"Last question. The Sorting Constellation is almost decided…"',
 text: 'Pick your weapon of choice:',
 choices: [
 { label: '🤖 AI as co-pilot + pure builder energy', house: 'forgehand' },
 { label: '🔒 A safe space and a listening ear', house: 'vaultwarden' },
 { label: '📐 Blueprints, maps, 10-year quests', house: 'starcrafter' },
 { label: '🏰 Magic, neon, stars, and mechs', house: 'nightweaver' },
 ],
 },
 ];

 const houses = {
 forgehand: {
 badge: '⚒',
 name: 'House Forgehand',
 color: 'gold',
 voice: '"Ah! A maker. You stack tools, bend AI to your will, and ship before the coffee cools."',
 tagline: 'Builders who turn wild sparks into live apps.',
 desc: 'You belong in the Laboratory. You love shipping, iterating, and the rush of "it works." The Stacked Alchemist built this house for people like you, and for clients who want real products, not vapor.',
 cta: 'Enter the Laboratory →',
 href: 'lab.html',
 },
 vaultwarden: {
 badge: '🔒',
 name: 'House Vaultwarden',
 color: 'teal',
 voice: '"Hmm. A guardian heart. You protect the quiet spaces where people can finally breathe."',
 tagline: 'Keepers of private spaces and real care.',
 desc: 'You resonate with Vault: judgment-free tools for people carrying weight. Free forever for veterans, open to anyone who needs a soft place to land. Compassion is its own kind of magic.',
 cta: 'Visit Vault →',
 href: 'mission.html#vault',
 },
 starcrafter: {
 badge: '🏛',
 name: 'House Starcrafter',
 color: 'violet',
 voice: '"Oh-ho! A systems thinker. You see year ten while others are still choosing paint colors."',
 tagline: 'Visionaries of the Compound and the long game.',
 desc: 'You\'re drawn to the 10-year quest: real homes, real dignity, all 50 states, especially for displaced veterans. Apps fund the dream. Blueprints beat pipe dreams every time.',
 cta: 'See the Compound vision →',
 href: 'mission.html#compound',
 },
 nightweaver: {
 badge: '✨',
 name: 'House Nightweaver',
 color: 'mag',
 voice: '"Yes… YES. Hogwarts in one hand, neon in the other. You live where genres collide."',
 tagline: 'Nerds who stack Hogwarts, space, and cyberpunk.',
 desc: 'You are pure Stacked Alchemist energy. Magic + mechs + night city. You visit this site for the vibes, the games, the lore, and the reminder that having a great time is part of the craft.',
 cta: 'Meet the Alchemist →',
 href: 'about.html',
 },
 };

 const intro = document.getElementById('sortIntro');
 const quiz = document.getElementById('sortQuiz');
 const result = document.getElementById('sortResult');
 const startBtn = document.getElementById('sortStart');
 const againBtn = document.getElementById('sortAgain');
 const choicesEl = document.getElementById('sortChoices');
 const qVoice = document.getElementById('sortQuestionVoice');
 const qText = document.getElementById('sortQuestionText');
 const stepLabel = document.getElementById('sortStepLabel');
 const progress = document.getElementById('sortProgress');
 const shell = document.getElementById('sortingShell');
 const hat = document.getElementById('hatFloat');

 if (!startBtn || !quiz) return;

 let step = 0;
 const scores = { forgehand: 0, vaultwarden: 0, starcrafter: 0, nightweaver: 0 };

 function showState(name) {
 [intro, quiz, result].forEach((el) => {
 if (!el) return;
 const on = el.dataset.state === name;
 el.hidden = !on;
 el.classList.toggle('active', on);
 });
 }

 function resetScores() {
 Object.keys(scores).forEach((k) => { scores[k] = 0; });
 step = 0;
 }

 function renderQuestion() {
 const q = questions[step];
 qVoice.textContent = q.voice;
 qText.textContent = q.text;
 stepLabel.textContent = `Question ${step + 1} of ${questions.length}`;
 progress.style.width = `${((step) / questions.length) * 100}%`;

 choicesEl.innerHTML = '';
 q.choices.forEach((c, i) => {
 const btn = document.createElement('button');
 btn.type = 'button';
 btn.className = 'sort-choice';
 btn.style.animationDelay = `${i * 0.06}s`;
 btn.innerHTML = `<span class="sort-choice-label">${c.label}</span>`;
 btn.addEventListener('click', () => pick(c.house));
 choicesEl.appendChild(btn);
 });

 // pulse hat
 if (hat) {
 hat.classList.add('hat-thinking');
 setTimeout(() => hat.classList.remove('hat-thinking'), 800);
 }
 }

 function pick(house) {
 scores[house] += 1;
 // tiny bonus chaos: if tie potential, nudge randomly later
 step += 1;
 progress.style.width = `${(step / questions.length) * 100}%`;

 if (step >= questions.length) {
 setTimeout(reveal, 280);
 } else {
 // brief exit anim
 choicesEl.style.opacity = '0.4';
 setTimeout(() => {
 choicesEl.style.opacity = '1';
 renderQuestion();
 }, 180);
 }
 }

 function winner() {
 let best = 'forgehand';
 let max = -1;
 const keys = Object.keys(scores);
 // shuffle keys slightly so pure ties feel alive
 keys.sort(() => Math.random() - 0.5);
 keys.forEach((k) => {
 if (scores[k] > max) {
 max = scores[k];
 best = k;
 }
 });
 return best;
 }

 function reveal() {
 const id = winner();
 const h = houses[id];

 document.getElementById('sortResultBadge').textContent = h.badge;
 document.getElementById('sortResultVoice').textContent = h.voice;
 document.getElementById('sortResultHouse').textContent = h.name;
 document.getElementById('sortResultTagline').textContent = h.tagline;
 document.getElementById('sortResultDesc').textContent = h.desc;

 const cta = document.getElementById('sortResultCta');
 cta.textContent = h.cta;
 cta.href = h.href;

 // shell accent
 if (shell) {
 shell.dataset.house = id;
 }

 // spark stars
 document.querySelectorAll('.cstar').forEach((star, i) => {
 star.classList.add('sorted');
 star.style.animationDelay = `${i * 0.05}s`;
 });

 if (hat) hat.classList.add('hat-sorted');

 showState('result');
 progress.style.width = '100%';

 // confetti-lite particles
 burst(h.color);
 }

 function burst(colorKey) {
 const colors = {
 gold: '#e0c06a',
 teal: '#00f0d0',
 violet: '#9b6dff',
 mag: '#ff2d9b',
 };
 const color = colors[colorKey] || colors.gold;
 const stage = document.querySelector('.constellation-stage');
 if (!stage) return;

 for (let i = 0; i < 18; i++) {
 const p = document.createElement('span');
 p.className = 'sort-spark';
 p.style.setProperty('--sx', (Math.random() * 200 - 100) + 'px');
 p.style.setProperty('--sy', (Math.random() * -120 - 20) + 'px');
 p.style.background = color;
 p.style.left = 50 + (Math.random() * 20 - 10) + '%';
 p.style.top = '40%';
 stage.appendChild(p);
 setTimeout(() => p.remove(), 1000);
 }
 }

 startBtn.addEventListener('click', () => {
 resetScores();
 showState('quiz');
 renderQuestion();
 if (hat) hat.classList.add('hat-active');
 });

 againBtn?.addEventListener('click', () => {
 resetScores();
 if (shell) delete shell.dataset.house;
 document.querySelectorAll('.cstar').forEach((s) => s.classList.remove('sorted'));
 if (hat) hat.classList.remove('hat-sorted', 'hat-active');
 showState('intro');
 progress.style.width = '0%';
 });

 // Click hat on intro to start
 hat?.addEventListener('click', () => {
 if (!intro.hidden && intro.classList.contains('active')) {
 startBtn.click();
 }
 });

})();
