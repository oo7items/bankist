'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2021-10-04T16:00:00.000Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const createUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // 格式化日期
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // 格式化国际日期
    const fomrmatMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
        <div class="movements__row"> 
          <div class="movements__type movements__type--${type}">${
      i + 1
    } deposit</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${fomrmatMov}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const formatMovementDate = function (date, locale) {
  // 日期逻辑
  // (date2 - date1) => 59205286934(时间戳) / (1000 * 60 * 60 * 24) => 过了多少天? (number)
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDaysPassed(new Date(), date);
  if (dayPassed === 0) return 'Today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed < 7) return `${dayPassed} days ago`;

  // 格式化日期
  // const year = date.getFullYear();
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // return `${year}/${month}/${day}`;

  // 格式化国际日期
  return new Intl.DateTimeFormat(locale).format(date);
};

const updateUI = function (acc) {
  displayMovement(acc);
  calcDisplaySummary(acc);
  calcDisplayBalance(acc);
};

let currentAccount, timer;
// 用户登录
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  // 登录对象
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  // 验证登录
  if (currentAccount?.pin === Number(inputLoginPin.value))
    // 更新UI
    updateUI(currentAccount);
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(' ')[0]
  }`;
  containerApp.style.opacity = 100;

  // 删除计时器(防止计时器重叠)
  if (timer) clearInterval(timer);

  // 更新计时器
  startLogOutTimer();

  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();

  /*
  // 格式化日期
  const date = new Date();
  const year = date.getFullYear();
  // 获取 时间属性 的值 为数字类型 需要转换为 字符串
  const month = `${date.getMonth() + 1}`.padStart(2, 0); // 月份是从0开始计算
  const day = `${date.getDate()}`.padStart(2, 0);
  const hour = `${date.getHours()}`.padStart(2, 0);
  const min = `${date.getMinutes()}`.padStart(2, 0);
  labelDate.textContent = `${year}/${month}/${day}, ${hour}:${min}`;
  */

  // 格式化国际日期
  const now = new Date();
  const options = {
    hour: 'numeric', // 数字类型
    minute: 'numeric',
    day: '2-digit',
    month: '2-digit', // 两位数字
    year: 'numeric',
    // weekday: 'long'
  };
  // 语言环境 = 航海家.语言
  const locale = navigator.language;
  console.log(locale);
  // 国际.日期时间格式('国家', 选项).格式(日期)
  labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
});

// 计时器
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    // 59 % 60 = 59
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearTimeout(tick);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };

  let time = 60;
  tick();
  timer = setInterval(tick, 1000);
  return timer;
};

// 格式化国际数字
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency', // 货币
    currency: currency,
  }).format(value);
};

// 账单概括
const calcDisplaySummary = function (acc) {
  // 收入和支出
  // 创建和填充数组的更多方法？
  const { income, out } = acc.movements.reduce(
    (nums, cur) => {
      nums[cur > 0 ? 'income' : 'out'] += cur;
      return nums;
    },
    {
      income: 0,
      out: 0,
    }
  );
  // 利息
  // (收入 * 银行利率) / 100
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * currentAccount.interestRate) / 100)
    .filter(int => int > 1)
    .reduce((acc, int) => acc + int, 0);
  // 格式化数字
  // labelSumIn.textContent = `${income.toFixed(2)}€`;
  // labelSumOut.textContent = `${out.toFixed(2)}€`;
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;

  // 格式化国际数字
  labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};
/*
  点和中括号的区别
  1.点方法后面跟的必须是一个指定的属性名称，中括号里面可以是变量
  2.中括号里面的属性可以是数字，点方法后面的属性名不能是数字
  3.动态为对象添加属性是，只能用中括号
*/

// 账户余额
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// 银行转账
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // 收款人账号
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const amount = inputTransferAmount.value;

  // 1. 转账账号存在且不是自己
  // 2. 转账金额大于0
  // 3. 账户金额大于或等于转账金额
  if (receiverAcc?.username != currentAccount.username && amount > 0) {
    setTimeout(function () {
      // 添加金额
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      // 添加日期
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 3000);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

// 银行贷款
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  // 1. 贷款金额大于 0
  // 2. 账户单笔金额大于贷款金额百分之10
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

//  关闭用户
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const index = accounts.findIndex(
    acc => acc.username === currentAccount.username
  );
  if (
    currentAccount?.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

// 账单排序
let sort = false;
btnSort.addEventListener('click', function () {
  displayMovement(currentAccount, !sort);
  sort = !sort;
});

/*
// 异步js
console.log('wating...');
setTimeout(() => {
  console.log('Here is your pizza🍕');
});

// 添加变量
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  'olives',
  'spinach'
);

// 将变量提取出来
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log('wating...');

// 取消计时器
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// 重复计时时钟
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/
/*
// 1. 判断狗狗是否成年
const checkDogs = function (dogsJulia, dogsKate) {
  const dogsJuliaCorrected = dogsJulia.slice();
  dogsJuliaCorrected.splice(0, 1);
  dogsJuliaCorrected.splice(-2);
  const dogs = dogsJuliaCorrected.concat(dogsKate);

  dogs.forEach(function (dog, i) {
    if (dog >= 3) {
      console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};
// 2. 狗狗人类年龄转换
const calcAverageHumanAge = function (ages) {
  const humanAges = ages.map(age => (age <= 2 ? age * 2 : 16 + age * 4));
  const adults = humanAges.filter(age => age > 18);

  const average = adults.reduce(
    // i 参数不能跳过
    (acc, age, i, arr) => acc + age / arr.length,
    0
  );

  return average;
};

const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
console.log(avg1, avg2);

// 3. 链接重构狗狗函数
const calcAverageHumanAge = function (ages) {
  const average = ages
    .map(age => (age <= 2 ? age * 2 : 16 + age * 4))
    .filter(age => age > 18)
    .reduce(
      // i 参数不能跳过
      (acc, age, i, arr) => acc + age / arr.length,
      0
    );
  return average;
};
const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
console.log(avg1, avg2);
*/

// 4. 狗狗推荐食物函数
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 正常食物量
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));

const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(
  `Sarah's dog is eating too ${
    dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
  }`
);

// 过滤一个新数组包含两个对象
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);

console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!'`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!'`);
