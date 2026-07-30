import { expect, Page } from "@playwright/test";
import { CommonMethod } from "./commonMethod";

const classConstant =  {
    demoBookLogin: (page: Page) => new DemoBookLoginPages(page),
    lblTitleLogin: 'xpath=//h1[text()="Login"]',
    frmLogin: 'xpath=//form[@id="userForm"]',
    txtUsername: 'xpath=//input[@id="userName"]',
    lblUsername: 'xpath=//label[@id="userName-label"]',
    txtPassword: 'xpath=//input[@id="password"]',
    lblPassword: 'xpath=//label[@id="password-label"]',
    btnLogin: 'xpath=//button[@id="login"]',
    btnRegister: 'xpath=//button[@id="newUser"]',
    imgLogoPage: 'xpath=//img[contains(@src,"Toolsqa")]',
    frmPannelMenu: 'xpath=//div[@class="left-pannel"]',
    lblPannelMenu: 'xpath=//div[@class="header-text"]/child::text()',
    lblRegisterPageTitle: 'xpath=//h4[text()="Register to Book Store"]',
    lblTitleRegister: 'xpath=//h1[text()="Register"]',
    txtFirstName: 'xpath=//input[@id="firstname"]',
    lblFirstName: 'xpath=//label[@id="firstname-label"]',
    txtLastName: 'xpath=//input[@id="lastname"]',
    lblLastName: 'xpath=//label[@id="lastname-label"]',
    txtUserNameRegister: 'xpath=//input[@id="userName"]',
    lblUserNameRegister: 'xpath=//label[@id="userName-label"]',
    txtPasswordRegister: 'xpath=//input[@id="password"]',
    lblPasswordRegister: 'xpath=//label[@id="password-label"]',
    chkCaptcha: 'xpath=//*[@class="recaptcha-checkbox-border"]',
    btnRegisterUser: 'xpath=//button[@id="register"]',
    btnBackToLogin: 'xpath=//button[@id="gotologin"]',
    lblInvalidLoginMessage: 'xpath=//*[text()="Invalid username or password!"]'
}

export class DemoBookLoginPages {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
        
    }

    async goToUrl(url:string, timeOut:number){
        try{
            await this.page.goto(url,{timeout:timeOut});
        }
        catch(e){
            throw new Error("TimeoutException : " + timeOut + "ms exceeded. ");
        }
    }

    async clickLoginButton() {
        await expect(this.page.locator(classConstant.btnLogin)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnLogin);
        console.log("Login button clicked successfully");
    }

    async validateLoginPage() {
        await this.page.waitForURL(`**/login`, { timeout: 10000 })
        await expect(this.page.locator(classConstant.lblTitleLogin)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.imgLogoPage)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.frmLogin)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtUsername)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblUsername)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtPassword)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblPassword)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnLogin)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnRegister)).toBeVisible({ timeout: 10000 });
        console.log("Login Page validated successfully");

    }

    async fillLoginCredential(username: string, password: string) {
        await expect(this.page.locator(classConstant.txtUsername)).toBeVisible({ timeout: 10000 });
        await this.page.fill(classConstant.txtUsername, username);
        await this.page.fill(classConstant.txtPassword, password);
        console.log("Login Credential filled successfully");

        await this.page.click(classConstant.btnLogin);
        console.log("Login button clicked successfully");
        
    }

    async clickRegisterButton() {
        await expect(this.page.locator(classConstant.btnRegister)).toBeVisible({ timeout: 10000 });
        await this.page.click(classConstant.btnRegister);
        console.log("Register button clicked successfully");
    }

    async validateRegisterPage() {
        await this.page.waitForURL(`**/register`, { timeout: 10000 })
        await expect(this.page.locator(classConstant.lblRegisterPageTitle)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblTitleRegister)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtFirstName)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblFirstName)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtLastName)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblLastName)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtUserNameRegister)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblUserNameRegister)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.txtPasswordRegister)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.lblPasswordRegister)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnRegisterUser)).toBeVisible({ timeout: 10000 });
        await expect(this.page.locator(classConstant.btnBackToLogin)).toBeVisible({ timeout: 10000 });
        console.log("Register Page validated successfully");

    }

    async fillRegisterCredential(firstname: string, lastname: string, username: string, password: string) {
        await expect(this.page.locator(classConstant.txtFirstName)).toBeVisible({ timeout: 10000 });
        await this.page.fill(classConstant.txtFirstName, firstname);
        await this.page.fill(classConstant.txtLastName, lastname);
        await this.page.fill(classConstant.txtUserNameRegister, username);
        await this.page.fill(classConstant.txtPasswordRegister, password);
        console.log("Register Credential filled successfully");
    }

    async clickButtonRegister(){
        await this.page.click(classConstant.btnRegisterUser);
        console.log("Register User button clicked successfully");
    }

    async validateInvalidLoginMessage() {
        await this.page.waitForURL(`**/login`, { timeout: 10000 })
        await expect(this.page.locator(classConstant.lblInvalidLoginMessage)).toBeVisible({ timeout: 10000 });
        console.log("Invalid login message validated successfully");
    }
    


}