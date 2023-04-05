export const stripAscii = (stringValue: string) =>
  stringValue.replace(/[^a-zA-Z ]/g, "");
