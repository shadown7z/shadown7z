// convert task-data to/from database
import relationalStore from '@ohos.data.relationalStore';
import { TaskListItemData } from '../bean/TaskListItemData';
import TaskDB from './TaskDB';
import CommonConstants from '../constants/CommonConsts';
import Logger from '../utils/Logger';
export default class TaskTable {
    constructor(callback = () => { }) {
        this.taskTable = new TaskDB(CommonConstants.TASK_TABLE_INIT.tableName, CommonConstants.TASK_TABLE_INIT.sqlCreate, CommonConstants.TASK_TABLE_INIT.columns);
        this.taskTable.getRdbStore(callback);
    }
    // test() { this.cateTable.test() }
    getRdbStore(callback = () => { }) {
        this.taskTable.getRdbStore(callback);
    }
    updateColumns(newColumn, newColumnType) {
        let newColumnData = '';
        switch (newColumnType) {
            case 'double':
                newColumnData = 'INTEGER';
                break;
            case 'string':
                newColumnData = 'TEXT';
                break;
            case 'boolean':
                newColumnData = 'BOOLEAN';
            default:
                newColumnData = 'INTEGER';
        }
        Logger.debug(`UpdateColumns: ${newColumn} ${newColumnData}`);
        this.taskTable.updateColumns(newColumn, newColumnData);
    }
    insertData(taskData, callback) {
        const valueBucket = generateBucket(taskData);
        this.taskTable.insertData(valueBucket, callback);
    }
    deleteData(taskData, callback) {
        let predicates = new relationalStore.RdbPredicates(CommonConstants.TASK_TABLE_INIT.tableName);
        predicates.equalTo('id', taskData.id);
        this.taskTable.deleteData(predicates, callback);
    }
    updateData(taskData, callback) {
        const valueBucket = generateBucket(taskData);
        let predicates = new relationalStore.RdbPredicates(CommonConstants.TASK_TABLE_INIT.tableName);
        predicates.equalTo('id', taskData.id);
        this.taskTable.updateData(predicates, valueBucket, callback);
    }
    // supports concrete index
    // query_deprecated(task_name: string, callback: Function, isAll: boolean = true) {
    //   let predicates = new relationalStore.RdbPredicates(CommonConstants.TASK_TABLE_INIT.tableName)
    //   Logger.debug(`TaskTable predicates = ${JSON.stringify(predicates)}`)
    //   Logger.debug(`TaskTable taskname: ${task_name}`)
    //   if (!isAll) predicates.like('task_name', task_name)
    //   this.cateTable.queryTaskName(predicates, (resultSet: relationalStore.ResultSet) => {
    //     let count: number = resultSet.rowCount
    //     Logger.debug(`TaskTable number: ${count}`)
    //     if (count === 0 || typeof count === 'string') {
    //       // empty
    //       callback([])
    //     } else {
    //       resultSet.goToFirstRow()
    //       // get results
    //       const result: TaskData[] = []
    //       for (let i = 0; i < count; ++i) {
    //         let tmp: TaskData = {
    //           id: 0, task_name: '', subject: 0, due_date_stamp: 0
    //         }
    //         tmp.id = resultSet.getDouble(resultSet.getColumnIndex('id'))
    //         tmp.task_name = resultSet.getString(resultSet.getColumnIndex('task_name'))
    //         tmp.subject = resultSet.getDouble(resultSet.getColumnIndex('subject'))
    //         tmp.due_date_stamp = resultSet.getDouble(resultSet.getColumnIndex('due_date'))
    //         result[i] = tmp
    //         resultSet.goToNextRow()
    //       }
    //       callback(result)
    //     }
    //   })
    // }
    queryTaskName(task_name, callback, isAll = true) {
        let submit = new TaskListItemData();
        submit.task_name = task_name;
        this.basic_query("task_name", submit, callback, isAll);
        // this.query_dup(task_name, callback, isAll)
    }
    // supports multiple type all-in-one
    basic_query(query_type, queryData, callback, isAll = true) {
        Logger.debug(`TaskTable query_type: ${query_type}, query_data: ${JSON.stringify(queryData)}, visit: ${queryData[query_type]}`);
        let predicates = new relationalStore.RdbPredicates(CommonConstants.TASK_TABLE_INIT.tableName);
        if (!isAll) {
            if (CommonConstants.COLUMN_TYPE[query_type] == 'string')
                predicates.like(query_type, queryData[query_type]);
            else
                predicates.equalTo(query_type, queryData[query_type]);
        }
        this.taskTable.query(predicates, (resultSet) => {
            let count = resultSet.rowCount;
            Logger.debug(`TaskTable number: ${count}`);
            if (count === 0 || typeof count === 'string') {
                // empty
                callback([]);
            }
            else {
                resultSet.goToFirstRow();
                // get results
                const result = [];
                for (let i = 0; i < count; ++i) {
                    let tmp = new TaskListItemData();
                    for (let t = 0; t < CommonConstants.TASK_TABLE_INIT.columns.length; ++t) {
                        let nowColumn = CommonConstants.TASK_TABLE_INIT.columns[t];
                        let nowIndex = resultSet.getColumnIndex(nowColumn);
                        switch (CommonConstants.COLUMN_TYPE[nowColumn]) {
                            case 'double':
                                tmp[nowColumn] = resultSet.getDouble(nowIndex);
                                break;
                            case 'string':
                                tmp[nowColumn] = resultSet.getString(nowIndex);
                                break;
                            case 'boolean':
                                tmp[nowColumn] = Boolean(resultSet.getDouble(nowIndex));
                        }
                        Logger.debug(`TaskTable READING: nowC = ${nowColumn}, data = ${tmp[nowColumn]}`);
                    }
                    result[i] = tmp;
                    Logger.debug(`TaskTable Reading DATA: ${JSON.stringify(tmp)}`);
                    resultSet.goToNextRow();
                }
                callback(result);
            }
        });
    }
}
function generateBucket(taskData) {
    let obj = {};
    for (let i = 1; i < CommonConstants.TASK_TABLE_INIT.columns.length; ++i) {
        let nowCol = CommonConstants.TASK_TABLE_INIT.columns[i];
        obj[nowCol] = taskData[nowCol];
    }
    return obj;
}
//# sourceMappingURL=TaskTable.js.map