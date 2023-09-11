export default class Store {
    public data: Record<string, any> = {};


    storeJson(json: string){

    }

    storeNestedKey(keyString: string, value: any): void {
      if(!keyString)
        return;
      const keyTab = keyString.split('.')
      keyTab.reduce((objet, keyEl, i) => {
        //last element push data
        if (i === keyTab.length - 1) return (objet[keyEl] = value);
        //nestings already existe
        if (objet[keyEl]) return (objet[keyEl]);
        return (objet[keyEl] = {});
      }, this.data);
    }
  
    retrieve(key: string): any {
      return this.data[key];
    }
  
    listEntries(): Record<string, any> {
      return { ...this.data };
    }


    private setNestedData(data: Record<string, any>, key:string,value: any):void {

    }
  }
  