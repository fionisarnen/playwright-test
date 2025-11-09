import { expect, Page } from "@playwright/test";
import { title } from "process";

const classConstant =  {
    txtSearch: 'xpath=//input[@id="searchBox"]',
    btnSearch: 'xpath=//*[@class="input-group-append"]',
    btnLogin: 'xpath=//button[@id="login"]',
    imgBookCover: 'xpath=//img[contains(@src,"/images/bookimage")]',
    thLabelHeader: (title: string) => `xpath=//div[@role="columnheader"]/div[text()='${title}']`,
    lblBookTitle: (title: string) => `xpath=//span[contains(@id,"${title}") and contains(@id,"see-book-")]`,
    btnPrevious: 'xpath=//button[text()="Previous"]',
    btnNext: 'xpath=//button[text()="Next"]',
    tfPageNumber: 'xpath=//input[@type="number"]',
    ddlPageSize: 'xpath=//select[@aria-label="rows per page"]',
    ddlPageSizeOption: "xpath=//select[@aria-label='rows per page']/option",
    lblNoResults: 'xpath=//div[@class="rt-noData"]',
    lblBookDetails: (title: string) => `xpath=//span[contains(@id,"${title}") and contains(@id,"see-book-")]/*[@href]`,
    lblUserName: '[id="userName-value"]',
    btnLogout: "xpath=//button[@id='submit' and text()='Log out']",
    btnGoToBookStore: "xpath=//button[@id='gotoStore']"
}

export class DemoBookHomepage {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async validateBookHomepage(isLogin: boolean, bookTitle: Array<string>, userName?: string) {
        await this.page.waitForURL(`**/books`, { timeout: 10000 })
        await expect(this.page.locator(classConstant.txtSearch)).toBeVisible({ timeout: 10000 });
        
        if (isLogin) {
            await expect(this.page.locator(classConstant.btnLogout)).toBeVisible({ timeout: 10000 });
            await expect(this.page.locator(classConstant.lblUserName)).toHaveText(userName!, { timeout: 10000 });
            console.log("User logged in as: " + await this.page.locator(classConstant.lblUserName).innerText());
        } else {
            await expect(this.page.locator(classConstant.btnLogin)).toBeVisible({ timeout: 10000 });
            console.log("User is not logged in");
        }
        await expect(this.page.locator(classConstant.imgBookCover).first()).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.thLabelHeader('Title'))).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.thLabelHeader('Author'))).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.thLabelHeader('Publisher'))).toBeVisible({ timeout: 10000 });
        for (let i = 0; i < bookTitle.length; i++) {
            await expect(this.page.locator(classConstant.lblBookTitle(bookTitle[i]))).toBeVisible({ timeout: 10000 });
            const totalBookCover = this.page.locator(classConstant.imgBookCover);
            expect(await totalBookCover.count()).toEqual(bookTitle.length);
        }

        // Validate Pagination Controls
        await expect(this.page.locator(classConstant.btnPrevious)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnNext)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.tfPageNumber)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.ddlPageSize)).toBeVisible({ timeout: 10000 });
        const ddlOptions = this.page.locator(classConstant.ddlPageSizeOption);
        expect(await ddlOptions.count()).toEqual(6);
        console.log("Book Homepage validated successfully");
    }

    async searchBook(bookTitle: string) {
        await expect(this.page.locator(classConstant.txtSearch)).toBeVisible({ timeout: 10000 });
        await this.page.fill(classConstant.txtSearch, bookTitle);
        await this.page.click(classConstant.btnSearch);
        await this.page.waitForTimeout(2000); // Wait for search results to load
        const bookLocator = this.page.locator(classConstant.lblBookTitle(bookTitle));
        if (await bookLocator.count() > 0) {
            await expect(bookLocator).toBeVisible({ timeout: 10000 });
            await expect(bookLocator).toHaveText(bookTitle, { timeout: 10000 });
            console.log(`Book titled "${bookTitle}" found successfully`);
        } else {
            await expect(this.page.locator(classConstant.lblNoResults)).toBeVisible({ timeout: 10000 });
            console.log(`No results found for the book titled "${bookTitle}"`);
        }
    }

    async getBookIdsOnPage(bookTitle: string){
        const bookIds: string[] = [];
        // get property href of all book title links on the page
        const href = await this.page.locator(classConstant.lblBookDetails(bookTitle)).getAttribute('href');
        if (href) {
            const parts = href.split('/');
            const bookId = parts[parts.length - 1];
            bookIds.push(bookId);
        }
    
        return bookIds;
    }

    async navigateToBookDetails(bookTitle: string, bookId: string) {
        const bookLocator = this.page.locator(classConstant.lblBookTitle(bookTitle));
        await expect(bookLocator).toBeVisible({ timeout: 10000 });
        await bookLocator.click();
        await this.page.waitForURL(`**/${bookId}`, { timeout: 30000 });
        console.log(`Navigated to details page of the book titled "${bookTitle}" successfully`);
    }

    async clickGoToBookStore() {
        await expect(this.page.locator(classConstant.btnGoToBookStore)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnGoToBookStore);
        await this.page.waitForURL(`**/books`, { timeout: 10000 });
        console.log("Go To Book Store button clicked successfully");
    }

    async validateNavigateToProfilePage(userName: string) {
        await this.page.waitForURL(`**/profile`, { timeout: 10000 })
        await expect(this.page.locator(classConstant.lblUserName)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblUserName)).toHaveText(userName, { timeout: 10000 });

        //verify Logout button
        await expect(this.page.locator(classConstant.btnLogout)).toBeVisible({ timeout: 10000 });
        //verify no books saved
        await expect(this.page.locator(classConstant.lblNoResults)).toBeVisible({ timeout: 10000 });
        console.log("Navigated to Profile Page successfully with username: " + await this.page.locator(classConstant.lblUserName).innerText());
    }
    


}