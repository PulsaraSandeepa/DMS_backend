export default abstract class BaseClass<T, V> {
    uid?: string;
    path?: string;
    abstract equals(obj: T): boolean;
    abstract getProperties(): V;
}
