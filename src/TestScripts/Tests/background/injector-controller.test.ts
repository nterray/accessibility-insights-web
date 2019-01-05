// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Q from 'q';
import { It, Mock, MockBehavior, Times } from 'typemoq';

import { InjectorController } from '../../../background/injector-controller';
import { ContentScriptInjector } from '../../../background/injector/content-script-injector';
import { InspectMode } from '../../../background/inspect-modes';
import { Interpreter } from '../../../background/interpreter';
import { InspectStore } from '../../../background/stores/inspect-store';
import { TabStore } from '../../../background/stores/tab-store';
import { VisualizationStore } from '../../../background/stores/visualization-store';
import { Messages } from '../../../common/messages';
import { IVisualizationStoreData } from '../../../common/types/store-data/ivisualization-store-data';
import { WindowUtils } from '../../../common/window-utils';
import { VisualizationStoreDataBuilder } from '../../Common/visualization-store-data-builder';

describe('InjectorControllerTest', () => {
    let validator: InjectorControllerValidator;
    const tabId = 1;

    beforeEach(() => {
        validator = new InjectorControllerValidator();
    });

    test('initialize: inject occurs', async done => {
        const visualizationData = new VisualizationStoreDataBuilder().with('injectingInProgress', true).build();

        validator
            .setupTabStore({ id: tabId })
            .setupVizStoreGetState(visualizationData)
            .setupInspectStore({ inspectMode: InspectMode.off })
            .setupInjectScriptsCall(tabId, 2)
            .setupTimeoutHandler(2);

        validator.buildInjectorController().initialize();
        validator.verifyAll();

        validator.resetVerify();
        validator.setupVerifyInjectionStartedActionCalled(tabId, 2);
        validator.invokeWindowTimeoutHandler();
        validator.invokeWindowTimeoutHandler();
        validator.verifyAll();

        validator.resetVerify();
        validator.setupVerifyInjectionCompletedActionCalled(tabId, 2);
        validator.invokeInjectedPromise().then(() => {
            validator.verifyAll();
            done();
        });
    });

    test('inject occurs when inspect mode changes', async done => {
        const visualizationData = new VisualizationStoreDataBuilder().build();

        validator
            .setupTabStore({ id: tabId })
            .setupVizStoreGetState(visualizationData)
            .setupInspectStore({ inspectMode: InspectMode.scopingAddInclude })
            .setupInjectScriptsCall(tabId, 1)
            .setupTimeoutHandler(1);

        validator.buildInjectorController().initialize();
        validator.verifyAll();

        validator.resetVerify();
        validator.setupVerifyInjectionStartedActionCalled(tabId);
        validator.invokeWindowTimeoutHandler();
        validator.verifyAll();

        validator.resetVerify();
        validator.setupVerifyInjectionCompletedActionCalled(tabId);
        validator.invokeInjectedPromise().then(() => {
            validator.verifyAll();
            done();
        });
    });

    test("inject doesn't occur when inspect mode changed to off", async done => {
        const visualizationData = new VisualizationStoreDataBuilder().with('injectingInProgress', false).build();

        validator
            .setupTabStore({ id: tabId })
            .setupVizStoreGetState(visualizationData)
            .setupInspectStore({ inspectMode: InspectMode.scopingAddInclude })
            .setupVerifyInjectionCompletedActionCalled(tabId)
            .setupInjectScriptsCall(tabId, 1)
            .setupTimeoutHandler(2);

        validator.buildInjectorController().initialize();
        validator.resetVerify();
        validator.setupVerifyInjectionStartedActionCalled(tabId);
        validator.invokeWindowTimeoutHandler();
        validator.verifyAll();

        validator.resetVerify();
        validator.invokeInjectedPromise().then(() => {
            validator.verifyAll();
            done();
        });
    });

    test('initialize: already injecting => no inject', () => {
        const visualizationData = new VisualizationStoreDataBuilder()
            .with('injectingInProgress', true)
            .with('injectingStarted', true)
            .build();

        validator
            .setupTabStore({ id: 1 })
            .setupInspectStore({ inspectMode: InspectMode.off })
            .setupVizStoreGetState(visualizationData);

        validator.buildInjectorController().initialize();

        validator.verifyAll();
    });

    test('initialize: injectingInProgress is false => no inject', () => {
        const visualizationData = new VisualizationStoreDataBuilder()
            .with('injectingInProgress', false)
            .with('injectingStarted', true)
            .build();

        validator
            .setupTabStore({ id: 1 })
            .setupInspectStore({ inspectMode: InspectMode.off })
            .setupVizStoreGetState(visualizationData);

        validator.buildInjectorController().initialize();
        validator.verifyAll();
    });
});

