import { imbumentsItemsIcons } from "@/helpers/imbuements-items-icons";

export const imbuementsTypes = {
  basic: {
    price: 5000,
    successRate: 90,
    priceForFullSucess: 10000,
    premium: false,
  },
  intricate: {
    price: 30000,
    successRate: 70,
    priceForFullSuccess: 30000,
    premium: true,
  },
  powerful: {
    price: 200000,
    successRate: 50,
    priceForFullSuccess: 50000,
    premium: true,
  },
};

export const imbuingsAvailableByType = {
  armors: [
    "deathProtection",
    "energyProtection",
    "holyProtection",
    "iceProtection",
    "earthProtection",
    "fireProtection",
    "lifeLeech",
  ],
  boots: ["velocityIncrease", "paralysisRemoval"],
  bows: [
    "distanceSkill",
    "deathDamage",
    "earthDamage",
    "energyDamage",
    "fireDamage",
    "iceDamage",
    "lifeLeech",
    "manaLeech",
    "criticalDamage",
  ],
  crossbows: [
    "distanceSkill",
    "deathDamage",
    "earthDamage",
    "energyDamage",
    "fireDamage",
    "iceDamage",
    "lifeLeech",
    "manaLeech",
    "criticalDamage",
  ],
  helmets: [
    "axeSkill",
    "clubSkill",
    "swordSkill",
    "shieldingSkill",
    "distanceSkill",
    "magicLevel",
    "manaLeech",
  ], // Magic Level has exceptions
  rods: ["magicLevel", "lifeLeech", "manaLeech", "criticalDamage"], // Critical has exceptions
  wands: ["magicLevel", "lifeLeech", "manaLeech", "criticalDamage"], // Critical has exceptions
  shields: [
    "deathProtection",
    "energyProtection",
    "holyProtection",
    "iceProtection",
    "earthProtection",
    "fireProtection",
    "shieldingSkill",
  ],
  spellbooks: [
    "deathProtection",
    "energyProtection",
    "holyProtection",
    "iceProtection",
    "earthProtection",
    "fireProtection",
    "shieldingSkill",
  ],
  axes: [
    "axeSkill",
    "clubSkill",
    "swordSkill",
    "deathDamage",
    "earthDamage",
    "energyDamage",
    "fireDamage",
    "iceDamage",
    "lifeLeech",
    "manaLeech",
    "criticalDamage",
  ],
  clubs: [
    "axeSkill",
    "clubSkill",
    "swordSkill",
    "deathDamage",
    "earthDamage",
    "energyDamage",
    "fireDamage",
    "iceDamage",
    "lifeLeech",
    "manaLeech",
    "criticalDamage",
  ],
  swords: [
    "axeSkill",
    "clubSkill",
    "swordSkill",
    "deathDamage",
    "earthDamage",
    "energyDamage",
    "fireDamage",
    "iceDamage",
    "lifeLeech",
    "manaLeech",
    "criticalDamage",
  ],
  backpacks: ["capacityIncrease"],
};

