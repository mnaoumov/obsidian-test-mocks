export abstract class Value {
  public abstract isTruthy(): boolean;
  public abstract toString(): string;
}
