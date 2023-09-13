import Store from './Store';
import { ERROR_NOT_SERIALIZABLE } from './constants';

describe('Store', () => {
  let myStore: Store;

  beforeEach(() => {
    myStore = new Store();
  });

  it('should store JSON values', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(store1)));
    expect(myStore.retrieve('')).toEqual(store1)

    const store2 = { id: 1, user: { name: 'boulle', town: { id: 9 } } };
    myStore.storeJSON(JSON.stringify(store2));
    // Vérifie si la valeur JSON a été correctement stockée
    expect(myStore.retrieve('')).toEqual(store2)
  });

  it('should retrive store', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(store1)));
    expect(myStore.retrieve('')).toEqual(store1)
    expect(myStore.retrieve('id')).toEqual(1)
    expect(myStore.retrieve('user')).toEqual({ name: 'jhon', town: { id: 8 } })
    expect(myStore.retrieve('user.name')).toEqual('jhon')
  })


  it('should handle nested keys', () => {
    myStore.storeNestedKey('', 'valeur');
    expect(myStore.retrieve('')).toEqual({})
    myStore.storeNestedKey('a.b.c', 42);
    myStore.storeNestedKey('a.d.g', 'qux');
    expect(myStore.retrieve('a.b.c')).toEqual(42)
    expect(myStore.retrieve('a.d.g')).toEqual('qux')

    myStore.storeNestedKey('a.d.g.x', 'test');
    expect(myStore.retrieve('a.d.g.x')).toEqual('test')
    myStore.storeNestedKey('a.d.g.x', 'AAAA');
    expect(myStore.retrieve('a.d.g.x')).toEqual('AAAA')
  });

  it('should list all stored entries', () => {

    myStore.storeObject({ a: 'ef', b: { a: "jh", c: "jsp", d: ['a', 'b', 'r', 'a', 'k', 'a', 'd', 'b', 'r', 'a'] } });
    const should = {
      "a": "ef",
      "b.a": "jh",
      "b.c": "jsp",
      "b.d": ["a", "b", "r", "a", "k", "a", "d", "b", "r", "a"]
    }
    const entries = myStore.listEntries();
    expect(entries).toEqual(should)
  });

  it('should throw an error for non-serializable values', () => {
    const nonSerializableData = {
      circularReference: null,
    };
    nonSerializableData.circularReference = nonSerializableData;
    expect(() => myStore.storeNestedKey('user3.store', nonSerializableData)).toThrow(ERROR_NOT_SERIALIZABLE);
    expect(() => myStore.storeObject({ a: nonSerializableData })).toThrow(ERROR_NOT_SERIALIZABLE);

  });

  it('should return undefined for non-existing keys', () => {
    expect(myStore.retrieve('nonExistingKey')).toBeUndefined();
  });
});
