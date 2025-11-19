import { BudtenderBoard } from "../components/BudtenderBoard";
import type { Budtender, BoardPick } from "../components/BudtenderBoard";

/**
 * Example view wiring BudtenderBoard to static data.
 * Replace the static data with Supabase-backed data loading when ready.
 */

const exampleBudtender: Budtender = {
  id: "justin-example",
  name: "Justin",
  picks_note_override: null,
};

const examplePicks: BoardPick[] = [
  {
    id: "1",
    product_name: "ADK - BLUE LOBSTER - 3.5G INDOOR FLOWER",
    category_line: "Indica Hybrid Flower",
    note: "My go-to hybrid flower when I want to unwind and feel cozy.",
    doodle_key: "cozy",
    rank: 1,
  },
  {
    id: "2",
    product_name: "RYTHM - JACK'S DELIGHT - INDOOR FLOWER",
    category_line: "Sativa Hybrid Flower",
    note: "My favorite daytime flower when I need energy for errands or being outside.",
    doodle_key: "sun",
    rank: 2,
  },
  {
    id: "3",
    product_name: "MFNY - HONEY BANANA - LIVE RESIN TINCTURE - 15ML",
    category_line: "Sativa Tincture",
    note: "What I reach for when I want a creative, upbeat boost without smoking.",
    doodle_key: "dropper",
    rank: 3,
  },
  {
    id: "4",
    product_name: "RYTHM - REMIX - MAI TAI - 0.5G INFUSED PRE ROLL - 5 PACK - 2.5G",
    category_line: "Sativa Hybrid Infused Pre Roll",
    note: "My pick when I want a strong, social pre-roll to share.",
    doodle_key: "sparkles",
    rank: 4,
  },
  {
    id: "5",
    product_name: "MFNY - MFNY SKUNK - LIVE RESIN - ALL-IN-ONE VAPE",
    category_line: "Indica All-In-One Vape",
    note: "Great for a calm, heavy unwind when I’m done for the night.",
    doodle_key: "zzz",
    rank: 5,
  },
  {
    id: "6",
    product_name: "1906 - BLISS DROPS - 2 PACK (10MG THC + 10MG CBD)",
    category_line: "1:1 Drops / Edible",
    note: "A gentle, happy edible I like when I want a good mood without going too hard.",
    doodle_key: "smile",
    rank: 6,
  },
  {
    id: "7",
    product_name:
      "AYRLOOM - UP 2:1 - 12OZ SINGLE CAN (10MG THC, 5MG CBD) - BLACK CHERRY",
    category_line: "2:1 Beverage",
    note: "My choice when I want a bright, fruity drink instead of a beer.",
    doodle_key: "can",
    rank: 7,
  },
  {
    id: "8",
    product_name: "SILLY NICE - THCA DIAMOND POWDER",
    category_line: "High Potency Concentrate",
    note: "Only for experienced folks—what I use to boost bowls or dabs.",
    doodle_key: "diamond",
    rank: 8,
  },
  {
    id: "9",
    product_name: "AYRLOOM - RESTORE - BALM (1000MG THC, 1000MG CBD)",
    category_line: "1:1 Topical Balm",
    note: "What I recommend for sore muscles when you don’t want to feel high.",
    doodle_key: "jar",
    rank: 9,
  },
];

export function BudtenderBoardExampleView() {
  return <BudtenderBoard budtender={exampleBudtender} picks={examplePicks} />;
}
