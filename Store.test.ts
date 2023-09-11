import Store from './Store';

describe('Store', () => {
  let myStore: Store;

  beforeEach(() => {
    myStore = new Store();
  });

  it('should store and retrieve values', () => {
    myStore.storeNestedKey('', 'valeur');
    expect(myStore.data).toEqual({});
    myStore.storeNestedKey('foo', 42);
    expect(myStore.data.foo).toBe(42);
    myStore.storeNestedKey('bar.baz', 'qux');
    expect(myStore.data.bar.baz).toBe('qux');
    myStore.storeNestedKey('bar', 'nouvelleValeur');
    myStore.storeNestedKey('a.b.c.d', 123);
    myStore.storeNestedKey('a.b.c.g', 2);
    expect(myStore.data.bar).toBe('nouvelleValeur');
    expect(myStore.data.a.b.c.d).toBe(123);
    expect(myStore.data.a.b.c.g).toBe(2);
  });

  it('should handle nested keys', () => {
    myStore.store('user.address.city', 'New York');
    expect(myStore.retrieve('user.address.city')).toBe('New York');
  });

  it('should list all stored entries', () => {
    myStore.store('user1.name', 'Alice');
    myStore.store('user2.age', 30);
    const entries = myStore.listEntries();
    expect(entries).toEqual({
      'user1.name': 'Alice',
      'user2.age': 30,
    });
  });

  it('should throw an error for non-serializable values', () => {
    expect(() => myStore.store('user3.data', new Date())).toThrow('Value is not serializable');
  });

  it('should return undefined for non-existing keys', () => {
    expect(myStore.retrieve('nonExistingKey')).toBeUndefined();
  });
});
