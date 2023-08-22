
//pagination
let currentPage = 1;
let unpaidcureentpage = 1
let biilsPerPages
let billsData = []

async function handelAdminLogin() {
    let phone = $('#phone').val().replace(/\s+/g, ' ').trim();
    let password = $('#password').val().trim();

    try {
        let loginData = await $.post(`http://localhost:3023/auth/signin/admin`, { phone: phone, password: password });
        sessionStorage.setItem('user_id', loginData.user.user_id)
        sessionStorage.setItem('session_id', loginData.user.session_id)
        window.location.href = `http://localhost:3023/dashboard`
    } catch ({ responseJSON: { message } }) {
        $('#helperText').text(message)
    }
}

async function getAdminUser() {
    let adminUser = await $.get(`http://localhost:3023/users/${sessionStorage.getItem('user_id')}?session_id=${sessionStorage.getItem('session_id')}`)
    let { user: [{ user_id, user_name, user_phone }] } = adminUser;
    $('#adminname').text(user_name)
    $('#adminphone').text(user_phone)
}

async function getAllBills() {
    $('#usersTable').removeClass('container ').addClass('container d-none')
    $('#billsTbale').removeClass('container d-none ').addClass('container ')
    $('#pagenationcontainer').removeClass('d-none')
    $('#getallbillsmenu').addClass('activesidebar')
    $('#getallunpaidbillsmenu').removeClass('activesidebar')
    $('#usersmenu').removeClass('activesidebar')
    let session_id = sessionStorage.getItem('session_id')

    try {

        let allBills = await $.get(`http://localhost:3023/bills?session_id=${session_id}`);
        const { bills } = allBills;
        billsData = bills
        let billsPerPage = 15;
        let numberOfTotalPages = Math.ceil(billsData.length / billsPerPage);
        biilsPerPages = numberOfTotalPages
        let pageNumbers = [...Array(numberOfTotalPages + 1).keys()].slice(1);
        let indexOfLastBill = currentPage * billsPerPage;
        let indexOfFirstBill = indexOfLastBill - billsPerPage;
        let visibleBills = billsData.slice(indexOfFirstBill, indexOfLastBill);

        if (billsData) {
            let billsHTML = await Promise.all(visibleBills.map(async (bill) => {
                let billHTML = `
                                <tr>
                                    <td>${bill.bill_id}</td>
                                    <td>${bill.user_id}</td>
                                    <td>${bill.meter_num}</td>
                                    <td>${bill.bill_generated_date}</td>
                                    <td>${bill.bill_due_date}</td>
                                    <td>${bill.consumption_units} units</td>
                                    <td>${bill.amount_due}/- RS.</td>
                                    <td>${bill.paid_status === 1 ? `${bill.paid_date}` : 'not paid'}</td>
                                </tr>
                            `;
                return billHTML;
            }))
            let dynamicBillsHTML = billsHTML.join('');
            $('#table-body').html(dynamicBillsHTML);
        }
        let pages = pageNumbers.map((page) => {
            let pageNumberHTML = `<span class="spanm ${currentPage === page ? 'active' : ""}" onclick="handelPageNumber(${page})">${page}</span>`
            return pageNumberHTML;
        })
        let pagesHTML = `<span class="spanm mx-1" onclick="handelPrevious()">prev</span>` + pages.join('') + `<span class="spanm mx-1" onclick="habdelNext()">next</span>`;
        $('#pagenationcontainer').html(pagesHTML)
    } catch (error) {
        console.log(error)
        window.location = `http://localhost:3023/adminlogin`
    }
}

async function getAllUnpaidBills() {
    $('#usersTable').removeClass('container ').addClass('container d-none')
    $('#billsTbale').removeClass('container d-none ').addClass('container ')
    $('#pagenationcontainer').removeClass('d-none')
    // $('#getallbillsmenu').removeClass('activesidebar')
    // $('#getallunpaidbillsmenu').addClass('activesidebar')
    // $('#usersmenu').removeClass('activesidebar')
    let session_id = sessionStorage.getItem('session_id')

    try {

        let allUnpaidBills = await $.get(`http://localhost:3023/bills/unpaid?session_id=${session_id}`);
        const { bills } = allUnpaidBills;
        billsData = bills
        let billsPerPage = 15;
        let numberOfTotalPages = Math.ceil(billsData.length / billsPerPage);
        biilsPerPages = numberOfTotalPages
        let pageNumbers = [...Array(numberOfTotalPages + 1).keys()].slice(1);
        let indexOfLastPage = unpaidcureentpage * billsPerPage;
        let indexOfFirstPage = indexOfLastPage - billsPerPage;
        let visibleBills = billsData.slice(indexOfFirstPage, indexOfLastPage);

        if (billsData) {
            let billsHTML = await Promise.all(visibleBills.map(async (bill) => {
                let billHTML = `
                                <tr>
                                    <td>${bill.bill_id}</td>
                                    <td>${bill.user_id}</td>
                                    <td>${bill.meter_num}</td>
                                    <td>${bill.bill_generated_date}</td>
                                    <td>${bill.bill_due_date}</td>
                                    <td>${bill.consumption_units} units</td>
                                    <td>${bill.amount_due}/- RS.</td>
                                    <td>${bill.paid_status === 1 ? `${bill.paid_date}` : 'not paid'}</td>                
                                </tr>
                            `;
                return billHTML;
            }))
            let dynamicBillsHTML = billsHTML.join('');
            $('#table-body').html(dynamicBillsHTML);
        }
        let pages = pageNumbers.map((page) => {
            let pageNumberHTML = `<span class="spanm ${unpaidcureentpage === page ? 'active' : ""}" onclick="handelUnapidPageNumber(${page})">${page}</span>`
            return pageNumberHTML;
        })
        let pagesHTML = `<span class="spanm mx-1" onclick="handelUndapidPrevious()">prev</span>` + pages.join('') + `<span class="spanm mx-1" onclick="habdelUnapidNext()">next</span>`;
        $('#pagenationcontainer').html(pagesHTML)

    } catch (error) {
        console.log(error)
        window.location = `http://localhost:3023/adminlogin`
    }
}

