export type Building = {
  id: string;
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
};

/** UCLA campus seed. Add more campuses by exporting additional tables. */
export const UCLA_BUILDINGS: Building[] = [
  {
    id: "boelter",
    name: "Boelter Hall",
    aliases: ["boelter", "boelter hall", "eng vi", "engineering vi"],
    lat: 34.0689,
    lng: -118.443,
  },
  {
    id: "bunche",
    name: "Bunche Hall",
    aliases: ["bunche", "bunche hall"],
    lat: 34.0745,
    lng: -118.4396,
  },
  {
    id: "royce",
    name: "Royce Hall",
    aliases: ["royce", "royce hall"],
    lat: 34.0729,
    lng: -118.4422,
  },
  {
    id: "powell",
    name: "Powell Library",
    aliases: ["powell", "powell library", "powell lib"],
    lat: 34.0716,
    lng: -118.442,
  },
  {
    id: "ackerman",
    name: "Ackerman Union",
    aliases: ["ackerman", "ackerman union", "au"],
    lat: 34.0705,
    lng: -118.4441,
  },
  {
    id: "wooden",
    name: "John Wooden Center",
    aliases: ["wooden", "jwc", "john wooden", "gym", "rec"],
    lat: 34.0709,
    lng: -118.4455,
  },
  {
    id: "moore",
    name: "Moore Hall",
    aliases: ["moore", "moore hall"],
    lat: 34.0702,
    lng: -118.4428,
  },
  {
    id: "public-affairs",
    name: "Public Affairs Building",
    aliases: ["public affairs", "pub aff", "luskin"],
    lat: 34.0741,
    lng: -118.4388,
  },
];

export const CAMPUS_BUILDINGS: Record<string, Building[]> = {
  ucla: UCLA_BUILDINGS,
};
