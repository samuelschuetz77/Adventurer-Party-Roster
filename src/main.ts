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


const defaultParty = party.map((adventurer) => ({ ...adventurer }));

const portraits: Record<string, { image: string; source: string }> = {
  "Bilbo Baggins": { image: "images/bilbo.jpg", source: "https://en.wikipedia.org/wiki/Bilbo_Baggins" },
  "Trogdor": { image: "images/trogdor.gif", source: "https://www.schuminweb.com/2004/09/24/let-me-show-you-this-is-trogdor/" },
  "António de Oliveira Salazar": { image: "images/salazar.jpg", source: "https://en.wikipedia.org/wiki/Ant%C3%B3nio_de_Oliveira_Salazar" },
  "Shrek": { image: "images/shrek.png", source: "https://en.wikipedia.org/wiki/Shrek_(character)" },
};

const roster = document.querySelector<HTMLDivElement>("#party-roster");

function displayAdventurer(adventurer: Adventurer, target: HTMLElement | null = roster): void {
  const { name, className, level, health, isActive, nickname } = adventurer;

  const card = document.createElement("article");
  card.className = "adventurer-card";
  card.setAttribute("aria-label", name);
  card.dataset.active = String(isActive);
  const portrait = portraits[name];
  if (portrait) {
    const image = document.createElement("img");
    image.className = "adventurer-image";
    image.src = portrait.image;
    image.alt = name;
    image.width = 320;
    image.height = 240;
    image.loading = "lazy";
    card.appendChild(image);
  }
  const content = document.createElement("div");
  content.className = "adventurer-details";
  card.appendChild(content);

  const details: [string, string][] = [
    ["name", name],
    ["class", className],
    ["level", `Level ${level}`],
    ["health", `Health · ${health} / 100`],
    ["status", isActive ? "Active" : "Inactive"],
  ];

  if (nickname !== undefined) {
    details.push(["nickname", `“${nickname}”`]);
  }

  for (const [field, text] of details) {
    const paragraph = document.createElement("p");
    paragraph.className = `adventurer-${field}`;
    paragraph.textContent = text;
    content.appendChild(paragraph);
    if (field === "health") {
      const bar = document.createElement("progress");
      bar.className = "health-bar";
      bar.dataset.tone = health < 40 ? "low" : health < 60 ? "medium" : "high";
      bar.max = 100;
      bar.value = Math.max(0, Math.min(100, health));
      bar.setAttribute("aria-label", `${name} health`);
      content.appendChild(bar);
    }
  }
  if (portrait) {
    const source = document.createElement("a");
    source.className = "image-source";
    source.href = portrait.source;
    source.textContent = "Image source ↗";
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    content.appendChild(source);
  }
  const damageButton = document.createElement("button");
  damageButton.type = "button";
  damageButton.className = "take-damage";
  damageButton.textContent = "Take Damage";
  damageButton.setAttribute("aria-label", `Take Damage: ${name}`);
  damageButton.disabled = health === 0;
  damageButton.addEventListener("click", () => {
    takeDamage(adventurer, 20);
    renderParty();
    const damageResult = document.querySelector<HTMLParagraphElement>("#damage-result");
    if (damageResult) {
      damageResult.textContent = `${name} took 20 damage. Health: ${adventurer.health}.${adventurer.health === 0 ? " Defeated." : ""}`;
    }
  });
  content.appendChild(damageButton);
  target?.appendChild(card);
}



function findAdventurer(name: string): Adventurer | undefined {
  return party.find((adventurer) => adventurer.name === name);
}

const searchForm = document.querySelector<HTMLFormElement>("#find-adventurer-form");
const nameInput = document.querySelector<HTMLInputElement>("#adventurer-name-input");
const searchResult = document.querySelector<HTMLDivElement>("#find-adventurer-result");

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

    searchResult.replaceChildren();
    const resultCard = document.createElement("article");
    resultCard.className = "adventurer-card";
    const portrait = portraits[adventurer.name];
    if (portrait) {
      const image = document.createElement("img");
      image.className = "adventurer-image";
      image.src = portrait.image;
      image.alt = adventurer.name;
      image.width = 320;
      image.height = 240;
      resultCard.appendChild(image);
    }
    const resultName = document.createElement("p");
    resultName.className = "adventurer-name adventurer-details";
    resultName.textContent = adventurer.name;
    resultCard.appendChild(resultName);
    searchResult.appendChild(resultCard);
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
  visibleParty.forEach((adventurer) => displayAdventurer(adventurer));
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


const resetButton = document.querySelector<HTMLButtonElement>("#reset-defaults");
resetButton?.addEventListener("click", () => {
  party.splice(0, party.length, ...defaultParty.map((adventurer) => ({ ...adventurer })));
  activeOnly = false;
  highLevelOnly = false;
  searchForm?.reset();
  searchResult?.replaceChildren();
  const damageResult = document.querySelector<HTMLParagraphElement>("#damage-result");
  if (damageResult) damageResult.textContent = "Party restored to defaults.";
  renderParty();
});




