export class DateTimeValue {
  constructor(private readonly seconds: number) {}

  valueOf(): number {
    return this.seconds;
  }

  toString(): string {
    const date = new Date(this.seconds * 1000);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
