const { v4: uuid } = require('uuid');

const {
    blockHelper,
    getTableDataById,
    inserSession,
    logoutHelper,
    unpaidFor3Months
} = require('../helpers/helper');

//users table
const getUsersTable = async (req, res) => {
    let usersData = {
        select_data: '*',
        table_name: 'user_info'
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, async (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            return await res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                getTableDataById(usersData, async (usersTableResult) => {
                    await res.json({ users: usersTableResult })
                })
            } else {
                res.status(401).json({ message: "session expired " })
            }
        }
    })
}

//user by id
const getUserByIdTable = (req, res) => {
    let billByIdData = {
        select_data: "*",
        table_name: 'user_info',
        condition_data: `WHERE user_id=${req.params.userid}`
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                getTableDataById(billByIdData, (dataById) => {
                    if (dataById.length === 0) {
                        res.status(400).json({ message: "user not found" })
                    } else {
                        delete dataById[0].user_password
                        res.json({ user: dataById })
                    }
                })
            } else {
                res.status(401).json({ message: "session expired " })
            }
        }
    })
}

//get all bills
const getBillsTable = (req, res) => {
    let billsData = {
        select_data: "*",
        table_name: "bill_info"
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                getTableDataById(billsData, (billsTableResult) => {
                    res.json({ bills: billsTableResult })
                })
            } else {
                res.status(401).json({ message: "session expired!.. " })
            }
        }
    })
}

const getUnpaidBillsTable = (req, res) => {
    let billsData = {
        select_data: "*",
        table_name: "bill_info",
        condition_data: `WHERE paid_status=${0}`
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                getTableDataById(billsData, (billsTableResult) => {
                    res.json({ bills: billsTableResult })
                })
            } else {
                res.status(401).json({ message: "session expired!.. " })
            }
        }
    })
}

//biils by user id
const getBillByIdTable = (req, res) => {
    let billByIdData = {
        select_data: "*",
        table_name: 'bill_info',
        condition_data: `WHERE user_id=${req.params.userid}`
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                getTableDataById(billByIdData, (dataById) => {
                    if (dataById.length === 0) {
                        res.status(400).json({ message: "bills not found" })
                    } else {
                        res.json({ bill: dataById })
                    }
                })
            } else {
                res.status(401).json({ message: "session expired!.. " })
            }
        }
    })
}

//login only for admin
let logincontroller = (req, res) => {
    let { phone, password } = req.body
    let bodyData = {
        select_data: '*',
        table_name: 'user_info',
        condition_data: `WHERE user_phone='${phone}' AND user_password='${password}'`
    }
    let session = uuid();

    getTableDataById(bodyData, async (loginResponse) => {
        if (loginResponse.length === 0) {
            await res.status(401).json({ message: "Incorrect phone or password" })
        } else {
            if (loginResponse.length > 1) {
                await res.status(401).json({ message: "Multiple users found. Contact the admin" })
            } else {
                if (loginResponse[0].user_type === 'consumer') {
                    await res.status(401).json({ message: "You are an consumer. Login throught consumer page" })
                }
                else if(loginResponse[0].user_type === 'admin'){
                    if (loginResponse[0].block_status === 1) {
                        await res.status(402).json({ message: "Too many bills are pending pay the bills and login" })
                    } else {
                        let sessionValidationData = {
                            select_data: '*',
                            table_name: "session_info",
                            condition_data: `WHERE user_id=${loginResponse[0].user_id}`
                        }
                        getTableDataById(sessionValidationData, async (sessionValidationResponse) => {
                            if (sessionValidationResponse.length === 0) {
                                let sessionData = {
                                    table_name: 'session_info',
                                    session_values: `'${session}', ${loginResponse[0].user_id}`
                                }

                                inserSession(sessionData, async (sessionUploadingResponse) => {
                                    await res.json({ user: { session_id: session, user_id: loginResponse[0].user_id } })
                                })
                            } else if (sessionValidationResponse.length === 1) {
                                await res.json({ user: sessionValidationResponse[0] })
                            }
                        })
                    }
                }
            }
        }
    })
}

