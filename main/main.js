'use strict';
const countItem = (tags) => {
    let items = [];
    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        let count = 1;
        let found = false;
        if (tag.search('-') != -1) {
            count = parseFloat(tag.split('-')[1]);
            tag = tag.split('-')[0];
        }
        for (let j = 0; j < items.length; j++) {
            if (tag === items[j].barcode) {
                items[j].count += count;
                found = true;
                break;
            }
        }
        if (!found) {
            items.push({ barcode: tag, count: count });
        }
    }
    return items;
}

const getReceiptOfItem = (item) => {
    const allItems = loadAllItems();
    for (let i = 0; i < allItems.length; i++) {
        if (item.barcode === allItems[i].barcode) {
            return {
                name: allItems[i].name, barcode: allItems[i].barcode, count: item.count,
                unit: allItems[i].unit, price: allItems[i].price, sum: item.count * allItems[i].price
            };
        }
    }
    return null;
}

const countSumOfPromotedItem = (receiptOfItem) => {
    let counter = 0;
    let sum = 0;
    for (let i = 0; i < receiptOfItem.count; i++) {
        if (counter != 2) {
            sum += receiptOfItem.price;
            counter++;
        }
        else {
            counter = 0;
        }
    }
    return sum;
}

const executePromotion = (allReceiptOfItems, promotions) => {
    let promotion;
    for (let j = 0; j < promotions.length; j++) {
        if (promotions[j].type === 'BUY_TWO_GET_ONE_FREE') {
            promotion = promotions[j];
        }
    }
    for (let i = 0; i < allReceiptOfItems.length; i++) {
        for (let j = 0; j < promotion.barcodes.length; j++) {
            if (allReceiptOfItems[i].barcode === promotion.barcodes[j]) {
                allReceiptOfItems[i].sum = countSumOfPromotedItem(allReceiptOfItems[i]);
            }
        }
    }
    return allReceiptOfItems;
}

const getPromotedReceiptOfItems = (allReceiptOfItems) =>  executePromotion(allReceiptOfItems,loadPromotions());

const getSumReceipt = (allPromotedReceiptOfItems) => {
    let originalSum = 0 , promotedSum = 0;
    for (let i = 0; i < allPromotedReceiptOfItems.length; i++) {
        promotedSum += allPromotedReceiptOfItems[i].sum;
        originalSum += allPromotedReceiptOfItems[i].count * allPromotedReceiptOfItems[i].price;
    }
    return [{text:'总计：',money:promotedSum},{text:'节省：',money:originalSum - promotedSum}];
}

const renderReceipt = (allPromotedReceiptOfItems) => {
    let receipt = '';
    const sumReceipt = getSumReceipt(allPromotedReceiptOfItems);
    receipt += 
    `***<没钱赚商店>收据***
`;
    for (let i = 0; i < allPromotedReceiptOfItems.length; i++) {
        receipt += `名称：${allPromotedReceiptOfItems[i].name}，数量：${allPromotedReceiptOfItems[i].count}${allPromotedReceiptOfItems[i].unit}，单价：${allPromotedReceiptOfItems[i].price.toFixed(2)}(元)，小计：${allPromotedReceiptOfItems[i].sum.toFixed(2)}(元)
`;
    }
    receipt += `----------------------
`;
    for (let i = 0; i < sumReceipt.length; i++) {
        receipt += `${sumReceipt[i].text}${sumReceipt[i].money.toFixed(2)}(元)
`;
    }
    receipt += `**********************`;
    return receipt;
}

const printReceipt = (tags) => {
    const items = countItem(tags);
    let allReceiptOfItems = [];
    for (let i = 0; i < items.length; i++) {
        allReceiptOfItems.push(getReceiptOfItem(items[i]));
    }
    const allPromotedReceiptOfItems = getPromotedReceiptOfItems(allReceiptOfItems);
    console.log(renderReceipt(allPromotedReceiptOfItems));
}
