import { ERROR_NOT_SERIALIZABLE } from "./constants";
import merge from 'lodash/merge';

/**
 * Represents a Store for storing and retrieving data.
 */
export default class Store {
  private store: Record<string, any> = {};


  /**
 * Stores an object in the Store.
 * @param {object} object - The object to store.
*/
  storeObject(object: object) {
    //check if is seralizable befor merge it
    this.isSerializable(object)
    merge(this.store, object)
  }

  /**
 * Stores JSON data in the Store.
 * @param {JSON} json - The JSON data to store.
 */
  storeJSON(json: JSON | string) {
    if (typeof json === 'string')
      json = JSON.parse(json) as JSON
    merge(this.store, json)
  }


  /**
   * Stores a value at a nested key in the Store.
   * @param {string} keyString - The key string representing the nested location.
   * @param {any} value - The value to store.
   */
  storeNestedKey(keyString: string, value: any): void {
    //check if is seralizable befor merge it
    this.isSerializable(value)

    if (!keyString)
      return;
    // Create an array of keys from the keyString
    const keyTab = keyString.split('.')
    // Create a new object and deep merge it
    let newObj = {}
    keyTab.reduce((tmpObj, key, i) => {
      if (i === keyTab.length - 1) return tmpObj[key] = value
      return (tmpObj[key] = {});
    }, newObj);
    merge(this.store, newObj)
  }

  /**
 * Retrieves a value from the Store based on a nested key.
 * @param {string} keyString - The key string representing the nested location.
 * @returns {any} The retrieved value.
 */
  retrieve(keyString: string): any {
    if (keyString === '')
      return this.store
    // Create an array of keys from the keyString
    const keyTab = keyString.split('.')
    // Find the value in the store
    let currentObj = this.store;
    for (const key of keyTab) {
      if (currentObj.hasOwnProperty(key)) {
        currentObj = currentObj[key];
      } else {
        return undefined
      }
    }
    return currentObj;
  }

  /**
 * Lists all entries in the Store.
 * @returns {object} An object containing all entries in the Store.
 */
  listEntries() {
    const entries = {};

    function recurse(obj: object, currentKey: string) {
      for (const key in obj) {
        // Recursion termination
        if (!obj.hasOwnProperty(key)) return;
        // Set up the object pushed in the array
        const newKey = currentKey ? `${currentKey}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'object' && !Array.isArray(value))
          // If the value is an object, recurse to handle nested keys
          recurse(value, newKey);
        else
          // Otherwise, add an entry to the list
          entries[newKey] = value
      }
    }

    recurse(this.store, '');

    return entries;
  }

  /**
   * Merges two objects, incorporating obj2's properties into obj1.
   * Handles nested objects to ensure obj1 retains its structure.
   *
   * @param {object} obj1 - The target object to merge into.
   * @param {object} obj2 - The source object with properties to merge from.
   */
  private deepMerge(obj1: object, obj2: object) {
    for (const key in obj2) {
      if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
        if (typeof obj1[key] !== 'object' || Array.isArray(obj1[key])) {
          obj1[key] = {};
        }
        this.deepMerge(obj1[key], obj2[key]);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }

  /**
 * Checks if a value can be serialized to JSON.
 * @param {any} value - The value to check for serializability.
 * @throws {Error} Throws an error if the value is not serializable.
  */
  private isSerializable(value: any) {
    try {
      JSON.stringify(value)
    } catch (error) {
      throw new Error(ERROR_NOT_SERIALIZABLE)
    }
  }

}
