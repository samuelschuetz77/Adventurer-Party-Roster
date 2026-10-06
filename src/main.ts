import type { Adventurer } from "../types/adventurer.js";

const party: Adventurer[] = [
  {
    name: "Bilbo Baggins",
    className: "Hero",
    level: 6,
    health: 85,
    isActive: true,
    nickname: "Bagginses",
  },
  {
    name: "Trogdor",
    className: "Burninator",
    level: 10,
    health: 100,
    isActive: true,
    nickname: "Homestar's bane",
  },
  {
    name: "António de Oliveira Salazar",
    className: "Spymaster",
    level: 4,
    health: 80,
    isActive: false,
  },
  {
    name: "Shrek",
    className: "Ogre",
    level: 10,
    health: 90,
    isActive: true,
    nickname: "is love",
  },
];


const roster = document.querySelector<HTMLDivElement>("#party-roster");

function displayAdventurer(adventurer: Adventurer): void {
  const { name, className, level, health, isActive, nickname } = adventurer;

  const details: [string, string][] = [
    ["name", `Name: ${name}`],
    ["class", `Class: ${className}`],
    ["level", `Level: ${level}`],
    ["health", `Health: ${health}`],
    ["status", `Status: ${isActive ? "Active" : "Inactive"}`],
  ];

  if (nickname !== undefined) {
    details.push(["nickname", `Nickname: ${nickname}`]);
  }

  for (const [field, text] of details) {
    const paragraph = document.createElement("p");
    paragraph.className = `adventurer-${field}`;
    paragraph.textContent = text;
    roster?.appendChild(paragraph);
  }
}



function findAdventurer(name: string): Adventurer | undefined {
  return party.find((adventurer) => adventurer.name === name);
}

const searchForm = document.querySelector<HTMLFormElement>("#find-adventurer-form");
const nameInput = document.querySelector<HTMLInputElement>("#adventurer-name-input");
const searchResult = document.querySelector<HTMLParagraphElement>("#find-adventurer-result");

if (searchForm && nameInput && searchResult) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      searchResult.textContent = "Enter an adventurer's name.";
      return;
    }

    const adventurer = findAdventurer(name);
    if (adventurer === undefined) {
      searchResult.textContent = `No adventurer named "${name}" was found.`;
      return;
    }

    searchResult.textContent = `Found: ${adventurer.name} — Level ${adventurer.level} ${adventurer.className}`;
  });
}

const showActiveButton = document.querySelector<HTMLButtonElement>("#show-active");
const showHighLevelButton = document.querySelector<HTMLButtonElement>("#show-high-level");
let activeOnly = false;
let highLevelOnly = false;

function renderParty(): void {
  let visibleParty = party;
  if (activeOnly) {
    visibleParty = visibleParty.filter((adventurer) => adventurer.isActive);
  }
  if (highLevelOnly) {
    visibleParty = visibleParty.filter((adventurer) => adventurer.level >= 5);
  }

  showActiveButton?.setAttribute("aria-pressed", String(activeOnly));
  showHighLevelButton?.setAttribute("aria-pressed", String(highLevelOnly));
  roster?.replaceChildren();
  visibleParty.forEach(displayAdventurer);
  displayPartyStatistics();
}

showActiveButton?.addEventListener("click", () => {
  activeOnly = !activeOnly;
  renderParty();
});

showHighLevelButton?.addEventListener("click", () => {
  highLevelOnly = !highLevelOnly;
  renderParty();
});

renderParty();

const partySummaries = party.map((adventurer) =>
  `${adventurer.name} is a level ${adventurer.level} ${adventurer.className.toLowerCase()}.`
);
console.log(partySummaries);

const summaryContainer = document.querySelector<HTMLDivElement>("#party-summary");
partySummaries.forEach((summary) => {
  const paragraph = document.createElement("p");
  paragraph.className = "adventurer-summary";
  paragraph.textContent = summary;
  summaryContainer?.appendChild(paragraph);
});

function takeDamage(adventurer: Adventurer, damage: number): void {
  if (!Number.isFinite(damage) || damage < 0) {
    return;
  }
  adventurer.health = Math.max(0, adventurer.health - damage);
  if (adventurer.health === 0) {
    adventurer.isActive = false;
  }
}

const damageButton = document.querySelector<HTMLButtonElement>("#test-damage");
const damageResult = document.querySelector<HTMLParagraphElement>("#damage-result");

damageButton?.addEventListener("click", () => {
  const bilbo = findAdventurer("Bilbo Baggins");
  const trogdor = findAdventurer("Trogdor");
  if (!bilbo || !trogdor || !damageResult) {
    return;
  }

  takeDamage(bilbo, 20);
  takeDamage(trogdor, 120);
  damageResult.textContent = `Bilbo took 20 damage: ${bilbo.health} health remaining. Trogdor took 120 damage: ${trogdor.health} health remaining, inactive.`;
  renderParty();
});


function getAverageLevel(party: Adventurer[]): number {
  if (party.length === 0) {
    return 0;
  }
  const totalLevel = party.reduce((total, adventurer) => total + adventurer.level, 0);
  return totalLevel / party.length;
}

function getActiveCount(party: Adventurer[]): number {
  return party.filter((adventurer) => adventurer.isActive).length;
}

function displayPartyStatistics(): void {
  const averageLevel = document.querySelector<HTMLSpanElement>("#average-level");
  const activeCount = document.querySelector<HTMLSpanElement>("#active-count");
  if (averageLevel && activeCount) {
    averageLevel.textContent = String(getAverageLevel(party));
    activeCount.textContent = String(getActiveCount(party));
  }
}
