import {getValidatorRegistry} from "@tvenceslau/decorator-validation/lib/validation";

describe(`Type Script Workspace test`, function(){
    it(`runs hello world`, function(){
        getValidatorRegistry()
        expect(getValidatorRegistry()).toBeDefined()
    });
});