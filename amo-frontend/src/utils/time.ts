const MINUTE = 60;
const HOUR = 1800;
const DAY = 43200;

const timestamp = (): number => Date.now() / 1000;

export { MINUTE, HOUR, DAY, timestamp };
