import * as auth_page from "../locators/auth_page.json";
import * as main_page from "../locators/main_page.json";
import * as trainer_page from "../locators/trainer_page.json";
import * as shop_avatar from "../locators/shop_avatar_page.json";
import * as payments from "../locators/payments_page.json";
import * as payments_confirm from "../locators/payment_confirmation_page.json";
import * as data from "../helpers/default_data.json";

describe('Проверка покупки нового аватара', function () {

  beforeEach('Начало теста', function () {
    cy.visit('/login/');
  });

  it('Верный пароль и верный логин, вход на страницу тренера, купить аватар', function () {

    cy.get(auth_page.input_email).type(data.email);
    cy.get(auth_page.input_password).type(data.password);
    cy.get(auth_page.login_button).click();

    cy.intercept('GET', 'https://pokemonbattle.ru/trainer/*').as('trainer_data');
    cy.get(main_page.trainer_link).click();
    cy.wait('@trainer_data');

    cy.get(trainer_page.shop_link).click({ force: true });

    // Выбор случайного аватара
    cy.get(shop_avatar.avatars_list).then(($items) => {
      const random_index = Math.floor(Math.random() * $items.length);
      const random_item = $items.eq(random_index);
      const src = random_item.find(shop_avatar.image_src).attr('src');
      cy.wrap(src).as('new_avatar');
      cy.wrap(random_item).find(shop_avatar.shop_button).click();
    });

    cy.get(payments.payment_card_number_input).type(data.payment_card_number);
    cy.get(payments.payment_card_expiration_date_input).type(data.payment_card_expiration_date);
    cy.get(payments.payment_card_security_code_input).type(data.payment_card_security_code);
    cy.get(payments.payment_card_cardholder_name_input).type(data.payment_card_cardholder_name);
    cy.get(payments.buy_avatar_button).click();

    cy.get(payments_confirm.sms_code_input).type(data.correct_sms_code);
    cy.get(payments_confirm.payment_submit_button).click();

    cy.contains('Покупка прошла успешно').should('be.visible');

    cy.visit('/');

    cy.get(main_page.trainer_link).click();

    // не сработал так как это асинхронный запрос и загружает из кэша. отключать кэш нельзя поскольку получится нестандартная среда для тестирования, у пользователь кэш использует
    //cy.intercept('GET', 'https://storage.yandexcloud.net/qastudio/pokemon_battle/trainers/*').as('avatar_image');
    // cy.wait(4000); // позорный вэйт
    // выкрутился, заметив что атрибут src пустой пока картинка не загрузится, ждем этого, потом проверяем соответствие аватара купленому
    cy.get(trainer_page.trainer_image).should('have.attr', 'src').and('not.be.empty'); 
    cy.get(trainer_page.trainer_image).then(($img) => { 
      const avatar = $img.attr('src');
      cy.get('@new_avatar').then((new_avatar) => {
        expect(new_avatar).to.equal(avatar); 
      });
    });
  });
});