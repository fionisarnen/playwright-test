import { test, expect } from '@playwright/test';
import { DemoBookLoginPages } from '../pages/demoBookLoginPages';
import { DemoBookHomepage } from '../pages/demoBookHomepage';
import { CommonMethod } from '../pages/commonMethod';

var URL_BOOKS = 'https://demoqa.com/books';
var URL_LOGIN = 'https://demoqa.com/login';
var userNameGlobal = 'laralandon';
var passwordGlobal = 'Lara123!';

test('User successfully register new account', async ({ page }) => {
  const commonMethod = new CommonMethod(page);
  const demoBookLogin = new DemoBookLoginPages(page);

  let firstName = await commonMethod.generateRandomName(5);
  let lastName = await commonMethod.generateRandomName(5);
  let userName = 'user' + firstName + lastName;
  let password = 'Password123!';
  console.log("Registering new user with username: " + userName);
  console.log("First Name: " + firstName);
  console.log("Last Name: " + lastName);
  console.log("Password: " + password);

  await commonMethod.goToUrl(URL_BOOKS, 30000);
  await demoBookLogin.clickLoginButton();
  await demoBookLogin.validateLoginPage();
  await demoBookLogin.clickRegisterButton();
  await demoBookLogin.validateRegisterPage();
  const [responseJson] = await Promise.all([
      commonMethod.getAPIResponse('/Account/v1/User', 201),
      demoBookLogin.fillRegisterCredential(firstName, lastName, userName, password),

    ]);
  expect(responseJson.username).toEqual(userName);
  console.log("User successfully registered new account");
});

test('User successfully login with existing account to book page', async ({ page }) => {
  const commonMethod = new CommonMethod(page);
  const demoBookLogin = new DemoBookLoginPages(page);
  const demoBookPage = new DemoBookHomepage(page);

  let username = userNameGlobal;
  let password = passwordGlobal;

  await commonMethod.goToUrl(URL_BOOKS, 30000);
  await demoBookLogin.clickLoginButton();
  await demoBookLogin.validateLoginPage();

  const [responseJson] = await Promise.all([
      commonMethod.getAPIResponse('/BookStore/v1/Books', 200),
      commonMethod.getAPIResponse('/Account/v1/Login', 200),
      demoBookLogin.fillLoginCredential(username, password),
      
    ]);

  const titleBookList = responseJson.books.map((book: any) => book.title);
  console.log("Books retrieved from API: " + titleBookList.join(", "));
  await demoBookPage.validateBookHomepage(true,titleBookList, username);
  console.log("User successfully logged in");
});

test('User failed to login with invalid credential', async ({ page }) => {
  const commonMethod = new CommonMethod(page);
  const demoBookLogin = new DemoBookLoginPages(page);

  let username = 'invalidUser';
  let password = 'invalidPass';

  await commonMethod.goToUrl(URL_BOOKS, 30000);
  await demoBookLogin.clickLoginButton();
  await demoBookLogin.validateLoginPage();

  const [responseJson] = await Promise.all([
      commonMethod.getAPIResponse('/Account/v1/GenerateToken', 200),
      demoBookLogin.fillLoginCredential(username, password),
      
    ]);
  expect(responseJson.status).toEqual("Failed");
  await demoBookLogin.validateInvalidLoginMessage();
  console.log("Invalid login attempt validated successfully");
});

test('User search for a book successfully', async ({ page }) => {
  const commonMethod = new CommonMethod(page);
  const demoBookLogin = new DemoBookLoginPages(page);
  const demoBookPage = new DemoBookHomepage(page);

  let username = userNameGlobal;
  let password = passwordGlobal;
  let bookTitleToSearch = 'Learning JavaScript Design Patterns';

  await commonMethod.goToUrl(URL_BOOKS, 30000);
  await demoBookLogin.clickLoginButton();
  await demoBookLogin.validateLoginPage();

  const [responseJson] = await Promise.all([
      commonMethod.getAPIResponse('/BookStore/v1/Books', 200),
      commonMethod.getAPIResponse('/Account/v1/Login', 200),
      demoBookLogin.fillLoginCredential(username, password),
      
    ]);

  const titleBookList = responseJson.books.map((book: any) => book.title);
  await demoBookPage.validateBookHomepage(true,titleBookList, username);
  await demoBookPage.searchBook(bookTitleToSearch);
  
  const bookIds = await demoBookPage.getBookIdsOnPage(bookTitleToSearch);
  expect(bookIds.length).toBeGreaterThan(0);
  await demoBookPage.navigateToBookDetails(bookTitleToSearch, bookIds[0]);
  console.log("Book search functionality validated successfully");
});

test('User search for a non-existing book', async ({ page }) => {
  const commonMethod = new CommonMethod(page);
  const demoBookLogin = new DemoBookLoginPages(page);
  const demoBookPage = new DemoBookHomepage(page);

  let username = userNameGlobal;
  let password = passwordGlobal;
  let bookTitleToSearch = 'NonExistingBookTitle';

  await commonMethod.goToUrl(URL_LOGIN, 30000);
  await demoBookLogin.clickLoginButton();
  await demoBookLogin.validateLoginPage();

  await Promise.all([
      commonMethod.getAPIResponse('/Account/v1/GenerateToken', 200),
      commonMethod.getAPIResponse('/Account/v1/Login', 200),
      demoBookLogin.fillLoginCredential(username, password),
  ]);

  await demoBookPage.validateNavigateToProfilePage(username);

  const [responseJsonBooks] = await Promise.all([
      commonMethod.getAPIResponse('/BookStore/v1/Books', 200),
      demoBookPage.clickGoToBookStore(),
    ]);
   
  const titleBookList = responseJsonBooks.books.map((book: any) => book.title);
  await demoBookPage.validateBookHomepage(true,titleBookList, username);
  await demoBookPage.searchBook(bookTitleToSearch);
  console.log("Non-existing book search validated successfully");
});