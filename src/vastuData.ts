export interface Deity {
  name: string;
  cells: { r: number; c: number }[];
  element: 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space';
}

export const VASTU_DEITIES: Deity[] = [
  // Outer Border (32)
  // Top Row (North -> NE)
  { name: 'Roga', cells: [{ r: 0, c: 0 }], element: 'Space' },
  { name: 'Naga', cells: [{ r: 0, c: 1 }], element: 'Water' },
  { name: 'Mukhya', cells: [{ r: 0, c: 2 }], element: 'Water' },
  { name: 'Bhallat', cells: [{ r: 0, c: 3 }], element: 'Water' },
  { name: 'Soma', cells: [{ r: 0, c: 4 }], element: 'Water' },
  { name: 'Bhujag', cells: [{ r: 0, c: 5 }], element: 'Water' },
  { name: 'Aditi', cells: [{ r: 0, c: 6 }], element: 'Water' },
  { name: 'Diti', cells: [{ r: 0, c: 7 }], element: 'Water' },
  { name: 'Shikhi', cells: [{ r: 0, c: 8 }], element: 'Water' },

  // Right Col (East -> SE)
  { name: 'Parjanya', cells: [{ r: 1, c: 8 }], element: 'Air' },
  { name: 'Jayanta', cells: [{ r: 2, c: 8 }], element: 'Air' },
  { name: 'Indra', cells: [{ r: 3, c: 8 }], element: 'Air' },
  { name: 'Surya', cells: [{ r: 4, c: 8 }], element: 'Air' },
  { name: 'Satya', cells: [{ r: 5, c: 8 }], element: 'Air' },
  { name: 'Bhrisha', cells: [{ r: 6, c: 8 }], element: 'Air' },
  { name: 'Antariksha', cells: [{ r: 7, c: 8 }], element: 'Air' },
  { name: 'Anil', cells: [{ r: 8, c: 8 }], element: 'Fire' },

  // Bottom Row (South -> SW)
  { name: 'Pusha', cells: [{ r: 8, c: 7 }], element: 'Fire' },
  { name: 'Vitatha', cells: [{ r: 8, c: 6 }], element: 'Fire' },
  { name: 'Grahkshat', cells: [{ r: 8, c: 5 }], element: 'Fire' },
  { name: 'Yama', cells: [{ r: 8, c: 4 }], element: 'Fire' },
  { name: 'Gandharva', cells: [{ r: 8, c: 3 }], element: 'Fire' },
  { name: 'Bhringaraj', cells: [{ r: 8, c: 2 }], element: 'Fire' },
  { name: 'Mriga', cells: [{ r: 8, c: 1 }], element: 'Fire' },
  { name: 'Pitra', cells: [{ r: 8, c: 0 }], element: 'Earth' },

  // Left Col (West -> NW)
  { name: 'Dauvarika', cells: [{ r: 7, c: 0 }], element: 'Earth' },
  { name: 'Sugriva', cells: [{ r: 6, c: 0 }], element: 'Earth' },
  { name: 'Pushpadanta', cells: [{ r: 5, c: 0 }], element: 'Space' },
  { name: 'Varuna', cells: [{ r: 4, c: 0 }], element: 'Space' },
  { name: 'Asura', cells: [{ r: 3, c: 0 }], element: 'Space' },
  { name: 'Shosha', cells: [{ r: 2, c: 0 }], element: 'Space' },
  { name: 'Papayakshma', cells: [{ r: 1, c: 0 }], element: 'Space' },

  // Center (Brahma)
  {
    name: 'Brahma',
    cells: [
      { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 },
      { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 5 },
      { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 },
    ],
    element: 'Earth',
  },

  // 4 Directional Inner Deities
  {
    name: 'Aryama', // East
    cells: [
      { r: 3, c: 6 }, { r: 3, c: 7 },
      { r: 4, c: 6 }, { r: 4, c: 7 },
      { r: 5, c: 6 }, { r: 5, c: 7 },
    ],
    element: 'Air',
  },
  {
    name: 'Vivasvan', // South
    cells: [
      { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
      { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 },
    ],
    element: 'Fire',
  },
  {
    name: 'Mitra', // West
    cells: [
      { r: 3, c: 1 }, { r: 3, c: 2 },
      { r: 4, c: 1 }, { r: 4, c: 2 },
      { r: 5, c: 1 }, { r: 5, c: 2 },
    ],
    element: 'Space',
  },
  {
    name: 'Mahidhara', // North
    cells: [
      { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 },
      { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    ],
    element: 'Water',
  },

  // 8 Corner Inner Deities
  // NE Corner
  { name: 'Apa', cells: [{ r: 1, c: 7 }, { r: 2, c: 7 }], element: 'Water' },
  { name: 'Apavatsa', cells: [{ r: 1, c: 6 }, { r: 2, c: 6 }], element: 'Water' },

  // SE Corner
  { name: 'Savita', cells: [{ r: 6, c: 7 }, { r: 7, c: 7 }], element: 'Fire' },
  { name: 'Savitra', cells: [{ r: 6, c: 6 }, { r: 7, c: 6 }], element: 'Fire' },

  // SW Corner
  { name: 'Indra (Inner)', cells: [{ r: 6, c: 1 }, { r: 7, c: 1 }], element: 'Earth' },
  { name: 'Jaya', cells: [{ r: 6, c: 2 }, { r: 7, c: 2 }], element: 'Earth' },

  // NW Corner
  { name: 'Rudra', cells: [{ r: 1, c: 1 }, { r: 2, c: 1 }], element: 'Space' },
  { name: 'Rajyakshma', cells: [{ r: 1, c: 2 }, { r: 2, c: 2 }], element: 'Space' },
];

export const ELEMENT_COLORS = {
  Water: 'rgba(59, 130, 246, 0.5)',   // Blue
  Air: 'rgba(34, 197, 94, 0.5)',     // Green
  Fire: 'rgba(239, 68, 68, 0.5)',    // Red
  Earth: 'rgba(234, 179, 8, 0.5)',   // Yellow
  Space: 'rgba(156, 163, 175, 0.5)', // Gray
};

export const AUSPICIOUS_ENTRIES = [
  'Gandharva', 'Grahkshat', 'Sugriva', 'Pushpadanta', 'Mukhya', 'Bhallat', 'Soma', 'Jayanta', 'Indra'
];

