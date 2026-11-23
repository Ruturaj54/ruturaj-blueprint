import { weekdayOf } from '@/engine/dates';
import type { Slot } from '@/engine/schedule';

/**
 * Protein dinners for a vegetarian who eats eggs: no chicken, no fish, no meat.
 * One per weekday so the shopping is predictable, plus a spare.
 *
 * Label: general advice. The protein figures are rough estimates from common
 * nutrition values for the portion written (one large egg about 6 g, 100 g
 * paneer about 18 g, 40 g dry soya chunks about 20 g, one phulka about 3 g).
 * They are not measurements; packets and home recipes vary.
 */

export interface Dinner {
  id: string;
  name: string;
  /** What goes on the plate, with portions, so the estimate means something. */
  plate: string;
  /** Approximate grams of protein for that plate. */
  proteinG: number;
}

export const PROTEIN_DINNERS: readonly Dinner[] = [
  { id: 'egg-bhurji', name: 'Egg bhurji + 2 phulkas', plate: '3-egg bhurji with onion, tomato and capsicum · 2 phulkas · cucumber salad', proteinG: 24 },
  { id: 'paneer-bhurji', name: 'Paneer bhurji + 2 phulkas', plate: '100 g paneer bhurji with peas · 2 phulkas · salad', proteinG: 24 },
  { id: 'moong-chilla', name: 'Moong dal chilla + hung curd', plate: '2 chillas from about 60 g soaked moong dal · 100 g hung curd dip · mint chutney', proteinG: 20 },
  { id: 'soya-curry', name: 'Soya chunk curry + 1 phulka', plate: '40 g dry soya chunks in a tomato-onion curry · 1 phulka · salad', proteinG: 23 },
  { id: 'egg-curry', name: 'Egg curry + dal + 1 phulka', plate: '2-egg curry · 1 katori dal · 1 phulka', proteinG: 22 },
  { id: 'paneer-tikka', name: 'Paneer tikka + dal', plate: '100 g paneer tikka, pan or air-fried · 1 katori dal · salad', proteinG: 25 },
  { id: 'rajma-curd', name: 'Rajma or chole + curd', plate: '1 katori rajma or chole · half katori rice · 1 katori curd', proteinG: 15 },
  { id: 'besan-chilla', name: 'Besan chilla + curd', plate: '2 chillas from about 60 g besan with vegetables · 1 katori curd', proteinG: 18 },
];

/** 0 = Sunday. The slower dishes land on the weekend. */
const BY_WEEKDAY: Record<number, string> = {
  0: 'rajma-curd',
  1: 'egg-bhurji',
  2: 'paneer-bhurji',
  3: 'moong-chilla',
  4: 'soya-curry',
  5: 'egg-curry',
  6: 'paneer-tikka',
};

export const PROTEIN_NOTE =
  'Protein figures are rough estimates from common nutrition values for the portion written, not measurements. Plate order: protein first, then vegetables, roti or rice last.';

export function dinnerById(id: string): Dinner | undefined {
  return PROTEIN_DINNERS.find((d) => d.id === id);
}

/** Tonight's plate for a date. Same weekday, same dinner, so groceries can be planned. */
export function dinnerFor(date: string): Dinner {
  return dinnerById(BY_WEEKDAY[weekdayOf(date)] ?? '') ?? (PROTEIN_DINNERS[0] as Dinner);
}

/** The routine entries that are dinner, on any day type. */
export const DINNER_SLOT_IDS: ReadonlySet<string> = new Set(['dinner', 'sat-dinner', 'sun-dinner']);

/**
 * The day's slots with tonight's plate written into the dinner entry and his
 * walk target into the walk, so the timetable, the Now card and both mails say
 * the same thing.
 */
export function withDinner<T extends Pick<Slot, 'id' | 'label' | 'note' | 'kind'>>(slots: T[], date: string, walkKm?: number): T[] {
  const d = dinnerFor(date);
  return slots.map((s) => {
    if (DINNER_SLOT_IDS.has(s.id)) {
      return { ...s, label: `Protein dinner · ${d.name}`, note: `${d.plate}. About ${d.proteinG} g protein (rough estimate). ${s.note}` };
    }
    if (s.kind === 'walk' && walkKm) return { ...s, label: s.label.replace(/^Evening walk/, `${walkKm} km walk`) };
    return s;
  });
}
