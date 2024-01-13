// import moment from 'moment'
import pdf from 'html-pdf'
// import fs from 'fs'

const config = useRuntimeConfig()

async function generatePdf() {
    const file = "/temp/bill.pdf"
    var res = null

    try {
        const htmlHeader = `<html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <style type="text/css">
            * {font-family: arial;font-size: 14px;line-height: 14px;}
            table {margin: 0 0 15px 0;width: 100%;border-collapse: collapse;border-spacing: 0;}		
            table th {padding: 5px;font-weight: bold;}        
            table td {padding: 5px;}	
            .header {margin: 0 0 0 0;padding: 0 0 15px 0;font-size: 12px;line-height: 12px;text-align: center;}
            h1 {margin: 0 0 10px 0;padding: 10px 0;border-bottom: 2px solid #000;font-weight: bold;font-size: 20px;}
                
            /* Реквизиты банка */
            .details td {padding: 3px 2px;border: 1px solid #000000;font-size: 12px;line-height: 12px;vertical-align: top;}
         
            /* Поставщик/Покупатель */
            .contract th {padding: 3px 0;vertical-align: top;text-align: left;font-size: 13px;line-height: 15px;}	
            .contract td {padding: 3px 0;}		
         
            /* Наименование товара, работ, услуг */
            .list thead, .list tbody  {border: 2px solid #000;}
            .list thead th {padding: 4px 0;border: 1px solid #000;vertical-align: middle;text-align: center;}	
            .list tbody td {padding: 0 2px;border: 1px solid #000;vertical-align: middle;font-size: 11px;line-height: 13px;}	
            .list tfoot th {padding: 3px 2px;border: none;text-align: right;}	
         
            /* Сумма */
            .total {margin: 0 0 20px 0;padding: 0 0 10px 0;border-bottom: 2px solid #000;}	
            .total p {margin: 0;padding: 0;}
                
            /* Руководитель, бухгалтер */
            .sign {position: relative;}
            .sign table {width: 60%;}
            .sign th {padding: 40px 0 0 0;text-align: left;}
            .sign td {padding: 40px 0 0 0;border-bottom: 1px solid #000;text-align: right;font-size: 12px;}
            .sign-1 {position: absolute;left: 149px;top: -44px;}	
            .sign-2 {position: absolute;left: 149px;top: 0;}	
            .printing {position: absolute;left: 271px;top: -15px;}
            </style>
        </head>
        <body>
            <p class="header">
                Внимание! Оплата данного счета означает согласие с условиями поставки товара.
                Уведомление об оплате обязательно, в противном случае не гарантируется наличие
                товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика,
                самовывозом, при наличии доверенности и паспорта.
            </p>
         
            <table class="details">
                <tbody>
                    <tr>
                        <td colspan="2" style="border-bottom: none;">ЗАО "БАНК", г.Москва</td>
                        <td>БИК</td>
                        <td style="border-bottom: none;">000000000</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border-top: none; font-size: 10px;">Банк получателя</td>
                        <td>Сч. №</td>
                        <td style="border-top: none;">00000000000000000000</td>
                    </tr>
                    <tr>
                        <td width="25%">ИНН 0000000000</td>
                        <td width="30%">КПП 000000000</td>
                        <td width="10%" rowspan="3">Сч. №</td>
                        <td width="35%" rowspan="3">00000000000000000000</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border-bottom: none;">ООО "Компания"</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border-top: none; font-size: 10px;">Получатель</td>
                    </tr>
                </tbody>
            </table>
         
            <h1>Счет на оплату № 10 от 01 февраля 2018 г.</h1>
         
            <table class="contract">
                <tbody>
                    <tr>
                        <td width="15%">Поставщик:</td>
                        <th width="85%">ООО "Компания", ИНН 0000000000, КПП 000000000, 125009, Москва г, Тверская, дом № 9</th>
                    </tr>
                    <tr>
                        <td>Покупатель:</td>
                        <th>ООО "Покупатель", ИНН 0000000000, КПП 000000000, 119019, Москва г, Новый Арбат, дом № 10
                        </th>
                    </tr>
                </tbody>
            </table>
         
            <table class="list">
                <thead>
                    <tr>
                        <th width="5%">№</th>
                        <th width="54%">Наименование товара, работ, услуг</th>
                        <th width="8%">Коли-<br>чество</th>
                        <th width="5%">Ед.<br>изм.</th>
                        <th width="14%">Цена</th>
                        <th width="14%">Сумма</th>
                    </tr>
                </thead>
                <tbody>`;

        const htmlPositions = `<tr>
            <td align="center">1</td>
            <td align="left">Товар </td>
            <td align="center">3</td>
            <td align="center">Шт.</td>
            <td align="right">100</td>
            <td align="right">300</td>
        </tr>`;

        const htmlFooter = `</tbody>
                <tfoot>
                    <tr>
                        <th colspan="5">Итого:</th>
                        <th>itogo</th>
                    </tr>
                    <tr>
                        <th colspan="5">Без НДС:</th>
                        <th>&nbsp;</th>
                    </tr>
                    <tr>
                        <th colspan="5">Всего к оплате:</th>
                        <th>total</th>
                    </tr>
                </tfoot>
            </table>
            
            <div class="total">
                <p>Всего наименований ' . count($prods) . ', на сумму ' . format_price($total) . ' руб.</p>
                <p><strong>total</strong></p>
            </div>
            
            <div class="sign">
                <img class="sign-1" src="https://example.com/demo/sign-1.png">
                <img class="sign-2" src="https://example.com/demo/sign-2.png">
                <img class="printing" src="https://example.com/demo/printing.png">
                <table>
                    <tbody>
                        <tr>
                            <th width="30%">Руководитель</th>
                            <td width="70%">Иванов А.А.</td>
                        </tr>
                        <tr>
                            <th>Бухгалтер</th>
                            <td>Сидоров Б.Б.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>
        </html>`;
        const html = htmlHeader + htmlPositions + htmlFooter;
        const options = {
            "border": {
                "top": "0.5in",
                "right": "0.5in",
                "bottom": "0.5in",
                "left": "0.75in"
            }
        }

        try {
            pdf.create(html, options).toFile(file, (err, res) => {
                if (err) return console.log(err);
                console.log('PDF generated successfully:', res);
                res = true
            });

        } catch (err) {
            console.log("Create file error: ", err);
            res = false
        }
    } catch (e) {
        console.log("Common file error: ", e);
        res = false
    }

    return res
}

export default generatePdf
