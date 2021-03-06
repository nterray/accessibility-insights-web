// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IAssessmentVisualizationInstance } from '../frameCommunicators/html-element-axe-results-helper';
import { FailureInstanceFormatter } from './failure-instance-formatter';
import { DrawerConfiguration } from './formatter';

export interface FrameStyleConfiguration {
    borderColor: string;
    fontColor: string;
    contentText: string;
}

export class FrameFormatter extends FailureInstanceFormatter {
    public static frameStyles: { [frameType: string]: FrameStyleConfiguration } = {
        frame: {
            borderColor: '#0066CC',
            fontColor: '#FFFFFF',
            contentText: 'F',
        },
        iframe: {
            borderColor: '#00CC00',
            fontColor: '#FFFFFF',
            contentText: 'I',
        },
        default: {
            borderColor: '#C00000',
            fontColor: '#FFFFFF',
            contentText: '',
        },
    };

    public getDialogRenderer() {
        return null;
    }

    public getDrawerConfiguration(element: HTMLElement, data: IAssessmentVisualizationInstance): DrawerConfiguration {
        const frameType = element.tagName.toLowerCase();
        const style = FrameFormatter.frameStyles[frameType] || FrameFormatter.frameStyles.default;

        const drawerConfig: DrawerConfiguration = {
            textBoxConfig: {
                fontColor: style.fontColor,
                text: style.contentText,
                background: style.borderColor,
            },
            borderColor: style.borderColor,
            outlineStyle: 'solid',
            showVisualization: true,
            textAlign: 'center',
        };

        drawerConfig.showVisualization = true;

        drawerConfig.failureBoxConfig = this.getFailureBoxConfig(data);

        return drawerConfig;
    }
}
