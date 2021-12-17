import {maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib/validation";
import {uielement, uimodel, UIModel} from "../src";
import {
    constructFromObject,
    getClassDecorators,
    getPropertyDecorators, model,
    Model,
    ModelKeys
} from "@tvenceslau/decorator-validation/lib";
import {UIKeys} from "../src/ui/constants";

@model()
@uimodel()
// @ts-ignore
class TestClass extends Model implements UIModel {

    @required()
    @minlength(5)
    @maxlength(15)
    @uielement('input-element', {subtype: "OtherTest"})
    // @ts-ignore
    name?: string;

    constructor(model?: TestClass | {}){
        super()
        constructFromObject(this, model);
    }

    render(...args: any): any {
        console.log(`this method will be replaced by the uimodel decorator`);
    }

}

describe(`UI decorators Test`, function(){

    let testModel: TestClass;

    beforeEach(() => {
        testModel = new TestClass({
            name: "test"
        });
    })

    it('Decorates The class properly', function() {

        let decorators: any[] = getClassDecorators(ModelKeys.REFLECT, testModel);

        expect(decorators).toBeDefined();
        expect(decorators.length).toBe(1);
        expect(decorators[0].key).toEqual(ModelKeys.MODEL);

        decorators = getClassDecorators(UIKeys.REFLECT, testModel);
        expect(decorators).toBeDefined();
        expect(decorators.length).toBe(1);
        expect(decorators[0].key).toEqual(UIKeys.UIMODEL);
    })

    it('Decorates the properties properly', function() {

        const propertyDecorators: {[indexer: string]: any} = getPropertyDecorators(UIKeys.REFLECT, testModel, "name", false);

        expect(propertyDecorators).toBeDefined();
        expect(propertyDecorators.decorators.length).toEqual(2);
        expect(propertyDecorators.decorators[1].key).toEqual(UIKeys.ELEMENT);

        const {tag, props} = propertyDecorators.decorators[1].props;

        expect(tag).toEqual("input-element");
        expect(props).toBeDefined();
        expect(props.subtype).toEqual("OtherTest");
    })

    it('Adds the render method properly', function() {
        expect (testModel.render).toBeDefined();
        expect(() => {
            testModel.render();
        }).toThrowError()
    })
});