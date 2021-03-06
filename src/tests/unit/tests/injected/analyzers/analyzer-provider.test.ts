// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, Mock } from 'typemoq';

import { ScopingStore } from '../../../../../background/stores/global/scoping-store';
import { VisualizationConfigurationFactory } from '../../../../../common/configs/visualization-configuration-factory';
import { TelemetryDataFactory } from '../../../../../common/telemetry-data-factory';
import { VisualizationType } from '../../../../../common/types/visualization-type';
import { WindowUtils } from '../../../../../common/window-utils';
import { AnalyzerProvider } from '../../../../../injected/analyzers/analyzer-provider';
import { BaseAnalyzer } from '../../../../../injected/analyzers/base-analyzer';
import { BatchedRuleAnalyzer, IResultRuleFilter } from '../../../../../injected/analyzers/batched-rule-analyzer';
import {
    IAnalyzerConfiguration,
    IFocusAnalyzerConfiguration,
    RuleAnalyzerConfiguration,
} from '../../../../../injected/analyzers/ianalyzer';
import { RuleAnalyzer } from '../../../../../injected/analyzers/rule-analyzer';
import { ScannerUtils } from '../../../../../injected/scanner-utils';
import { TabStopsListener } from '../../../../../injected/tab-stops-listener';

describe('AnalyzerProviderTests', () => {
    let tabStopsListener: IMock<TabStopsListener>;
    let scopingStoreMock: IMock<ScopingStore>;
    let telemetryFactoryMock: IMock<TelemetryDataFactory>;
    let sendMessageMock: IMock<(message) => void>;
    let testObject: AnalyzerProvider;
    let scannerMock: IMock<ScannerUtils>;
    let dateGetterMock: IMock<() => Date>;
    let visualizationConfigurationFactoryMock: IMock<VisualizationConfigurationFactory>;
    let typeStub: VisualizationType;
    let keyStub: string;
    let analyzerMessageTypeStub: string;
    let filterResultsByRulesMock: IMock<IResultRuleFilter>;

    beforeEach(() => {
        typeStub = -1;
        keyStub = 'test key';
        analyzerMessageTypeStub = 'analyzer message stub';

        sendMessageMock = Mock.ofInstance(message => {});
        dateGetterMock = Mock.ofInstance(() => null);
        tabStopsListener = Mock.ofType(TabStopsListener);
        scopingStoreMock = Mock.ofType(ScopingStore);
        telemetryFactoryMock = Mock.ofType(TelemetryDataFactory);
        scannerMock = Mock.ofType(ScannerUtils);
        visualizationConfigurationFactoryMock = Mock.ofType(VisualizationConfigurationFactory);
        filterResultsByRulesMock = Mock.ofInstance(() => null);
        testObject = new AnalyzerProvider(
            tabStopsListener.object,
            scopingStoreMock.object,
            sendMessageMock.object,
            scannerMock.object,
            telemetryFactoryMock.object,
            dateGetterMock.object,
            visualizationConfigurationFactoryMock.object,
            filterResultsByRulesMock.object,
        );
    });

    test('createRuleAnalyzer', () => {
        const config: RuleAnalyzerConfiguration = {
            testType: typeStub,
            analyzerMessageType: analyzerMessageTypeStub,
            key: keyStub,
            rules: ['test rule'],
            resultProcessor: null,
            telemetryProcessor: null,
        };
        const analyzer = testObject.createRuleAnalyzer(config);
        expect(analyzer).toBeInstanceOf(RuleAnalyzer);
        validateRuleAnalyzer(analyzer, config);
    });

    test('createBatchedRuleAnalyzer', () => {
        const config: RuleAnalyzerConfiguration = {
            testType: typeStub,
            analyzerMessageType: analyzerMessageTypeStub,
            key: keyStub,
            rules: ['test rule'],
            resultProcessor: null,
            telemetryProcessor: null,
        };
        const analyzer = testObject.createBatchedRuleAnalyzer(config);
        const openAnalyzer = analyzer as any;
        expect(analyzer).toBeInstanceOf(BatchedRuleAnalyzer);
        validateRuleAnalyzer(analyzer, config);
        expect(openAnalyzer.postScanFilter).toEqual(filterResultsByRulesMock.object);
    });

    test('createFocusTrackingAnalyzer', () => {
        const config: IFocusAnalyzerConfiguration = {
            testType: typeStub,
            analyzerMessageType: analyzerMessageTypeStub,
            key: keyStub,
            analyzerProgressMessageType: 'analyzer progress message',
            analyzerTerminatedMessageType: 'analyzer terminated message',
        };

        const analyzer = testObject.createFocusTrackingAnalyzer(config);
        const openAnalyzer = analyzer as any;
        expect(analyzer).toBeInstanceOf(BaseAnalyzer);
        expect(openAnalyzer._windowUtils).toBeInstanceOf(WindowUtils);
        expect(openAnalyzer.tabStopsListener).toEqual(tabStopsListener.object);
        expect(openAnalyzer.config).toEqual(config);
        expect(openAnalyzer.sendMessage).toEqual(sendMessageMock.object);
    });

    test('createBaseAnalyzer', () => {
        const config: IAnalyzerConfiguration = {
            testType: typeStub,
            analyzerMessageType: analyzerMessageTypeStub,
            key: keyStub,
        };

        const analyzer = testObject.createBaseAnalyzer(config);
        const openAnalyzer = analyzer as any;
        expect(analyzer).toBeInstanceOf(BaseAnalyzer);
        expect(openAnalyzer.config).toEqual(config);
        expect(openAnalyzer.sendMessage).toEqual(sendMessageMock.object);
    });

    function validateRuleAnalyzer(openAnalyzer, config): void {
        expect(openAnalyzer.scanner).toEqual(scannerMock.object);
        expect(openAnalyzer.scopingStore).toEqual(scopingStoreMock.object);
        expect(openAnalyzer.dateGetter).toEqual(dateGetterMock.object);
        expect(openAnalyzer.telemetryFactory).toEqual(telemetryFactoryMock.object);
        expect(openAnalyzer.config).toEqual(config);
        expect(openAnalyzer.sendMessage).toEqual(sendMessageMock.object);
    }
});
