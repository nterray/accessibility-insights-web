// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as axe from 'axe-core';
import { GlobalMock, GlobalScope, IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { imageConfiguration } from '../../../../scanner/image-rule';

describe('imageRule', () => {
    describe('verify image rule configs', () => {
        it('should have correct props', () => {
            expect(imageConfiguration.rule.id).toBe('image-function');
            expect(imageConfiguration.rule.selector).toBe('*');
            expect(imageConfiguration.rule.any[0]).toBe('image-function-data-collector');
            expect(imageConfiguration.rule.all).toEqual([]);
            expect(imageConfiguration.rule.all.length).toBe(0);
            expect(imageConfiguration.rule.any.length).toBe(1);
            expect(imageConfiguration.checks[0].id).toBe('image-function-data-collector');
        });
    });

    describe('verify matches', () => {
        let fixture: HTMLElement;

        beforeEach(() => {
            fixture = document.createElement('div');
            fixture.setAttribute('id', 'test-fixture');
            document.body.appendChild(fixture);
        });

        afterEach(() => {
            document.body.querySelector('#test-fixture').remove();
        });

        it('should match img elements', () => {
            const node = document.createElement('img');
            expect(imageConfiguration.rule.matches(node, null)).toBeTruthy();
        });

        it('should match role=img elements', () => {
            const node = document.createElement('div');
            node.setAttribute('role', 'img');

            expect(imageConfiguration.rule.matches(node, null)).toBeTruthy();
        });

        it('should match svg elements', () => {
            const node = document.createElement('svg');
            expect(imageConfiguration.rule.matches(node, null)).toBeTruthy();
        });

        it('should match empty <i> elements', () => {
            const node = document.createElement('i');
            expect(imageConfiguration.rule.matches(node, null)).toBeTruthy();
        });

        it('should match css background image elements for non-empty <i> with background image', () => {
            const node = document.createElement('i');
            node.innerHTML = 'some text';
            node.style.backgroundImage = 'image';

            expect(imageConfiguration.rule.matches(node, null)).toBeTruthy();
        });

        it('should not match', () => {
            const windowMock = GlobalMock.ofInstance(window.getComputedStyle, 'getComputedStyle', window, MockBehavior.Strict);
            windowMock.setup(m => m(It.isAny())).returns(node => ({ getPropertyValue: property => 'none' } as CSSStyleDeclaration));
            let result;
            const node = document.createElement('div');
            GlobalScope.using(windowMock).with(() => {
                result = imageConfiguration.rule.matches(node, null);
            });
            expect(result).toBeFalsy();
        });
    });

    describe('verify evaluate', () => {
        let dataSetterMock: IMock<(data) => void>;
        let fixture: HTMLElement;
        let _axe;

        beforeEach(() => {
            dataSetterMock = Mock.ofInstance(data => {});
            fixture = createTestFixture('test-fixture', '');
            _axe = axe as any;
        });

        afterEach(() => {
            document.body.querySelector('#test-fixture').remove();
        });

        it('should always return true', () => {
            fixture.innerHTML = `
                <div id="el1" alt="hello"></div>
            `;
            const element1 = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);

            dataSetterMock.setup(d => d(It.isAny()));
            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, element1);
            expect(result).toBeTruthy();
        });

        it('should set accessibleName properly, coded as meaningful because no alt and with accessible name', () => {
            fixture.innerHTML = `
                <img id="el1" aria-labelledby="el3" />
                <div id="el3"> hello </div>
            `;
            const element1 = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);

            const expectedData = {
                imageType: '<img>',
                accessibleName: 'hello',
                codedAs: 'Meaningful',
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, element1);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should consider image is Decorative if it has role=none', () => {
            fixture.innerHTML = `
                <img id="el1"  role="none"/>
            `;
            const node = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);

            const expectedData = {
                imageType: '<img>',
                accessibleName: '',
                codedAs: 'Decorative',
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should consider image is Decorative if it has role=presentation', () => {
            fixture.innerHTML = `
                <img id="el1"  role="presentation"/>
            `;
            const node = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);
            const expectedData = {
                imageType: '<img>',
                accessibleName: '',
                codedAs: 'Decorative',
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should consider image is Decorative if it has alt=""', () => {
            fixture.innerHTML = `
                <img id="el1"  alt=""/>
            `;
            const node = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);
            const expectedData = {
                imageType: '<img>',
                accessibleName: '',
                codedAs: 'Decorative',
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('cannot tell if image is Decorative or Meaningful if it has no alt, no accessible name', () => {
            fixture.innerHTML = `
                <img id="el1"/>
            `;
            const node = fixture.querySelector('#el1');
            _axe._tree = _axe.utils.getFlattenedTree(document.documentElement);
            const expectedData = {
                imageType: '<img>',
                accessibleName: '',
                codedAs: null,
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should set imageType to Role=img for elements with img role', () => {
            const node = document.createElement('div');
            node.setAttribute('role', 'img');
            const expectedData = {
                imageType: 'Role="img"',
                accessibleName: '',
                codedAs: null,
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should set imageType to icon fonts (empty <i> elements) for empty <i>', () => {
            const node = document.createElement('i');
            const expectedData = {
                imageType: 'icon fonts (empty <i> elements)',
                accessibleName: '',
                codedAs: null,
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('should set imageType to CSS background-image for elements with img background', () => {
            const node = document.createElement('div');
            node.style.backgroundImage = 'imageUrl';
            const expectedData = {
                imageType: 'CSS background-image',
                accessibleName: '',
                codedAs: null,
            };
            dataSetterMock.setup(d => d(It.isValue(expectedData))).verifiable(Times.once());

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
            dataSetterMock.verifyAll();
        });

        it('imageType should be unknown for nodes that is not image', () => {
            const node = document.createElement('div');

            dataSetterMock.setup(d =>
                d(
                    It.is(propertyBag => {
                        return propertyBag.imageType == null;
                    }),
                ),
            );

            const result = imageConfiguration.checks[0].evaluate.call({ data: dataSetterMock.object }, node);
            expect(result).toBeTruthy();
        });
    });

    function createTestFixture(id: string, content: string): HTMLDivElement {
        const testFixture: HTMLDivElement = document.createElement('div');
        testFixture.setAttribute('id', id);
        document.body.appendChild(testFixture);
        testFixture.innerHTML = content;
        return testFixture;
    }
});
