import { Action, STORE_ERRORS, UserType, rec } from "./constants";
import merge from 'lodash/merge';
import unset from 'lodash/unset';

/**
 * Represents a Store for storing and retrieving data.
 */
export default class Store {
  private store: Record<string, any> = {};
  private record: Array<rec> = []

  /**
   * Stores an object in the Store.
   * @param {object} object - The object to store.
   * @throws {Error} Throws an error if the user is not allow to write.
  */
  setByObject(object: object, user: UserType) {
    this.userPermissionCheck("WRITE", user.permission)
    //check if is seralizable befor merge it
    this.isSerializable(object)
    this.mergeAndRecord(object, user.id)
  }

  /**
 * Stores JSON data in the Store.
 * @param {JSON} json - The JSON data to store.
 * @throws {Error} Throws an error if the user is not allow to write.
 */
  setByJSON(json: JSON | string, user: UserType) {
    this.userPermissionCheck("WRITE", user.permission)
    if (typeof json === 'string')
      json = JSON.parse(json) as JSON

    this.mergeAndRecord(json, user.id)
  }


  /**
   * Stores a value at a nested key in the Store.
   * @param {string} keyString - The key string representing the nested location.
   * @param {any} value - The value to store.
   * @throws {Error} Throws an error if the user is not allow to write.
   */
  set(keyString: string, value: any, user: UserType): void {
    this.userPermissionCheck("WRITE", user.permission)
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
    this.mergeAndRecord(newObj, user.id)
  }

  /**
 * Retrieves a value from the Store based on a nested key.
 * @param {string} keyString - The key string representing the nested location.
 */
  del(keyString: string, user: UserType) {
    this.userPermissionCheck("DELETE", user.permission)
    unset(this.store, keyString);
    this.record.push({ userId: user.id, action: 'DELETE', time: new Date, data: keyString })
  }


  /**
 * Retrieves a value from the Store based on a nested key.
 * @param {string} keyString - The key string representing the nested location.
 * @returns {any} The retrieved value.
 */
  get(keyString: string, user: UserType): any {
    this.userPermissionCheck("READ", user.permission)
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
    this.record.push({ userId: user.id, action: 'READ', time: new Date, data: keyString })
    return currentObj;
  }

  /**
   * Retrieves a stringyfi json
   * @returns {string} the json
   */
  getByJson(user: UserType, keyString?: string): string {
    this.userPermissionCheck("READ", user.permission)
    if (keyString)
      return this.get(keyString, user)
    this.record.push({ userId: user.id, action: 'READ', time: new Date })
    return JSON.stringify(this.store)
  }

  /**
 * Lists all entries in the Store.
 * @returns {object} An objeect containing all entries in the Store.
 */
  getEntries(user: UserType): object {
    this.userPermissionCheck("READ", user.permission)
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
    this.record.push({ userId: user.id, action: 'READ', time: new Date })
    return entries;
  }

  getRecord(user: UserType): Array<rec> {
    this.userPermissionCheck("SEE_RECORD", user.permission)
    this.record.push({ userId: user.id, action: "SEE_RECORD", time: new Date })
    return this.record;
  }


  private mergeAndRecord(data: object, userId: string) {
    merge(this.store, data)
    this.record.push({ userId, action: "WRITE", time: new Date, data })
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
      throw new Error(STORE_ERRORS.NOT_SERIALIZABLE)
    }
  }

  private userPermissionCheck(action: Action, userPermission: Array<Action>) {
    if (!userPermission.includes(action))
      throw new Error(STORE_ERRORS.ACCESS_DENID + ' ' + action)
  }

}
