const request = require('request');
const cheerio = require('cheerio');
const promiseWaterfall = require('promise.waterfall');
const util = require('util');
const requestPromise = util.promisify(request);

const scrape = (url, searchString) => {
  return new Promise(resolve => {
    let queue = [];
    // получаем количество страниц
    queue.push(countPages(url, searchString, queue));
    promiseWaterfall(queue)
      .then(res => {
        let queue = [];
        let arr = [];
        // добавляем задания на чтение каждой страницы
        for (let i = 0; i < res; i++) {
          queue.push(readPage(url, searchString, i, arr));
        }
        promiseWaterfall(queue).then(res => {
          let queue = [];
          // добавляем задания на чтение каждой вакансии
          for (let i = 0; i < res.length; i++) {
            queue.push(readVacancion(url, arr, i));
          }
          promiseWaterfall(queue).then(arr => {
            let queue = [];
            // добавляем задания на чтение каждой странице о компании
            for (let i = 0; i < arr.length; i++) {
              // в очередь добавляем только те ссылки на компанию, которые встретились первый раз
              if (!arr[i].site) {
                queue.push(readCompany(arr, i));
              }
            }
            promiseWaterfall(queue).then(res => {
              resolve(res);
            });
          });
        });
      })
      .catch(console.error);
  });
};

const countPages = (url, searchString) => {
  return function countPages () {
    return requestPromise(url + searchString)
      .then(({ body }) => {
        let $ = cheerio.load(body);
        const countPage =
          $('nav > ul.pagination')
            .not('.pagination-small')
            .children().length - 2;
        return countPage;
      });
  };
};

const readPage = (url, searchString, countPage, arr) => {
  return function readPage () {
    const urlPage = url + searchString + `/?page=${countPage}`;
    return requestPromise(urlPage).then(({ body }) => {
      let $ = cheerio.load(body);
      $('.card > h2 > a').each(function () {
        const href = url + $(this).attr('href');
        let obj = { href };
        arr.push(obj);
      });
      return arr;
    });
  };
};

const readVacancion = (url, arr, i) => {
  return function readVacancion () {
    const urlPage = arr[i].href;
    return requestPromise(urlPage).then(({ body }) => {
      let $vacancion = cheerio.load(body);
      const vacancy = $vacancion('#h1-name').text();
      arr[i].vacancy = vacancy;
      $vacancion('.dl-horizontal')
        .children('dt')
        .each(function () {
          let type = $vacancion(this).text();
          switch (type) {
            case 'Компания:':
              let hrefCompany = $vacancion(this)
                .next('dd')
                .children('a');
              arr[i].hrefCompany = url + hrefCompany.attr('href');
              // найдем были ли раньше в массиве уже ссылки на компанию, если были то в свойство site
              // запишем '!#' + первый индекс массива с такой же компанией, в дальнейшем
              // когда мы получим сайт компании по этому индексу, по пробежимся по всему массиву
              // и заполним свойство site у элементов массива, имеющих такую же ссылку на компанию
              let fl = -1;
              for (let j = 0; j < i; j++) {
                if (arr[j].hrefCompany === arr[i].hrefCompany) {
                  fl = j;
                  break;
                }
              }
              if (fl !== -1) {
                arr[i].site = '!#' + fl;
              }
              arr[i].companyName = hrefCompany.children('b').text();
              break;
            case 'Телефон:':
              arr[i].phone = $vacancion(this)
                .next('dd')
                .children('a')
                .text();
              break;
            case 'Город:':
              arr[i].city = $vacancion(this)
                .next('dd')
                .text();
              break;
          }
        });
      return arr;
    });
  };
};

const readCompany = (arr, i) => {
  return function readCompany () {
    const urlPage = arr[i].hrefCompany;
    return requestPromise(urlPage).then(({ body }) => {
      let $company = cheerio.load(body);
      arr[i].site = $company('.website-company')
        .children('a')
        .attr('href');
      // теперь найдем все элементы  '!#' + i, сайт у этих элементов будет такой же как у arr[i]
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].site === '!#' + i) {
          arr[j].site = arr[i].site;
        }
      }
      return arr;
    });
  };
};

module.exports = scrape;
