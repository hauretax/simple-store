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
   * @param {object} object - Object to store.
   * @param {UserType} user - User performing the operation.
   * @throws {Error} Throws an error if the user does not have permission to see records.
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
 * @param {UserType} user - User performing the operation.
 * @throws {Error} Throws an error if the user does not have permission to see records.
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
   * @param {UserType} user - User performing the operation.
   * @throws {Error} Throws an error if the user does not have permission to see records.
   */
  set(keyString: string, value: any, user: UserType) {
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
 * @param {UserType} user - User performing the operation.
 * @throws {Error} Throws an error if the user does not have permission to see records.
 */
  del(keyString: string, user: UserType) {
    this.userPermissionCheck("DELETE", user.permission)
    unset(this.store, keyString);
    this.record.push({ userId: user.id, action: 'DELETE', time: new Date, data: keyString })
  }

  /**
 * Retrieves a value from the Store based on a nested key.
 * @param {string} keyString - The key string representing the nested location.
 * @param {UserType} user - User performing the operation.
 * @returns {any} The retrieved value.
 * @throws {Error} Throws an error if the user does not have permission to see records.
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
   * @param {UserType} user - User performing the operation.
   * @throws {Error} Throws an error if the user does not have permission to see records.
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
 * @param {UserType} user - User performing the operation.
 * @throws {Error} Throws an error if the user does not have permission to see records.
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

  /**
 * Retrieves records for a user and logs the action.
 *
 * @param {UserType} user - The user for whom to retrieve records.
 * @returns {Array<rec>} An array of records for the user.
 * @throws {Error} Throws an error if the user does not have permission to see records.
 */
  getRecord(user: UserType): Array<rec> {
    this.userPermissionCheck("SEE_RECORD", user.permission)
    this.record.push({ userId: user.id, action: "SEE_RECORD", time: new Date })
    return this.record;
  }

  /**
   * Merges data into the store and records the action.
   *
   * @param {object} data - The data to merge into the store.
   * @param {string} userId - The ID of the user performing the action.
   * @returns {void}
   */
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

  /**
 * Checks if a user has permission to perform a specific action.
 *
 * @param {Action} action - The action to check for permission.
 * @param {Array<Action>} userPermission - The user's permissions.
 * @throws {Error} Throws an error if the user does not have permission for the specified action.
 */
  private userPermissionCheck(action: Action, userPermission: Array<Action>) {
    if (!userPermission.includes(action))
      throw new Error(STORE_ERRORS.ACCESS_DENID + ' ' + action)
  }

}
