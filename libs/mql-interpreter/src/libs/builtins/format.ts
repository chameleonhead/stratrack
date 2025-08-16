export function formatString(fmt: string, ...args: any[]): string {
  let idx = 0;
  return fmt.replace(/%%|%[sdif]/g, (token) => {
    if (token === "%%") return "%";
    const arg = args[idx++];
    switch (token) {
      case "%d":
        return Math.trunc(arg).toString();
      case "%f":
        return Number(arg).toString();
      case "%s":
        return String(arg);
      default:
        return String(arg);
    }
  });
}
