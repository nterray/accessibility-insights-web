// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';

import { VisualizationConfigurationFactory } from '../../common/configs/visualization-configuration-factory';
import { NamedSFC } from '../../common/react/named-sfc';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { IAssessmentStoreData } from '../../common/types/store-data/iassessment-result-data';
import { ITabStoreData } from '../../common/types/store-data/itab-store-data';
import { IVisualizationScanResultData } from '../../common/types/store-data/ivisualization-scan-result-data';
import { IVisualizationStoreData } from '../../common/types/store-data/ivisualization-store-data';
import { VisualizationType } from '../../common/types/visualization-type';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { AssessmentInstanceTableHandler } from '../handlers/assessment-instance-table-handler';
import { DetailsViewToggleClickHandlerFactory } from '../handlers/details-view-toggle-click-handler-factory';
import { ReportGenerator } from '../reports/report-generator';
import { IssuesTableHandler } from './issues-table-handler';
import { OverviewContainerDeps } from './overview-content/overview-content-container';
import { TestViewDeps } from './test-view';

export type TestViewContainerDeps = {
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
} & TestViewDeps &
    OverviewContainerDeps;

export interface TestViewContainerProps {
    deps: TestViewContainerDeps;
    tabStoreData: ITabStoreData;
    assessmentStoreData: IAssessmentStoreData;
    featureFlagStoreData: FeatureFlagStoreData;
    selectedTest: VisualizationType;
    visualizationStoreData: IVisualizationStoreData;
    visualizationScanResultData: IVisualizationScanResultData;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    clickHandlerFactory: DetailsViewToggleClickHandlerFactory;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    issuesSelection: ISelection;
    reportGenerator: ReportGenerator;
    issuesTableHandler: IssuesTableHandler;
    issueTrackerPath: string;
}

export const TestViewContainer = NamedSFC<TestViewContainerProps>('TestViewContainer', props => {
    const configuration = props.visualizationConfigurationFactory.getConfiguration(props.selectedTest);
    const testViewProps = { configuration, ...props };
    return configuration.getTestView(testViewProps);
});
