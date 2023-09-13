import Store from './Store';

describe('Store', () => {
  let myStore: Store;

  beforeEach(() => {
    myStore = new Store();
  });




  it('should store JSON values', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(store1)));
    expect(myStore.store).toEqual(store1);

    const store2 = { id: 1, user: { name: 'boulle', town: { id: 9 } } };
    myStore.storeJSONString(JSON.stringify(store2));
    // Vérifie si la valeur JSON a été correctement stockée
    expect(myStore.store).toEqual(store2);
  });

  it('should retrive store', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(store1)));
    expect(myStore.retrieve('id')).toEqual(1)
    expect(myStore.retrieve('user')).toEqual({ name: 'jhon', town: { id: 8 } })
    expect(myStore.retrieve('user.name')).toEqual('jhon')
  })


  it('should handle nested keys', () => {
    myStore.storeNestedKey('', 'valeur');
    expect(myStore.store).toEqual({});
    myStore.storeNestedKey('a.b.c', 42);
    myStore.storeNestedKey('a.d.g', 'qux');
    expect(myStore.store.a.d.g).toBe('qux');
    expect(myStore.store.a.b.c).toBe(42);

    myStore.storeNestedKey('a.d.g.x', 'test');
    expect(myStore.store.a.d.g.x).toBe('test');
    myStore.storeNestedKey('a.d.g.x', 'AAAA');
    expect(myStore.store.a.d.g.x).toBe('AAAA');
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
    expect(() => myStore.store('user3.store', new Date())).toThrow('Value is not serializable');
  });

  it('should return undefined for non-existing keys', () => {
    expect(myStore.retrieve('nonExistingKey')).toBeUndefined();
  });
});
