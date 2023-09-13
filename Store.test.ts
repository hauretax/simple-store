import Store from './Store';
import { STORE_ERRORS, UserType } from './constants';

describe('Store', () => {
  let myStore: Store;

  const publicUser: UserType = {
    id: '1',
    permission: ['READ']
  }

  const privateUser: UserType = {
    id: '2',
    permission: ['READ', 'WRITE', 'DELETE']
  }

  const adminUser: UserType = {
    id: '3',
    permission: ['READ', 'WRITE', 'SEE_RECORD']
  }

  beforeEach(() => {
    // Create a new instance of the Store before each test
    myStore = new Store();
  });


  it('record', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };
    myStore.setByJSON(JSON.parse(JSON.stringify(store1)), privateUser);
    expect(myStore.getRecord(adminUser)).toBeDefined()
    expect(() => myStore.getRecord(publicUser)).toThrow(STORE_ERRORS.ACCESS_DENID + ' SEE_RECORD')
    console.log()
  })

  it('stores and retrieves JSON values', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };

    // Store store1 as JSON and retrieve it
    myStore.setByJSON(JSON.parse(JSON.stringify(store1)), privateUser);

    // Check if the retrieved value matches store1
    expect(myStore.get('', publicUser)).toEqual(store1);

    // Create another store and check if it's stored and retrieved correctly
    const store2 = { id: 1, user: { name: 'boulle', town: { id: 9 } } };
    myStore.setByJSON(JSON.stringify(store2), privateUser);
    expect(myStore.get('', publicUser)).toEqual(store2);

    // Store and retrieve null and undefined values
    myStore.setByJSON(JSON.stringify({ key1: null, key2: undefined }), privateUser);
    expect(myStore.get('key1', publicUser)).toBeNull();
    expect(myStore.get('key2', publicUser)).toBeUndefined();

    // Store and retrieve complex objects
    const complexObj = {
      a: [1, 2, 3],
      b: { x: 'foo', y: [4, 5, 6] },
    };
    myStore.setByJSON(JSON.stringify(complexObj), privateUser);
    expect(myStore.get('a', publicUser)).toEqual([1, 2, 3]);
    expect(myStore.get('b', publicUser)).toEqual({ x: 'foo', y: [4, 5, 6] });

    // Modify and check if modifications are reflected
    myStore.set('a.1', 42, privateUser);
    expect(myStore.get('a', publicUser)).toEqual([1, 42, 3]);

    // Attempt to store malformed JSON and expect an error
    const malformedJSON = '{ "key1": "value1, "key2": "value2" }';
    expect(() => myStore.setByJSON(malformedJSON, privateUser)).toThrow();
  });

  it('retrieves values from the store', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };

    // Store store1 as JSON and retrieve it
    myStore.setByJSON(JSON.parse(JSON.stringify(store1)), privateUser);

    // Check if various keys are retrieved correctly
    expect(myStore.get('', publicUser)).toEqual(store1);
    expect(myStore.get('id', publicUser)).toEqual(1);
    expect(myStore.get('user', publicUser)).toEqual({ name: 'jhon', town: { id: 8 } });
    expect(myStore.get('user.name', publicUser)).toEqual('jhon');

    // Check for non-existent key and undefined value
    expect(myStore.get('nonExistentKey', publicUser)).toBeUndefined();

    // Continue testing nested keys and modifications
    expect(myStore.get('user', publicUser)).toEqual({ name: 'jhon', town: { id: 8 } });
    expect(myStore.get('user.town', publicUser)).toEqual({ id: 8 });

    // Store and retrieve arrays and objects
    myStore.set('arr', [1, 2, 3], privateUser);
    myStore.set('obj', { a: { b: 'value' } }, privateUser);
    expect(myStore.get('arr.0', publicUser)).toEqual(1);
    expect(myStore.get('obj.a.b', publicUser)).toEqual('value');

    // Modify values and check if modifications are reflected
    myStore.set('id', 42, privateUser);
    expect(myStore.get('id', publicUser)).toEqual(42);
    myStore.set('user.name', 'newName', privateUser);
    expect(myStore.get('user.name', publicUser)).toEqual('newName');
  });

  it('stores and retrieves nested keys', () => {
    // Store a simple value and retrieve it
    myStore.set('s', 'value', privateUser);
    expect(myStore.get('s', publicUser)).toEqual('value');

    // Store nested keys and retrieve them
    myStore.set('a.b.c', 42, privateUser);
    myStore.set('a.d.g', 'qux', privateUser);
    expect(myStore.get('a.b.c', publicUser)).toEqual(42);
    expect(myStore.get('a.d.g', publicUser)).toEqual('qux');

    // Store arrays and objects and retrieve them
    myStore.set('a.d.h', [1, 2, 3], privateUser);
    myStore.set('a.d.i', { key: 'value' }, privateUser);

    expect(myStore.get('a.d.h', publicUser)).toEqual([1, 2, 3]);
    expect(myStore.get('a.d.i', publicUser)).toEqual({ key: 'value' });

    // Modify values and check if modifications are reflected
    myStore.set('a.d.g.x', 'test', privateUser);
    expect(myStore.get('a.d.g.x', publicUser)).toEqual('test');
    myStore.set('a.d.g.x', 'AAAA', privateUser);
    expect(myStore.get('a.d.g.x', publicUser)).toEqual('AAAA');

    // Retrieve and check the newly stored value
    myStore.set('a.d.i.key', 'newvalue', privateUser);
    expect(myStore.get('a.d.i.key', publicUser)).toEqual('newvalue');
  });

  it('delet some entries', () => {
    myStore.set('a.d.i.key', 'newvalue', privateUser);
    myStore.del('a.d.i.key', privateUser);
    expect(myStore.get('a.d.i', publicUser)).toEqual({});
  })

  it('lists stored entries', () => {
    // Set entries using setByObject
    myStore.setByObject({ a: 'ef', b: { a: "jh", c: "jsp", d: ['a', 'b', 'r', 'a', 'k', 'a', 'd', 'b', 'r', 'a'] } }, privateUser);

    // Define the expected entries
    const should = {
      "a": "ef",
      "b.a": "jh",
      "b.c": "jsp",
      "b.d": ["a", "b", "r", "a", "k", "a", "d", "b", "r", "a"]
    };

    // Get entries from the store and compare them to the expected entries
    const entries = myStore.getEntries(publicUser);
    expect(entries).toEqual(should);

    // Modify an entry and check if it's updated
    myStore.set('c.d.e', 'newvalue', privateUser);
    should['c.d.e'] = 'newvalue';
    const updatedEntries = myStore.getEntries(publicUser);
    expect(updatedEntries).toEqual(should);

    // Modify another entry and check if it's updated
    myStore.set('b.a', 'modified', privateUser);
    should['b.a'] = 'modified';
    const updatedEntriesAfterModify = myStore.getEntries(publicUser);
    expect(updatedEntriesAfterModify).toEqual(should);
  });

  it('retrieves JSON string', () => {
    // Set entries using setByObject
    myStore.setByObject({ a: 'ef', b: { a: "jh", c: "jsp", d: ['a', 'b', 'r', 'a', 'k', 'a', 'd', 'b', 'r', 'a'] } }, privateUser);

    // Define the expected JSON string
    const should = '{"a":"ef","b":{"a":"jh","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]}}';

    // Retrieve the JSON string and compare it to the expected value
    const storedJson = myStore.getByJson(publicUser);
    expect(storedJson).toEqual(should);

    // Modify an entry and check if the JSON string is updated accordingly
    myStore.set('b.a', 'modified', privateUser);
    const modifiedJson = myStore.getByJson(publicUser);
    const expectedModifiedJson = '{"a":"ef","b":{"a":"modified","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]}}';
    expect(modifiedJson).toEqual(expectedModifiedJson);

    myStore.del('a', privateUser)
    const typedDeletJson = myStore.getByJson(publicUser);
    const expectedDeletDataJson = '{"b":{"a":"modified","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]}}';
    expect(expectedDeletDataJson).toEqual(typedDeletJson);


    // Set a numeric value and check if it's included in the JSON string
    const typedDataJson = myStore.getByJson(publicUser, 'b.c');
    expect(typedDataJson).toEqual("jsp");
  });

  it('throws an error for non-serializable values', () => {
    // Create an object with a circular reference (non-serializable)
    const nonSerializableData = {
      circularReference: null,
    };
    nonSerializableData.circularReference = nonSerializableData;

    // Expect an error when attempting to store the non-serializable data using 'set'
    expect(() => myStore.set('user3.store', nonSerializableData, privateUser)).toThrow(STORE_ERRORS.NOT_SERIALIZABLE);

    // Expect an error when attempting to store the non-serializable data using 'setByObject'
    expect(() => myStore.setByObject({ a: nonSerializableData }, privateUser)).toThrow(STORE_ERRORS.NOT_SERIALIZABLE);
  });

  it('returns undefined for non-existing keys', () => {
    // Expect 'undefined' for a key that doesn't exist in the store
    expect(myStore.get('nonExistingKey', publicUser)).toBeUndefined();
  });
});