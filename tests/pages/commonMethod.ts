import { expect, Page } from "@playwright/test";

const classConstant =  {
}

export class CommonMethod {
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

    async generateRandomName(length: number): Promise<string> {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    async getAPIResponse(endpoint: string, status: number): Promise<any> {
        const response = await this.page.waitForResponse(
            resp => resp.url().includes(endpoint),
            { timeout: 20000 }
        );
        expect(response.status()).toBe(status);
        const responseBody = await response.json();
        return responseBody;
    }

}