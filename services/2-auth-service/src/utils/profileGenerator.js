const adjectives = [
  'Quiet', 'Clever', 'Swift', 'Bright', 'Gentle', 'Bold', 'Calm', 'Wise',
  'Brave', 'Kind', 'Sharp', 'Quick', 'Cool', 'Warm', 'Free', 'Wild',
  'Pure', 'Deep', 'Light', 'Dark', 'Soft', 'Strong', 'Clear', 'Smooth'
];

const nouns = [
  'Fox', 'Owl', 'Cat', 'Wolf', 'Bear', 'Eagle', 'Deer', 'Rabbit',
  'Lion', 'Tiger', 'Panda', 'Whale', 'Dolphin', 'Hawk', 'Raven', 'Swan',
  'Turtle', 'Butterfly', 'Hummingbird', 'Peacock', 'Sparrow', 'Robin', 'Falcon', 'Phoenix'
];

const avatars = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=3',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=5',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=6',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=7',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=8'
];

const generateRandomUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
};

const assignDefaultAvatar = () => {
  return avatars[Math.floor(Math.random() * avatars.length)];
};

module.exports = { generateRandomUsername, assignDefaultAvatar };