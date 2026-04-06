export const capitalizeWord = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function fmtAmount(amount: number): string {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

export function formatTruckNumber(value: string): string {
  const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  const stateCode = clean.slice(0, 2);
  const district = clean.slice(2, 4);
  const rest = clean.slice(4);

  if (clean.length <= 2) return stateCode;
  if (clean.length <= 4) return stateCode + district;

  // Split rest into leading letters (series) and trailing digits (number)
  const seriesMatch = rest.match(/^([A-Z]{1,3})(\d*)$/);

  if (!seriesMatch) {
    const lettersOnly = rest.replace(/[^A-Z]/g, "").slice(0, 3);
    return stateCode + district + lettersOnly;
  }

  const series = seriesMatch[1];
  const number = seriesMatch[2].slice(0, 4); // slice here instead of in regex

  if (!number) {
    return stateCode + district + series;
  }

  return stateCode + district + series + " " + number;
}
