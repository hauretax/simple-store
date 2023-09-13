import Store from './Store';

describe('Store', () => {
  let myStore: Store;

  beforeEach(() => {
    myStore = new Store();
  });




  it('should store JSON values', () => {
    const data1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(data1)));
    expect(myStore.data).toEqual(data1);

    const data2 = { id: 1, user: { name: 'boulle', town: { id: 9 } } };
    myStore.storeJSONString(JSON.stringify(data2));
    // Vérifie si la valeur JSON a été correctement stockée
    expect(myStore.data).toEqual(data2);
  });

  it('should retrive data', () => {
    const data1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.storeJSON(JSON.parse(JSON.stringify(data1)));
  })


  it('should store and retrieve values', () => {
    myStore.storeNestedKey('', 'valeur');
    expect(myStore.data).toEqual({});
    myStore.storeNestedKey('a.b.c', 42);
    myStore.storeNestedKey('a.d.g', 'qux');
    expect(myStore.data.a.d.g).toBe('qux');
    expect(myStore.data.a.b.c).toBe(42);

    myStore.storeNestedKey('a.d.g.x', 'test');
    expect(myStore.data.a.d.g.x).toBe('test');
    myStore.storeNestedKey('a.d.g.x', 'AAAA');
    expect(myStore.data.a.d.g.x).toBe('AAAA');
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
