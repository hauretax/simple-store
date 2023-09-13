export default class Store {
  public data: Record<string, any> = {};


  storeJSON(json: JSON) {
    this.deepMerge(this.data, json)
  }

  storeJSONString(jsonString: string) {
    this.storeJSON(JSON.parse(jsonString))
  }

  storeNestedKey(keyString: string, value: any): void {
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
    this.deepMerge(this.data, newObj)
  }

  retrieve(key: string): any {
    return this.data[key];
  }

  listEntries(): Record<string, any> {
    return { ...this.data };
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
}
