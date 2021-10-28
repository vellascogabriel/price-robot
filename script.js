const puppeteer = require('puppeteer')
const xl = require('excel4node')

const crawler = async () => {
    const browser = await puppeteer.launch({ headless: false, waitUntil: 'load', timeout: 0 })
    const page = await browser.newPage()

    await page.goto('https://www.casasbahia.com.br/')

    await page.screenshot({ path: 'teste.png' })

    const cookies = await page.cookies()

    await page.deleteCookie(...cookies)

    await page.type('#strBusca', 'Iphone')

    await page.click('#btnOK')

    console.log('\x1b[32m' , 'Realizando pesquisa...')

    await page.waitForNavigation()

    const productList = await page.evaluate(() => {

        const products = document.getElementsByClassName('ProductCard__CardContent-sc-2vuvzo-1 liAVqD')

        const arrayProducts = [...products]

        const elements = [] 

        arrayProducts.forEach((product) => {
            const productChildren = [...product.children]

            const productObject = { name: '', price: ''}
            productChildren.forEach((element) => {
                
                if (element.className === 'ProductCard__Title-sc-2vuvzo-0 iBDOQj') {
                    console.log(element.innerText)
                    productObject.name = element.innerText
                }

                if (!element.className) {
                    const children = [...element.children]

                    children.forEach((element) => {
                        if(element.className === 'ProductPrice__Wrapper-sc-1tzw2we-0 fVCvmb') {

                            const children = [...element.children]

                            children.forEach((element) => {
                                if (element.className === 'ProductPrice__Price-sc-1tzw2we-4 bRvopW') {

                                    const children = [...element.children]

                                    children.forEach((element) => {
                                        if (element.className === 'ProductPrice__PriceValue-sc-1tzw2we-6 kBYiGY') {
                                            productObject.price = element.innerText
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
            elements.push(productObject)
        })

        return elements
    })

    await browser.close()


    const workBook = new xl.Workbook()

    var workSheet = workBook.addWorksheet('Casas Bahia')

    productList.forEach((product, index) => {
        workSheet.cell(index + 1, 1).string(product.name)
        workSheet.cell(index + 1, 2).string(product.price)

        console.log('\x1b[33m%s\x1b[0m',`Exportando para arquivo excel ${index + 1}/${productList.length}`)
    })

    workBook.write(`iphone Casas Bahia - ${Date.now()}.xlsx`)
}

crawler()