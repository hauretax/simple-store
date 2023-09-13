export default class Store {
  private store: Record<string, any> = {};

  storeObject(object: object) {
    if (!this.isSerializable(object))
      throw new Error('Value is not serializable');
    this.deepMerge(this.store, object)
  }
  storeJSON(json: JSON) {
    this.deepMerge(this.store, json)
  }
  storeJSONString(jsonString: string) {
    this.storeJSON(JSON.parse(jsonString))
  }

  storeNestedKey(keyString: string, value: any): void {
    if (!this.isSerializable(value))
      throw new Error('Value is not serializable');

    if (!keyString)
      return;
    //create keyTab from keyString
    const keyTab = keyString.split('.')
    //create new object and deep merge it
    let newObj = {}
    keyTab.reduce((tmpObj, key, i) => {
      if (i === keyTab.length - 1) return tmpObj[key] = value
      return (tmpObj[key] = {});
    }, newObj);
    this.deepMerge(this.store, newObj)
  }

  retrieve(keyString: string): any {
    if (keyString === '')
      return this.store
    //create keyTab from keyString
    const keyTab = keyString.split('.')
    //find value in store
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

  listEntries() {
    const entries = {};

    function recurse(obj: object, currentKey: string) {
      for (const key in obj) {
        //recursivity end
        if (!obj.hasOwnProperty(key)) return;
        //setup object pushed in array
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
   * merges two objects, incorporating obj2's properties into obj1.
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

  private isSerializable(value: any) {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }



}
