export type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  building?: string;
  kind: "lecture" | "discussion" | "exam" | "busy" | "other";
  personId: string;
};

export type Person = {
  id: string;
  name: string;
};
