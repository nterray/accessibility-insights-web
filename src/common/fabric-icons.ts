// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { registerIcons } from '@uifabric/styling/lib/index';

export function initializeFabricIcons() {
    registerIcons({
        style: {
            MozOsxFontSmoothing: 'grayscale',
            WebkitFontSmoothing: 'antialiased',
            fontStyle: 'normal',
            fontWeight: 'normal',
            speak: 'none',
        },
        fontFace: {
            fontFamily: 'FabricMDL2Icons',
        },
        icons: {
            add: '\uE710',
            back: '\uE72B',
            calculatorAddition: '\uE948',
            cancel: '\uE711',
            checkBox: '\uE739',
            checkMark: '\uE73E',
            chevronDown: '\uE70D',
            chevronRight: '\uE76C',
            chevronUp: '\uE70E',
            chromeClose: '\uE8BB',
            circleRing: '\uEA3A',
            completedSolid: '\uEC61',
            copy: '\uE8C8',
            contactCard: '\uEEBD',
            delete: '\uE74D',
            edit: '\uE70F',
            export: '\uEDE1',
            feedback: '\uED15',
            fileHTML: '\uF2ED',
            gear: '\uE713',
            giftboxOpen: '\uF133',
            globalNavButton: '\uE700',
            hide2: '\uEF89',
            home: '\uE80F',
            incidentTriangle: '\uE814',
            info: '\uE946',
            ladybugSolid: '\uF44A',
            mail: '\uE715',
            medical: '\uEAD4',
            play: '\uE768',
            refresh: '\uE72C',
            rocket: '\uF3B3',
            scopeTemplate: '\uF2B0',
            search: '\uE721',
            send: '\uE724',
            skypeCheck: '\uEF80',
            statusCircleCheckMark: '\uF13E',
            statusErrorFull: '\uEB90',
            tag: '\uE8EC',
            testBeaker: '\uF3A5',
            testBeakerSolid: '\uF3A6',
            undo: '\uE7A7',
            unknown: '\uE9CE',
            view: '\uE890',
        },
    });
}