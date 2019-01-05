// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { cloneDeep } from 'lodash';
import { IMock, It, Mock, Times } from 'typemoq';

import { SetTelemetryStatePayload } from '../../../../../background/actions/action-payloads';
import { UserConfigurationActions } from '../../../../../background/actions/user-configuration-actions';
import { IndexedDBDataKeys } from '../../../../../background/IndexedDBDataKeys';
import { UserConfigurationStore } from '../../../../../background/stores/global/user-configuration-store';
import { IndexedDBAPI } from '../../../../../common/indexedDB/indexedDB';
import { StoreNames } from '../../../../../common/stores/store-names';
import { UserConfigurationStoreData } from '../../../../../common/types/store-data/user-configuration-store';
import { StoreTester } from '../../../../Common/store-tester';

describe('UserConfigurationStoreTest', () => {
    let initialStoreData: UserConfigurationStoreData;
    let defaultStoreData: UserConfigurationStoreData;
    let indexDbStrictMock: IMock<IndexedDBAPI>;

    beforeEach(() => {
        initialStoreData = { enableTelemetry: true, isFirstTime: false };
        defaultStoreData = { enableTelemetry: false, isFirstTime: true };
        indexDbStrictMock = Mock.ofType<IndexedDBAPI>();
    });

    test('verify state before initialize', () => {
        const testSubject = new UserConfigurationStore(initialStoreData, new UserConfigurationActions(), indexDbStrictMock.object);

        expect(testSubject.getState()).toBeUndefined();

    });

    test('verify initial state when null', () => {
        const testSubject = new UserConfigurationStore(null, new UserConfigurationActions(), indexDbStrictMock.object);

        testSubject.initialize();

        expect(testSubject.getState()).toEqual(defaultStoreData);
    });

    test('verify initial state when not null', () => {
        const testSubject = new UserConfigurationStore(
            cloneDeep(initialStoreData),
            new UserConfigurationActions(),
            indexDbStrictMock.object);

        testSubject.initialize();

        expect(testSubject.getState()).toEqual(initialStoreData);
    });

    test('getDefaultState returns cloned data when initial state is not null', () => {
        const testSubject = new UserConfigurationStore(
            cloneDeep(initialStoreData),
            new UserConfigurationActions(),
            indexDbStrictMock.object,
        );

        const firstCallDefaultState = testSubject.getDefaultState();
        expect(firstCallDefaultState).toEqual(initialStoreData);

        firstCallDefaultState.enableTelemetry = !firstCallDefaultState.enableTelemetry;

        expect(testSubject.getDefaultState()).toEqual(initialStoreData);
    });

    test('getDefaultState returns cloned data when initial state is null', () => {
        const testSubject = new UserConfigurationStore(null, new UserConfigurationActions(), indexDbStrictMock.object);

        const firstCallDefaultState = testSubject.getDefaultState();
        expect(firstCallDefaultState).toEqual(defaultStoreData);

        firstCallDefaultState.enableTelemetry = !firstCallDefaultState.enableTelemetry;

        expect(testSubject.getDefaultState()).toEqual(defaultStoreData);
    });

    test('verify store id', () => {
        const testSubject = new UserConfigurationStore(initialStoreData, new UserConfigurationActions(), indexDbStrictMock.object);

        expect(testSubject.getId()).toBe(StoreNames[StoreNames.UserConfigurationStore]);
    });

    test('getCurrentState action', () => {
        const storeTester = createStoreToTestAction('getCurrentState');

        storeTester.testListenerToBeCalledOnce(initialStoreData, cloneDeep(initialStoreData));
    });

    interface SetUserConfigTestCase {
        isFirstTime: boolean;
        enableTelemetry: boolean;
    }
    test.each([
        { enableTelemetry: true, isFirstTime: true } as SetUserConfigTestCase,
        { enableTelemetry: true, isFirstTime: false } as SetUserConfigTestCase,
        { enableTelemetry: false, isFirstTime: false } as SetUserConfigTestCase,
        { enableTelemetry: false, isFirstTime: true } as SetUserConfigTestCase,
    ])('setUserConfiguration action', (testCase: SetUserConfigTestCase) => {
        const storeTester = createStoreToTestAction('setTelemetryState');
        initialStoreData = {
            enableTelemetry: testCase.enableTelemetry,
            isFirstTime: testCase.isFirstTime,
        };
        const setTelemetryStateData: SetTelemetryStatePayload = {
            enableTelemetry: testCase.enableTelemetry,
        };

        const expectedState: UserConfigurationStoreData = {
            enableTelemetry: testCase.enableTelemetry,
            isFirstTime: false,
        };

        indexDbStrictMock
            .setup(i => i.setItem(IndexedDBDataKeys.userConfiguration, It.isValue(expectedState)))
            .verifiable(Times.once());

        storeTester
            .withActionParam(setTelemetryStateData)
            .withPostListenerMock(indexDbStrictMock)
            .testListenerToBeCalledOnce(cloneDeep(initialStoreData), expectedState);
    });

    function createStoreToTestAction(actionName: keyof UserConfigurationActions) {
        const factory = (actions: UserConfigurationActions) =>
            new UserConfigurationStore(initialStoreData, actions, indexDbStrictMock.object);

        return new StoreTester(UserConfigurationActions, actionName, factory);
    }
});