/*
   scenes/scene4/scene4.js

   Contact section - links, fallen ball.

   Add real contact links here once the profiles are ready.
*/

import { onScroll, localProgress } from '../../js/utils/scrollProgress.js';
import { remap } from '../../js/utils/lerp.js';

const CONTACT_LINKS = [
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/easternnova',
    href: 'https://www.linkedin.com/in/easternnova/',
    icon: 'IN',
    color: 'var(--neon-cyan)',
  },
  {
    label: 'GitHub',
    value: 'github.com/EasternNova',
    href: 'https://github.com/EasternNova',
    icon: 'GH',
    color: 'var(--neon-purple)',
  },
  {
    label: 'LeetCode',
    value: 'leetcode.com/u/EasternNova',
    href: 'https://leetcode.com/u/EasternNova/',
    icon: 'LC',
    color: 'var(--neon-amber)',
  },
  {
    label: 'HackerRank',
    value: 'hackerrank.com/profile/EasternNova',
    href: 'https://www.hackerrank.com/profile/EasternNova',
    icon: 'HR',
    color: 'var(--neon-green)',
  },
  {
    label: 'CodePen',
    value: 'codepen.io/EasternNova',
    href: 'https://codepen.io/EasternNova',
    icon: 'CP',
    color: 'var(--neon-pink)',
  },
  {
    label: 'Codédex',
    value: 'codedex.io/@EasternNova',
    href: 'https://www.codedex.io/@EasternNova',
    icon: 'CD',
    color: 'var(--neon-cyan)',
  },
  {
    label: 'YouTube',
    value: 'youtube.com/@EasternNova',
    href: 'https://www.youtube.com/@EasternNova',
    icon: 'YT',
    color: 'var(--neon-pink)',
  },
  {
    label: 'Instagram',
    value: 'instagram.com/eastern.nova',
    href: 'https://www.instagram.com/eastern.nova/',
    icon: 'IG',
    color: 'var(--neon-purple)',
  },
];

const scene4El = document.getElementById('scene4');
const contactLinks = document.getElementById('contact-links');
const scene4Ball = document.getElementById('scene4-ball');

export function initScene4(range) {
  buildContactLinks();

  if (scene4El) scene4El.style.opacity = '0';

  onScroll(({ progress }) => {
    const local = localProgress(progress, range.start, range.end);
    updateScene4(local);
  });
}

function buildContactLinks() {
  if (!contactLinks) return;
  contactLinks.innerHTML = '';

  CONTACT_LINKS.forEach((link, i) => {
    const item = document.createElement('a');
    item.href = link.href;
    item.target = link.href.startsWith('mailto:') ? '_self' : '_blank';
    item.rel = item.target === '_blank' ? 'noopener noreferrer' : '';
    item.className = 'contact-item stagger-reveal';
    item.style.setProperty('--delay', `${i * 0.08}s`);
    item.style.setProperty('--accent', link.color);

    item.innerHTML = `
      <span class="contact-icon" style="color:${link.color}">${link.icon}</span>
      <div class="contact-text">
        <span class="contact-label">${link.label}</span>
        <span class="contact-value">${link.value}</span>
      </div>
      <span class="contact-arrow">&#8599;</span>
    `;
    contactLinks.appendChild(item);
  });
}

function updateScene4(local) {
  if (!scene4El) return;

  const opacity = local < 0.1
    ? remap(local, 0, 0.1, 0, 1)
    : 1;
  scene4El.style.opacity = String(opacity);

  if (scene4Ball) {
    scene4Ball.style.opacity = '0';
    scene4Ball.hidden = true;
  }
}
