export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height] normalized to 0-1
}