export const imbuements = {
  deathProtection: {
    name: "Lich Shroud",
    effect: "Death Protection",
    basic: [
      {
        itemName: "Flask of Embalming Fluid",
        quantity: 25,
        icon: imbumentsItemsIcons.deathProtection.flaskOfEmbalmingFluidGif,
      },
    ],
    intricate: [
      {
        itemName: "Flask of Embalming Fluid",
        quantity: 25,
        icon: imbumentsItemsIcons.deathProtection.flaskOfEmbalmingFluidGif,
      },
      {
        itemName: "Gloom Wolf Fur",
        quantity: 20,
        icon: imbumentsItemsIcons.deathProtection.gloomWolfFur,
      },
    ],
    powerful: [
      {
        itemName: "Flask of Embalming Fluid",
        quantity: 25,
        icon: imbumentsItemsIcons.deathProtection.flaskOfEmbalmingFluidGif,
      },
      {
        itemName: "Gloom Wolf Fur",
        quantity: 20,
        icon: imbumentsItemsIcons.deathProtection.gloomWolfFur,
      },
      {
        itemName: "Mystical Hourglass",
        quantity: 5,
        icon: imbumentsItemsIcons.deathProtection.mysticalHourglass,
      },
    ],
    icon: "deathProtection",
  },
  energyProtection: {
    name: "Cloud Fabric",
    effect: "Energy Protection",
    basic: [
      {
        itemName: "Wyvern Talisman",
        quantity: 20,
        icon: imbumentsItemsIcons.energyProtection.wyvernTalismanGif,
      },
    ],
    intricate: [
      {
        itemName: "Wyvern Talisman",
        quantity: 20,
        icon: imbumentsItemsIcons.energyProtection.wyvernTalismanGif,
      },
      {
        itemName: "Crawler Head Plating",
        quantity: 15,
        icon: imbumentsItemsIcons.energyProtection.crawlerHeadPlatingGif,
      },
    ],
    powerful: [
      {
        itemName: "Wyvern Talisman",
        quantity: 20,
        icon: imbumentsItemsIcons.energyProtection.wyvernTalismanGif,
      },
      {
        itemName: "Crawler Head Plating",
        quantity: 15,
        icon: imbumentsItemsIcons.energyProtection.crawlerHeadPlatingGif,
      },
      {
        itemName: "Wyrm Scale",
        quantity: 10,
        icon: imbumentsItemsIcons.energyProtection.wyrmScaleGif,
      },
    ],
    icon: "energyProtection",
  },
  holyProtection: {
    name: "Demon Presence",
    effect: "Holy Protection",
    basic: [
      {
        itemName: "Cultish Robe",
        quantity: 25,
        icon: imbumentsItemsIcons.holyProtection.cultishRobeGif,
      },
    ],
    intricate: [
      {
        itemName: "Cultish Robe",
        quantity: 25,
        icon: imbumentsItemsIcons.holyProtection.cultishRobeGif,
      },
      {
        itemName: "Cultish Mask",
        quantity: 25,
        icon: imbumentsItemsIcons.holyProtection.cultishMaskGif,
      },
    ],
    powerful: [
      {
        itemName: "Cultish Robe",
        quantity: 25,
        icon: imbumentsItemsIcons.holyProtection.cultishRobeGif,
      },
      {
        itemName: "Cultish Mask",
        quantity: 25,
        icon: imbumentsItemsIcons.holyProtection.cultishMaskGif,
      },
      {
        itemName: "Hellspawn Tail",
        quantity: 20,
        icon: imbumentsItemsIcons.holyProtection.hellspawnTailGif,
      },
    ],
    icon: "holyProtection",
  },
  iceProtection: {
    name: "Quara Scale",
    effect: "Ice Protection",
    basic: [
      {
        itemName: "Winter Wolf Fur",
        quantity: 25,
        icon: imbumentsItemsIcons.iceProtection.winterWolfFurGif,
      },
    ],
    intricate: [
      {
        itemName: "Winter Wolf Fur",
        quantity: 25,
        icon: imbumentsItemsIcons.iceProtection.winterWolfFurGif,
      },
      {
        itemName: "Thick Fur",
        quantity: 15,
        icon: imbumentsItemsIcons.iceProtection.thickFurGif,
      },
    ],
    powerful: [
      {
        itemName: "Winter Wolf Fur",
        quantity: 25,
        icon: imbumentsItemsIcons.iceProtection.winterWolfFurGif,
      },
      {
        itemName: "Thick Fur",
        quantity: 15,
        icon: imbumentsItemsIcons.iceProtection.thickFurGif,
      },
      {
        itemName: "Deepling Warts",
        quantity: 10,
        icon: imbumentsItemsIcons.iceProtection.deeplingWartsGif,
      },
    ],
    icon: "iceProtection",
  },
  earthProtection: {
    name: "Snake Skin",
    effect: "Earth Protection",
    basic: [
      {
        itemName: "Piece of Swampling Wood",
        quantity: 25,
        icon: imbumentsItemsIcons.earthProtection.pieceOfSwamplingWoodGif,
      },
    ],
    intricate: [
      {
        itemName: "Piece of Swampling Wood",
        quantity: 25,
        icon: imbumentsItemsIcons.earthProtection.pieceOfSwamplingWoodGif,
      },
      {
        itemName: "Snake Skin",
        quantity: 20,
        icon: imbumentsItemsIcons.earthProtection.snakeSkinGif,
      },
    ],
    powerful: [
      {
        itemName: "Piece of Swampling Wood",
        quantity: 25,
        icon: imbumentsItemsIcons.earthProtection.pieceOfSwamplingWoodGif,
      },
      {
        itemName: "Snake Skin",
        quantity: 20,
        icon: imbumentsItemsIcons.earthProtection.snakeSkinGif,
      },
      {
        itemName: "Brimstone Fangs",
        quantity: 10,
        icon: imbumentsItemsIcons.earthProtection.brimstoneFangsGif,
      },
    ],
    icon: "earthProtection",
  },
  fireProtection: {
    name: "Dragon Hide",
    effect: "Fire Protection",
    basic: [
      {
        itemName: "Green Dragon Leather",
        quantity: 20,
        icon: imbumentsItemsIcons.fireProtection.greenDragonLeatherGif,
      },
    ],
    intricate: [
      {
        itemName: "Green Dragon Leather",
        quantity: 20,
        icon: imbumentsItemsIcons.fireProtection.greenDragonLeatherGif,
      },
      {
        itemName: "Blazing Bone",
        quantity: 10,
        icon: imbumentsItemsIcons.fireProtection.blazingBoneGif,
      },
    ],
    powerful: [
      {
        itemName: "Green Dragon Leather",
        quantity: 20,
        icon: imbumentsItemsIcons.fireProtection.greenDragonLeatherGif,
      },
      {
        itemName: "Blazing Bone",
        quantity: 10,
        icon: imbumentsItemsIcons.fireProtection.blazingBoneGif,
      },
      {
        itemName: "Draken Sulphur",
        quantity: 5,
        icon: imbumentsItemsIcons.fireProtection.drakenSulphurGif,
      },
    ],
    icon: "fireProtection",
  },
  // Continue similarly for the rest of the imbuements...
};
