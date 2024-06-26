// convert task-data to/from database
import relationalStore from '@ohos.data.relationalStore';
import TaskCategoryData from '../bean/TaskCategoryData';
import TaskDB from './TaskDB';
import CommonConstants from '../constants/CommonConsts';
import Logger from '../utils/Logger';
export default class CategoryTable {
    constructor(callback = () => { }) {
        this.cateTable = new TaskDB(CommonConstants.CATEGORY_TABLE_INIT.tableName, CommonConstants.CATEGORY_TABLE_INIT.sqlCreate, CommonConstants.CATEGORY_TABLE_INIT.columns, CommonConstants.CATEGORY_STORE_CONFIG);
        this.cateTable.getRdbStore(callback);
    }
    getRdbStore(callback = () => { }) {
        this.cateTable.getRdbStore(callback);
    }
    insertData(prefData, callback) {
        const valueBucket = generateBucket(prefData);
        this.cateTable.insertData(valueBucket, callback);
    }
    deleteData(prefData, callback) {
        let predicates = new relationalStore.RdbPredicates(CommonConstants.CATEGORY_TABLE_INIT.tableName);
        predicates.equalTo('id', prefData.id);
        this.cateTable.deleteData(predicates, callback);
    }
    updateData(prefData, callback) {
        const valueBucket = generateBucket(prefData);
        let predicates = new relationalStore.RdbPredicates(CommonConstants.CATEGORY_TABLE_INIT.tableName);
        predicates.equalTo('id', prefData.id);
        this.cateTable.updateData(predicates, valueBucket, callback);
    }
    query(queryID, callback) {
        let tmp = new TaskCategoryData();
        tmp.id = queryID;
        this.basic_query('id', tmp, callback, (queryID == 0));
    }
    basic_query(query_type, queryData, callback, isAll = true) {
        Logger.debug(`TaskTable query_type: ${query_type}, query_data: ${JSON.stringify(queryData)}, visit: ${queryData[query_type]}`);
        let predicates = new relationalStore.RdbPredicates(CommonConstants.CATEGORY_TABLE_INIT.tableName);
        if (!isAll)
            predicates.like(query_type, queryData[query_type]);
        this.cateTable.query(predicates, (resultSet) => {
            let count = resultSet.rowCount;
            Logger.debug(`Category Table number: ${count}`);
            if (count === 0 || typeof count === 'string') {
                // empty
                callback([]);
            }
            else {
                resultSet.goToFirstRow();
                // get results
                const result = [];
                for (let i = 0; i < count; ++i) {
                    let tmp = new TaskCategoryData();
                    for (let t = 0; t < CommonConstants.CATEGORY_TABLE_INIT.columns.length; ++t) {
                        let nowColumn = CommonConstants.CATEGORY_TABLE_INIT.columns[t];
                        let nowIndex = resultSet.getColumnIndex(nowColumn);
                        switch (nowColumn) {
                            case 'id':
                                tmp[nowColumn] = resultSet.getDouble(nowIndex);
                                break;
                            case 'name':
                                tmp[nowColumn] = resultSet.getString(nowIndex);
                                break;
                            case 'color':
                                tmp[nowColumn] = resultSet.getString(nowIndex);
                        }
                        Logger.debug(`CateTable READING: nowC = ${nowColumn}, data = ${tmp[nowColumn]}`);
                    }
                    result[i] = tmp;
                    Logger.debug(`CateTable Reading DATA: ${JSON.stringify(tmp)}`);
                    resultSet.goToNextRow();
                }
                callback(result);
            }
        });
    }
}
function generateBucket(data) {
    let obj = {};
    CommonConstants.CATEGORY_TABLE_INIT.columns.forEach((value) => {
        if (value == 'id')
            return;
        obj[value] = data[value];
    });
    return obj;
}
//# sourceMappingURL=CategoryTable.js.map