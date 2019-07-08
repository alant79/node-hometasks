const excel = require('excel4node');
const workbook = new excel.Workbook();
const worksheet = workbook.addWorksheet('Sheet 1');

const groupByCity = arr => {
  let newArr = [];

  for (let i = 0; i < arr.length; i++) {
    const { city, href, vacancy, hrefCompany, companyName, site } = arr[i];
    let index = -1;
    for (let i = 0; i < newArr.length; i++) {
      if (newArr[i].city === city) {
        index = i;
        break;
      }
    }
    const objList = { href, vacancy, hrefCompany, companyName, site };
    if (index === -1) {
      newArr.push({
        city,
        list: [objList]
      });
    } else {
      newArr[index].list.push(objList);
    }
  }
  return newArr;
};

const exportToExcel = arr => {
  worksheet.cell(1, 1).string('Вакансия');
  worksheet.cell(1, 2).string('Ссылка на вакансию');
  worksheet.cell(1, 3).string('Название компании');
  worksheet.cell(1, 4).string('Сайт компании');
  worksheet.cell(1, 5).string('Телефон компании');
  worksheet.cell(1, 6).string('Город');

  for (let i = 0; i < arr.length; i++) {
    worksheet.cell(i + 2, 1).string(arr[i].vacancy);
    worksheet.cell(i + 2, 2).string(arr[i].href);
    worksheet.cell(i + 2, 3).string(arr[i].companyName);
    worksheet.cell(i + 2, 4).string(arr[i].site);
    worksheet.cell(i + 2, 5).string(arr[i].phone || '');
    worksheet.cell(i + 2, 6).string(arr[i].city);
  }
  workbook.write('Вакансии.xlsx');
};

module.exports = { groupByCity, exportToExcel };
