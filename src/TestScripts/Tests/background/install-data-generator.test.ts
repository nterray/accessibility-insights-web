// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { ChromeAdapter } from '../../../background/browser-adapter';
import { InstallDataGenerator } from '../../../background/install-data-generator';
import { IInstallationData } from '../../../background/installation-data';
import { LocalStorageDataKeys } from '../../../background/local-storage-data-keys';
import { generateUID } from '../../../common/uid-generator';

let generateGuidMock: IMock<() => string>;
let dateGetterMock: IMock<() => Date>;
let browserAdapterMock: IMock<ChromeAdapter>;
let dateStubMock: IMock<Date>;

describe('InstallDataGeneratorTest', () => {
    beforeEach(() => {
        const dateStub = {
            getUTCFullYear: () => {
                return null;
            },
            getUTCMonth: () => {
                return null;
            },
        };

        generateGuidMock = Mock.ofInstance(generateUID, MockBehavior.Strict);
        dateGetterMock = Mock.ofInstance<() => Date>(() => {
            return null;
        }, MockBehavior.Strict);
        browserAdapterMock = Mock.ofType(ChromeAdapter, MockBehavior.Strict);
        dateStubMock = Mock.ofInstance(dateStub as Date);
    });

    test('getInstallationId: initialInstallationData is null', () => {
        const initialInstallationData = null;
        const guidStub = 'somestub';
        const monthStub = 5;
        const yearStub = 22;
        const installationDataStub: IInstallationData = {
            id: guidStub,
            month: monthStub,
            year: yearStub,
        };

        const testSubject = new InstallDataGenerator(
            initialInstallationData,
            generateGuidMock.object,
            dateGetterMock.object,
            browserAdapterMock.object,
        );

        dateStubMock
            .setup(ds => ds.getUTCMonth())
            .returns(() => monthStub)
            .verifiable();

        dateStubMock
            .setup(ds => ds.getUTCFullYear())
            .returns(() => yearStub)
            .verifiable();

        dateGetterMock
            .setup(dgm => dgm())
            .returns(() => dateStubMock.object)
            .verifiable();

        generateGuidMock
            .setup(ggm => ggm())
            .returns(() => guidStub)
            .verifiable();

        browserAdapterMock
            .setup(bam => bam.setUserData(It.isValue({ [LocalStorageDataKeys.installationData]: installationDataStub })))
            .verifiable();

        expect(testSubject.getInstallationId()).toEqual(guidStub);
        verifyMocks();
    });

    test('getInstallationId: initialInstallationData is from same month different year', () => {
        const guidStub = 'somestub';
        const monthStub = 5;
        const yearStub = 2000;

        const installationDataStub: IInstallationData = {
            id: guidStub,
            month: monthStub,
            year: yearStub,
        };
        const initialInstallationData: IInstallationData = {
            id: guidStub,
            month: monthStub,
            year: 1999,
        };

        const testSubject = new InstallDataGenerator(
            initialInstallationData,
            generateGuidMock.object,
            dateGetterMock.object,
            browserAdapterMock.object,
        );

        dateStubMock
            .setup(ds => ds.getUTCMonth())
            .returns(() => monthStub)
            .verifiable(Times.exactly(2));

        dateStubMock
            .setup(ds => ds.getUTCFullYear())
            .returns(() => yearStub)
            .verifiable(Times.exactly(2));

        dateGetterMock
            .setup(dgm => dgm())
            .returns(() => dateStubMock.object)
            .verifiable();

        generateGuidMock
            .setup(ggm => ggm())
            .returns(() => guidStub)
            .verifiable();

        browserAdapterMock
            .setup(bam => bam.setUserData(It.isValue({ [LocalStorageDataKeys.installationData]: installationDataStub })))
            .verifiable();

        expect(testSubject.getInstallationId()).toEqual(guidStub);
        verifyMocks();
    });

    test('getInstallationId: initialInstallationData is from same year different month', () => {
        const guidStub = 'somestub';
        const monthStub = 5;
        const yearStub = 2000;

        const installationDataStub: IInstallationData = {
            id: guidStub,
            month: monthStub,
            year: yearStub,
        };
        const initialInstallationData: IInstallationData = {
            id: guidStub,
            month: 4,
            year: yearStub,
        };

        const testSubject = new InstallDataGenerator(
            initialInstallationData,
            generateGuidMock.object,
            dateGetterMock.object,
            browserAdapterMock.object,
        );

        dateStubMock
            .setup(ds => ds.getUTCMonth())
            .returns(() => monthStub)
            .verifiable(Times.exactly(2));

        dateStubMock
            .setup(ds => ds.getUTCFullYear())
            .returns(() => yearStub)
            .verifiable(Times.exactly(2));

        dateGetterMock
            .setup(dgm => dgm())
            .returns(() => dateStubMock.object)
            .verifiable();

        generateGuidMock
            .setup(ggm => ggm())
            .returns(() => guidStub)
            .verifiable();

        browserAdapterMock
            .setup(bam => bam.setUserData(It.isValue({ [LocalStorageDataKeys.installationData]: installationDataStub })))
            .verifiable();

        expect(testSubject.getInstallationId()).toEqual(guidStub);
        verifyMocks();
    });

    test('getInstallationId: initialInstallationData is valid/same month and year', () => {
        const monthStub = 3;
        const yearStub = 2222;
        const guidStub = 'someId';
        const initialInstallationData = {
            id: guidStub,
            month: monthStub,
            year: yearStub,
        };

        const testSubject = new InstallDataGenerator(
            initialInstallationData,
            generateGuidMock.object,
            dateGetterMock.object,
            browserAdapterMock.object,
        );

        dateStubMock
            .setup(ds => ds.getUTCMonth())
            .returns(() => monthStub)
            .verifiable();

        dateStubMock
            .setup(ds => ds.getUTCFullYear())
            .returns(() => yearStub)
            .verifiable();

        dateGetterMock
            .setup(dgm => dgm())
            .returns(() => dateStubMock.object as Date)
            .verifiable();

        generateGuidMock
            .setup(ggm => ggm())
            .returns(() => guidStub)
            .verifiable(Times.never());

        browserAdapterMock
            .setup(bam => bam.setUserData(It.isAny()))
            .verifiable(Times.never());

        expect(testSubject.getInstallationId()).toEqual(guidStub);
        verifyMocks();
    });
});

function verifyMocks(): void {
    browserAdapterMock.verifyAll();
    dateGetterMock.verifyAll();
    generateGuidMock.verifyAll();
    dateStubMock.verifyAll();
}