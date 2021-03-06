// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Browser } from '../../common/browser';
import { launchBrowser } from '../../common/browser-factory';
import { CommonSelectors } from '../../common/element-identifiers/common-selectors';
import { Page } from '../../common/page';
import { scanForAccessibilityIssues } from '../../common/scan-for-accessibility-issues';

describe('Settings Dropdown', () => {
    let browser: Browser;
    let targetTabId: number;

    beforeAll(async () => {
        browser = await launchBrowser({ suppressFirstTimeDialog: true });
    });

    beforeEach(async () => {
        const targetPage = await browser.newTestResourcePage('all.html');
        await targetPage.bringToFront();
        targetTabId = await browser.getActivePageTabId();
    });

    afterEach(async () => {
        if (browser) {
            await browser.closeAllPages();
        }
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
            browser = undefined;
        }
    });

    it('content should match snapshot', async () => {
        const popupPage = await browser.newExtensionPopupPage(targetTabId);
        const popupDropdownElement = await getDropdownPanelElement(popupPage);

        const detailsViewPage = await browser.newExtensionDetailsViewPage(targetTabId);
        const detailsViewDropdownElement = await getDropdownPanelElement(detailsViewPage);

        expect(popupDropdownElement).toEqual(detailsViewDropdownElement);
        expect(popupDropdownElement).toMatchSnapshot();
    });

    it('should pass accessibility validation', async () => {
        const popupPage = await browser.newExtensionPopupPage(targetTabId);
        await popupPage.clickSelector(CommonSelectors.settingsGearButton);

        const results = await scanForAccessibilityIssues(popupPage, CommonSelectors.settingsDropdownMenu);
        expect(results).toHaveLength(0);
    });

    async function getDropdownPanelElement(page: Page): Promise<Node> {
        await page.clickSelector(CommonSelectors.settingsGearButton);
        return await page.getPrintableHtmlElement(CommonSelectors.settingsDropdownMenu);
    }
});
