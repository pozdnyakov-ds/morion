import nodemailer from "nodemailer"

const config = useRuntimeConfig()

const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    secure: config.MAIL_SECURE,
    auth: {
      user: config.MAIL_AUTH_USER,
      pass: config.MAIL_AUTH_PASS,
    },
  });

const send_email = async (id, subject, file, num, date, ul, inn, kpp, 
    address, email, whatsapp, telegram, type, items) => {

    var summary = 0.00
    var items_ready = ''

    items.forEach((item, index) => {
        const id = item.id ? item.id : '-'
        const name = item.name ? item.name : '-'
        const price = item.price ? (item.price).toFixed(2) : 0.00
        const quantity = item.quantity ? item.quantity : 0
        const summ = (price * quantity).toFixed(2)
        summary = +summary + +summ
        items_ready = items_ready + `<tr>
            <td style="width: 5%;  padding: 5px;">${index + 1}</td>
            <td style="width: 40%; padding: 5px;">${name}</td>
            <td style="width: 20%; padding: 5px;">${price}</td>
            <td style="width: 15%; padding: 5px;">${quantity}</td>
            <td style="width: 20%; padding: 5px;">${summ}</td>
        </tr>`
    })
    items_ready = items_ready + `<tr>
            <td colspan="4" style="padding: 5px; text-align: right;"><b>Итого, руб.<br>Без НДС</br></td>
            <td style="width: 20%; padding: 5px;"><b>${summary.toFixed(2)}<br>&nbsp;</b></td>
        </tr>`

    var content = `<table style="border-collapse: collapse; width: 100%;"><tr>
    <td style="width: 1%; padding: 0; vertical-align: top;"><img style="width: 150px;" src="https://cafecard.ru/dist/img/morion/logo_morion_login.png"></td>
    <td style="width: 20px;"></td>
    <td style="padding: 0 0 0 0; text-align: left; vertical-align: top;"><b>${subject}</b><br><br>
    
        <b>Счет №${num} от ${date} г.</b><br><br>

        <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="width: 20%;">Юридическое лицо:</td>   <td>${ul}</td></tr>
            <tr><td>ИНН:</td>                <td>${inn}</td></tr>
            <tr><td>КПП:</td>                <td>${kpp}</td></tr>
            <tr><td>Юридический адрес:</td>  <td>${address}</td></tr>
        </table><br>

        <table style="border-collapse: collapse; width: 100%;">
        <tr>
            <td style="width: 5%;  background-color: #eee; font-weight: bold; padding: 5px;">#</td>
            <td style="width: 40%; background-color: #eee; font-weight: bold; padding: 5px;">Наименование</td>
            <td style="width: 20%; background-color: #eee; font-weight: bold; padding: 5px;">Цена, руб.</td>
            <td style="width: 15%; background-color: #eee; font-weight: bold; padding: 5px;">Кол-во</td>
            <td style="width: 20%; background-color: #eee; font-weight: bold; padding: 5px;">Всего, руб.</td>
        </tr>
        ${items_ready}
        </table><br>

    <b>Счет во вложении...</b>
    </td></tr></table>`;

    var error_result = null
    const info = await transporter.sendMail({
        from: `Морион <${config.MAIL_AUTH_USER}>`,
        to: email,
        subject: subject,
        text: ``,
        html: content,
        sender: config.MAIL_AUTH_USER,
        replyTo: config.MAIL_AUTH_USER,
        attachments: [
            {
                filename: 'Счет.pdf',
                path: file
            }
        ],
        dkim: {
            domainName: config.MAIL_DOMAIN_NAME,
            keySelector: config.MAIL_KEY_SELECTOR,
            privateKey: config.MAIL_PRIVATE_KEY,
        },
        },
    function (error, info) {
        error_result = error
    })

    if (error_result) {
        return { code: 400, message: 'Ошибка отправки Email', data: null }

    } else {
        return { code: 200, message: 'Email отправлен', data: null }
    }
}

export default send_email