import { expect, Page } from "@playwright/test";
import { title } from "process";

const classConstant =  {
    txtSearch: 'xpath=//input[@id="searchBox"]',
    btnSearch: 'xpath=//input[@id="searchBox"]/following-sibling::button',
    btnLogin: 'xpath=//button[@id="login"]',
    imgBookCover: 'xpath=//img[@alt="book-image"]',
    thLabelHeader: (title: string) => `xpath=//table//th//span[text()='${title}']`,
    lblBookTitle: (title: string) => `xpath=//span[contains(@id,"${title}") and contains(@id,"see-book-")]`,
    btnPrevious: 'xpath=//button[text()="Previous"]',
    btnNext: 'xpath=//button[text()="Next"]',
    lblPageNumber: 'xpath=//span[starts-with(text(),"Page ")]',
    rowBookTable: 'xpath=//table/tbody/tr',
    lblBookDetails: (title: string) => `xpath=//span[contains(@id,"${title}") and contains(@id,"see-book-")]/*[@href]`,
    lblUserName: '[id="userName-value"]',
    // the store page labels the button "Log out", the profile page "Logout"
    btnLogout: "xpath=//button[@id='submit' and (normalize-space(text())='Log out' or normalize-space(text())='Logout')]",
    btnGoToBookStore: "xpath=//button[@id='gotoStore']",
    lnkProfileMenu: 'xpath=//a[@href="/profile"]',
    btnAddToCollection: 'xpath=//button[text()="Add To Your Collection"]',
    btnDeleteBook: (bookId: string) => `xpath=//span[@id="delete-record-${bookId}"]`,
    lblModalTitle: 'xpath=//div[@id="example-modal-sizes-title-sm"]',
    lblModalBody: 'xpath=//div[@class="modal-body"]',
    btnModalOk: 'xpath=//button[@id="closeSmallModal-ok"]',
    btnModalCancel: 'xpath=//button[@id="closeSmallModal-cancel"]'
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
        await expect(this.page.locator(classConstant.lblPageNumber)).toBeVisible({ timeout: 10000 });
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
            await expect(this.page.locator(classConstant.rowBookTable)).toHaveCount(0, { timeout: 10000 });
            console.log(`No results found for the book titled "${bookTitle}"`);
        }
    }

    async getBookIdsOnPage(bookTitle: string){
        const bookIds: string[] = [];
        // get property href of all book title links on the page, they look like /books?search=<isbn>
        const href = await this.page.locator(classConstant.lblBookDetails(bookTitle)).getAttribute('href');
        if (href) {
            const bookId = new URL(href, this.page.url()).searchParams.get('search');
            if (bookId) {
                bookIds.push(bookId);
            }
        }

        return bookIds;
    }

    async navigateToBookDetails(bookTitle: string, bookId: string) {
        const bookLocator = this.page.locator(classConstant.lblBookTitle(bookTitle));
        await expect(bookLocator).toBeVisible({ timeout: 10000 });
        await bookLocator.click();
        await this.page.waitForURL(new RegExp(`search=${bookId}`), { timeout: 30000 });
        console.log(`Navigated to details page of the book titled "${bookTitle}" successfully`);
    }

    async addBookToCollection(): Promise<string> {
        // the site confirms the add with a native alert, catch it before it is auto dismissed
        const alertMessage = this.page.waitForEvent('dialog').then(async dialog => {
            const message = dialog.message();
            await dialog.accept();
            return message;
        });
        await expect(this.page.locator(classConstant.btnAddToCollection)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnAddToCollection);
        console.log("Add To Your Collection button clicked successfully");
        return alertMessage;
    }

    async clickProfileMenu() {
        await expect(this.page.locator(classConstant.lnkProfileMenu)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.lnkProfileMenu);
        await this.page.waitForURL(`**/profile`, { timeout: 10000 });
        console.log("Profile menu clicked successfully");
    }

    async validateBookInCollection(bookTitle: string, bookId: string) {
        await expect(this.page.locator(classConstant.thLabelHeader('Action'))).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblBookTitle(bookTitle))).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnDeleteBook(bookId))).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.rowBookTable)).toHaveCount(1, { timeout: 10000 });
        console.log(`Book titled "${bookTitle}" found in the collection successfully`);
    }

    async deleteBookFromCollection(bookId: string): Promise<string> {
        await expect(this.page.locator(classConstant.btnDeleteBook(bookId))).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnDeleteBook(bookId));

        // Validate Delete Confirmation Modal
        await expect(this.page.locator(classConstant.lblModalTitle)).toHaveText("Delete Book", { timeout: 10000 });
        await expect(this.page.locator(classConstant.lblModalBody)).toHaveText("Do you want to delete this book?", { timeout: 10000 });
        await expect(this.page.locator(classConstant.btnModalCancel)).toBeVisible({ timeout: 10000 });
        console.log("Delete confirmation modal validated successfully");

        const alertMessage = this.page.waitForEvent('dialog').then(async dialog => {
            const message = dialog.message();
            await dialog.accept();
            return message;
        });
        await expect(this.page.locator(classConstant.btnModalOk)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnModalOk);
        console.log("Delete confirmed successfully");
        return alertMessage;
    }

    async validateEmptyCollection() {
        await expect(this.page.locator(classConstant.rowBookTable)).toHaveCount(0, { timeout: 10000 });
        console.log("Collection is empty as expected");
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
        await expect(this.page.locator(classConstant.rowBookTable)).toHaveCount(0, { timeout: 10000 });
        console.log("Navigated to Profile Page successfully with username: " + await this.page.locator(classConstant.lblUserName).innerText());
    }
    


}