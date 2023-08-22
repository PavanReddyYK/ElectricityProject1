const { dbConnection } = require('../shared/mysql');

const getTableDataById = (data, callbackById) => {
    let { select_data, table_name, condition_data } = data;
    let sqlQuery = `SELECT ${select_data} FROM ${table_name} ${condition_data}`;

    dbConnection.query(sqlQuery, ((errorByIdData, dataByIdResult) => {
        if (errorByIdData) {
            throw (errorByIdData)
        } else {
            callbackById(dataByIdResult)
        }
    }))
}

let inserSession = (data, callback) => {
    let { table_name, session_values } = data;
    let insertSessionSqlQuery = `INSERT INTO ${table_name} VALUES (${session_values})`

    dbConnection.query(insertSessionSqlQuery, ((errorUploadingSession, sessionUplaodResult) => {
        if (errorUploadingSession) {
            throw errorUploadingSession;
        } else {
            callback(sessionUplaodResult)
        }
    }))
}

let blockHelper = async (data, callback) => {
    let { table_name, new_data, condition_data } = data;
    let blockSqlQuery = `UPDATE ${table_name} SET ${new_data} ${condition_data}`

    dbConnection.query(blockSqlQuery, ((errorBlockingUser, blockingUserResult) => {
        if (errorBlockingUser) {
            throw errorBlockingUser
        } else {
            callback(blockingUserResult)
        }
    }))
}

let unpaidFor3Months = (data, callback) => {

    let { select_data, table_name, table_name2 } = data
    let sqlQuery = `SELECT ${table_name}.${select_data}, status.pending FROM ${table_name}, (SELECT (COUNT(paid_status)-SUM(paid_status)) AS pending, user_id FROM ${table_name2} group BY user_id) AS status WHERE ${table_name}.user_id=status.user_id AND status.pending>=3`

    dbConnection.query(sqlQuery, ((errordata, responseData) => {
        if (errordata) {
            throw errordata
        } else {
            callback(responseData)
        }
    }))
}

let logoutHelper = (data, callback) => {
    let { table_name, condition_data } = data;
    let logoutSQL = `DELETE FROM ${table_name} WHERE ${condition_data}`

    dbConnection.query(logoutSQL, (logOutError, logoutSuccess) => {
        if (logOutError) {
            throw logOutError
        } else {
            callback(logoutSuccess)
        }
    })
}

//this is ofr bills insertion to db using forloop
// const sampleBillInserter = async (data, callback) => {
//     let { table_name, bills } = data
//     for (let i = 0; i < bills.length; i++) {
//         let sqlQuery = `INSERT INTO ${table_name} VALUES ('${bills[i].bill_id}',${bills[i].user_id}, ${bills[i].meter_num}, '${bills[i].bill_generated_date}','${bills[i].bill_due_date}',${bills[i].consumption_units},${bills[i].amount_due},${bills[i].paid_status},'${bills[i].paid_date}')`
//         try {
//             const insertResult = await dbConnection.query(sqlQuery);
//             console.log("Insert success:", insertResult);
//         } catch (insertError) {
//             console.error("Error inserting data:", insertError);
//         }
//     }
// }

module.exports = {
    blockHelper,
    getTableDataById,
    inserSession,
    logoutHelper,
    unpaidFor3Months
}
// module.exports = { getTableData, sampleBillInserter, getTableDataById, inserSession }