let logOutController = (req, res) => {
    let { user_id, session_id } = req.query
    let logOutData = {
        table_name: 'session_info',
        condition_data: `user_id=${user_id}`
    }

    logoutHelper(logOutData, (logOutSuccess) => {
        if (logOutSuccess.affectedRows === 0) {
            res.json({ message: "error while logging out" })
        } else {
            res.json({ message: "logout success" })
        }
    })
}

let createUser = async (req, res) => {
    let { user_id, user_name, user_address, user_phone, user_password, user_type, block_status } = req.body;
    let userData = {
        table_name: 'user_info',
        session_values: `${user_id}, '${user_name}',' ${user_address}', '${user_phone}', '${user_password}', '${user_type}', ${block_status}`
    }

    inserSession(userData, async (createUserResponse) => {
        if (createUserResponse.affectedRows === 1) {
            await res.status(201).json({ message: "user created" })
        } else {
            await res.status(500).json({ message: "error creating user" })
        }
    })
}

//blocking users
let blockUser = async (req, res) => {
    let { blockStatus, userid } = req.params

    let blockUserData = {
        table_name: "user_info",
        new_data: `block_status=${parseInt(blockStatus)}`,
        condition_data: `WHERE user_id=${userid}` 
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, async (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            return await res.status(401).json({ message: "session expired" })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                blockHelper(blockUserData, async (userBlockResponse) => {
                    if (userBlockResponse.affectedRows === 1) {
                        return await res.json({ message: `${parseInt(blockStatus) === 1 ? 'blocked' : 'unblocked'}` })
                    }
                })
            } else {
                return await res.status(401).json({ message: "session expired" })
            }
        }
    })
}

let getUsersWhoNotPaidBillsFor3Months = async (req, res) => {

    let data = {
        select_data: '*',
        table_name: "user_info",
        table_name2: "bill_info"
    }
    let sessionValData = {
        select_data: '*',
        table_name: 'session_info',
        condition_data: `WHERE session_id='${req.query.session_id}'`
    }

    getTableDataById(sessionValData, async (sessionValResponse) => {
        if (sessionValResponse.length === 0) {
            await res.status(401).json({ message: "session expired!.. " })
        } else {
            if (sessionValResponse[0].session_id === req.query.session_id) {
                unpaidFor3Months(data, async (responseData) => {
                    if (responseData) {
                        if (responseData.length === 0) {
                            await res.status(500).json({ message: 'error getting users who are unpaid bills for 3 months' })
                        } else {
                            res.json({ notPaidUsers: responseData })
                        }
                    } else {
                        await res.status(500).json({ message: 'error getting users who are unpaid bills for 3 months' })
                    }
                })
            } else {
                await res.status(401).json({ message: "session expired " })
            }
        }
    })
}

module.exports = {
    blockUser,
    createUser,
    getBillByIdTable,
    getBillsTable,
    getUnpaidBillsTable,
    getUsersWhoNotPaidBillsFor3Months,
    getUserByIdTable,
    getUsersTable,
    logincontroller,
    logOutController
}
// module.exports = { getUsersTable, getBillsTable, uploadSampleBillData, getBillByIdTabel, getUserByIdTabel, logincontroller }
// let query = `SELECT user_info.*, status.pending FROM user_info, ( SELECT count(paid_status)-sum(paid_status) as pending, user_id from electricity_bills
// group by user_id) as status
// WHERE  user_info.user_id =status.user_id and status.pending>=3`

// let sqlQuery = `SELECT ${table_name}.${select_data}, status.pending FROM ${table_name}, (SELECT COUNT(paid_status)-SUM(paid_status)) AS pending, user_id FROM ${table_name2}
// group BY user_id) AS status WHERE ${table_name}.user_id=status.user_id AND status.pending>=3`

//load bills to table
// const uploadSampleBillData = async (req, res) => {
//     let dataBundle = {
//         table_name: "bill_info",
//         bills: bills
//     }

//     try {
//         await sampleBillInserter(dataBundle);
//         res.json({ message: "Data inserted successfully" });
//     } catch (error) {
//         console.error("Error uploading sample data:", error);
//         res.status(500).json({ error: "Error uploading sample data" });
//     }
// }

// const { bills } = require('../bills.json');

// const { getTableData, sampleBillInserter, getTableDataById, inserSession } = require('../helpers/helper');