class InjectorControllerValidator {
    private mockInjector = Mock.ofType(ContentScriptInjector, MockBehavior.Strict);
    private mockVisualizationStore = Mock.ofType(VisualizationStore, MockBehavior.Strict);
    private mockInterpreter = Mock.ofType(Interpreter, MockBehavior.Strict);
    private mockInspectStore = Mock.ofType(InspectStore, MockBehavior.Strict);
    private mockTabStore = Mock.ofType(TabStore, MockBehavior.Strict);
    private injectedScriptsDeferred = Q.defer<void>();

    private mockWindowUtils = Mock.ofType(WindowUtils, MockBehavior.Strict);
    private setTimeoutHandler: Function;

    public buildInjectorController(): InjectorController {
        this.mockVisualizationStore
            .setup(mockVizStore =>
                mockVizStore.addChangedListener(
                    It.is(param => {
                        return typeof param === 'function';
                    }),
                ),
            )
            .callback(inject => {
                inject();
            })
            .verifiable();

        this.mockInspectStore
            .setup(inspectStore =>
                inspectStore.addChangedListener(
                    It.is(param => {
                        return typeof param === 'function';
                    }),
                ),
            )
            .callback(inject => {
                inject();
            })
            .verifiable();

        return new InjectorController(
            this.mockInjector.object,
            this.mockVisualizationStore.object,
            this.mockInterpreter.object,
            this.mockTabStore.object,
            this.mockInspectStore.object,
            this.mockWindowUtils.object,
        );
    }

    public setupTimeoutHandler(times: number) {
        this.mockWindowUtils
            .setup(x => x.setTimeout(It.isAny(), It.isAnyNumber()))
            .callback(handler => {
                this.setTimeoutHandler = handler;
            })
            .verifiable(Times.exactly(times));

        return this;
    }

    public setupVerifyInjectionStartedActionCalled(tabId: number, numTimes: number = 1) {
        this.mockInterpreter
            .setup(x => x.interpret(It.isObjectWith({ type: Messages.Visualizations.State.InjectionStarted, tabId: tabId })))
            .verifiable(Times.exactly(numTimes));

        return this;
    }

    public setupVerifyInjectionCompletedActionCalled(tabId: number, numTimes: number = 1) {
        this.mockInterpreter
            .setup(x => x.interpret(It.isObjectWith({ type: Messages.Visualizations.State.InjectionCompleted, tabId: tabId })))
            .verifiable(Times.exactly(numTimes));

        return this;
    }

    public invokeWindowTimeoutHandler() {
        this.setTimeoutHandler();
    }

    public setupInspectStore(returnState): InjectorControllerValidator {
        this.mockInspectStore
            .setup(inspectStore => inspectStore.getState())
            .returns(() => {
                return returnState;
            })
            .verifiable(Times.atLeastOnce());

        return this;
    }

    public setupTabStore(returnState): InjectorControllerValidator {
        this.mockTabStore
            .setup(tabStore => tabStore.getState())
            .returns(() => {
                return returnState;
            })
            .verifiable(Times.atLeastOnce());

        return this;
    }

    public setupVizStoreGetState(returnState: IVisualizationStoreData): InjectorControllerValidator {
        this.mockVisualizationStore
            .setup(mockVisualizationStore => mockVisualizationStore.getState())
            .returns(() => {
                return returnState;
            })
            .verifiable(Times.atLeastOnce());

        return this;
    }

    public setupInjectScriptsCall(calledWithTabId: number, numTimes: number): InjectorControllerValidator {
        this.mockInjector
            .setup(injector => injector.injectScripts(calledWithTabId))
            .returns(tabId => {
                return this.injectedScriptsDeferred.promise as any;
            })
            .verifiable(Times.exactly(numTimes));

        return this;
    }

    public invokeInjectedPromise(): Q.Promise<void> {
        this.injectedScriptsDeferred.resolve();
        return this.injectedScriptsDeferred.promise;
    }

    public verifyAll(): void {
        this.mockVisualizationStore.verifyAll();
        this.mockInspectStore.verifyAll();
        this.mockTabStore.verifyAll();
        this.mockInjector.verifyAll();
        this.mockInterpreter.verifyAll();
        this.mockWindowUtils.verifyAll();
    }

    public resetVerify(): void {
        this.mockVisualizationStore.reset();
        this.mockInspectStore.reset();
        this.mockTabStore.reset();
        this.mockInjector.reset();
        this.mockInterpreter.reset();
        this.mockWindowUtils.reset();
    }
}