async function handelUnpaidFor3Months() {
    $('#billsTbale').removeClass('container ').addClass('container d-none')
    $('#usersTable').removeClass('container d-none ').addClass('container')
    $('#pagenationcontainer').addClass('d-none')
    // $('#getallbillsmenu').removeClass('activesidebar')
    // $('#getallunpaidbillsmenu').removeClass('activesidebar')
    // $('#usersmenu').addClass('activesidebar')

    let session_id = sessionStorage.getItem('session_id');

    try {
        let unpaidFor3Months = await $.get(`http://localhost:3023/unpaidfor3monts?session_id=${session_id}`)
        let { notPaidUsers } = unpaidFor3Months
        if (notPaidUsers) {
            let unpaidUsers = await Promise.all(notPaidUsers.map(async (user) => {
                let userHtml = `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.user_name}</td>
                    <td>${user.user_phone}</td>
                    <td>${user.user_type}</td>
                    <td>${user.block_status}</td>
                    <td>${user.pending}</td>
                    <td>
                    ${user.block_status === 0 ?
                        `<input type="button" value="Block" class="btn btn-danger" onclick="handelBlockUser(${user.user_id}, '${user.user_name}')"></input>`
                        :
                        `<input type = "button" value ="Unblock" class="btn btn-warning" onclick ="handelUnBlockUser(${user.user_id}, '${user.user_name}')"></input>`
                    }
                    </td >                
                </tr >
                `
                return userHtml
            }))
            let usersHTML = unpaidUsers.join('');
            $('#table-body-user').html(usersHTML)
        }
    } catch (error) {
        console.log(error);
        window.location = `http://localhost:3023/adminlogin`
    }

}

function handelUnapidPageNumber(pagenummber) {
    unpaidcureentpage = pagenummber
    getAllUnpaidBills()
}

function handelUndapidPrevious() {
    if (unpaidcureentpage > 1) {
        unpaidcureentpage--;
        getAllUnpaidBills()
    }
}

function habdelUnapidNext() {
    if (unpaidcureentpage < biilsPerPages) {
        unpaidcureentpage++;
        getAllUnpaidBills()
    }
}

function handelPageNumber(pagenummber) {
    currentPage = pagenummber
    getAllBills()
}

function habdelNext() {
    if (currentPage < biilsPerPages) {
        currentPage++;
        getAllBills()
    }
}

function handelPrevious() {
    if (currentPage > 1) {
        currentPage--;
        getAllBills()
    }
}

function handelGenerateBill() {
    window.location.href = `http://localhost:5000/`
}

async function handelBlockUser(user_id, user_name) {
    let block = confirm(`Do you want to block ${user_name}`)
    if (block) {
        try {
            let session = sessionStorage.getItem('session_id')
            await $.post(`http://localhost:3023/block/1/${user_id}?session_id=${session}`)
            handelUnpaidFor3Months()
        } catch (error) {
            window.location = `http://localhost:3023/adminlogin`
        }
    }
}

async function handelUnBlockUser(user_id, user_name) {
    let unBlock = confirm(`Do you want to unblock ${user_name}`)
    if (unBlock) {
        try {
            let session = sessionStorage.getItem('session_id')
            await $.post(`http://localhost:3023/block/0/${user_id}?session_id=${session}`)
            handelUnpaidFor3Months()
        } catch (error) {
            window.location = `http://localhost:3023/adminlogin`
        }
    }
}

function handelLogout(session, user) {
    try {
        let logout = confirm('Are sure. Do you want to logout')
        if (logout) {
            $.post(`http://localhost:3023/logout?session_id=${session}&user_id=${user}`)
            sessionStorage.clear();
            window.location.href = `http://localhost:3023/adminlogin`
        }
    } catch (error) {
        console.log(error)
        window.location = `http://localhost:3023/adminlogin`
    }
}



{/* <td><input type="button" class="btn btn-danger" value="Block"></input></td>  */ }