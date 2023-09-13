import Store from './Store';
import { ERROR_NOT_SERIALIZABLE } from './constants';

describe('Store', () => {
  let myStore: Store;

  beforeEach(() => {
    // Create a new instance of the Store before each test
    myStore = new Store();
  });

  it('stores and retrieves JSON values', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };

    // Store store1 as JSON and retrieve it
    myStore.setByJSON(JSON.parse(JSON.stringify(store1)));

    // Check if the retrieved value matches store1
    expect(myStore.get('')).toEqual(store1);

    // Create another store and check if it's stored and retrieved correctly
    const store2 = { id: 1, user: { name: 'boulle', town: { id: 9 } } };
    myStore.setByJSON(JSON.stringify(store2));
    expect(myStore.get('')).toEqual(store2);

    // Store and retrieve null and undefined values
    myStore.setByJSON(JSON.stringify({ key1: null, key2: undefined }));
    expect(myStore.get('key1')).toBeNull();
    expect(myStore.get('key2')).toBeUndefined();

    // Store and retrieve complex objects
    const complexObj = {
      a: [1, 2, 3],
      b: { x: 'foo', y: [4, 5, 6] },
    };
    myStore.setByJSON(JSON.stringify(complexObj));
    expect(myStore.get('a')).toEqual([1, 2, 3]);
    expect(myStore.get('b')).toEqual({ x: 'foo', y: [4, 5, 6] });

    // Modify and check if modifications are reflected
    myStore.set('a.1', 42);
    expect(myStore.get('a')).toEqual([1, 42, 3]);

    // Attempt to store malformed JSON and expect an error
    const malformedJSON = '{ "key1": "value1, "key2": "value2" }';
    expect(() => myStore.setByJSON(malformedJSON)).toThrow();
  });

  it('retrieves values from the store', () => {
    const store1 = { id: 1, user: { name: 'jhon', town: { id: 8 } } };

    // Store store1 as JSON and retrieve it
    myStore.setByJSON(JSON.parse(JSON.stringify(store1)));

    // Check if various keys are retrieved correctly
    expect(myStore.get('')).toEqual(store1);
    expect(myStore.get('id')).toEqual(1);
    expect(myStore.get('user')).toEqual({ name: 'jhon', town: { id: 8 } });
    expect(myStore.get('user.name')).toEqual('jhon');

    // Check for non-existent key and undefined value
    expect(myStore.get('nonExistentKey')).toBeUndefined();

    // Continue testing nested keys and modifications
    expect(myStore.get('user')).toEqual({ name: 'jhon', town: { id: 8 } });
    expect(myStore.get('user.town')).toEqual({ id: 8 });

    // Store and retrieve arrays and objects
    myStore.set('arr', [1, 2, 3]);
    myStore.set('obj', { a: { b: 'value' } });
    expect(myStore.get('arr.0')).toEqual(1);
    expect(myStore.get('obj.a.b')).toEqual('value');

    // Modify values and check if modifications are reflected
    myStore.set('id', 42);
    expect(myStore.get('id')).toEqual(42);
    myStore.set('user.name', 'newName');
    expect(myStore.get('user.name')).toEqual('newName');
  });

  it('stores and retrieves nested keys', () => {
    // Store a simple value and retrieve it
    myStore.set('s', 'value');
    expect(myStore.get('s')).toEqual('value');

    // Store nested keys and retrieve them
    myStore.set('a.b.c', 42);
    myStore.set('a.d.g', 'qux');
    expect(myStore.get('a.b.c')).toEqual(42);
    expect(myStore.get('a.d.g')).toEqual('qux');

    // Store arrays and objects and retrieve them
    myStore.set('a.d.h', [1, 2, 3]);
    myStore.set('a.d.i', { key: 'value' });

    expect(myStore.get('a.d.h')).toEqual([1, 2, 3]);
    expect(myStore.get('a.d.i')).toEqual({ key: 'value' });

    // Modify values and check if modifications are reflected
    myStore.set('a.d.g.x', 'test');
    expect(myStore.get('a.d.g.x')).toEqual('test');
    myStore.set('a.d.g.x', 'AAAA');
    expect(myStore.get('a.d.g.x')).toEqual('AAAA');

    // Retrieve and check the newly stored value
    myStore.set('a.d.i.key', 'newvalue');
    expect(myStore.get('a.d.i.key')).toEqual('newvalue');
  });

  it('lists stored entries', () => {
    // Set entries using setByObject
    myStore.setByObject({ a: 'ef', b: { a: "jh", c: "jsp", d: ['a', 'b', 'r', 'a', 'k', 'a', 'd', 'b', 'r', 'a'] } });

    // Define the expected entries
    const should = {
      "a": "ef",
      "b.a": "jh",
      "b.c": "jsp",
      "b.d": ["a", "b", "r", "a", "k", "a", "d", "b", "r", "a"]
    };

    // Get entries from the store and compare them to the expected entries
    const entries = myStore.getEntries();
    expect(entries).toEqual(should);

    // Modify an entry and check if it's updated
    myStore.set('c.d.e', 'newvalue');
    should['c.d.e'] = 'newvalue';
    const updatedEntries = myStore.getEntries();
    expect(updatedEntries).toEqual(should);

    // Modify another entry and check if it's updated
    myStore.set('b.a', 'modified');
    should['b.a'] = 'modified';
    const updatedEntriesAfterModify = myStore.getEntries();
    expect(updatedEntriesAfterModify).toEqual(should);
  });

  it('retrieves JSON string', () => {
    // Set entries using setByObject
    myStore.setByObject({ a: 'ef', b: { a: "jh", c: "jsp", d: ['a', 'b', 'r', 'a', 'k', 'a', 'd', 'b', 'r', 'a'] } });

    // Define the expected JSON string
    const should = '{"a":"ef","b":{"a":"jh","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]}}';

    // Retrieve the JSON string and compare it to the expected value
    const storedJson = myStore.getByJson();
    expect(storedJson).toEqual(should);

    // Modify an entry and check if the JSON string is updated accordingly
    myStore.set('b.a', 'modified');
    const modifiedJson = myStore.getByJson();
    const expectedModifiedJson = '{"a":"ef","b":{"a":"modified","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]}}';
    expect(modifiedJson).toEqual(expectedModifiedJson);

    // Set a numeric value and check if it's included in the JSON string
    myStore.set('c', 42);
    const typedDataJson = myStore.getByJson();
    const expectedTypedDataJson = '{"a":"ef","b":{"a":"modified","c":"jsp","d":["a","b","r","a","k","a","d","b","r","a"]},"c":42}';
    expect(typedDataJson).toEqual(expectedTypedDataJson);
  });

  it('throws an error for non-serializable values', () => {
    // Create an object with a circular reference (non-serializable)
    const nonSerializableData = {
      circularReference: null,
    };
    nonSerializableData.circularReference = nonSerializableData;

    // Expect an error when attempting to store the non-serializable data using 'set'
    expect(() => myStore.set('user3.store', nonSerializableData)).toThrow(ERROR_NOT_SERIALIZABLE);

    // Expect an error when attempting to store the non-serializable data using 'setByObject'
    expect(() => myStore.setByObject({ a: nonSerializableData })).toThrow(ERROR_NOT_SERIALIZABLE);
  });

  it('returns undefined for non-existing keys', () => {
    // Expect 'undefined' for a key that doesn't exist in the store
    expect(myStore.get('nonExistingKey')).toBeUndefined();
  });
});